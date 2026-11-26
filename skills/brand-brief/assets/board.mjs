#!/usr/bin/env node
// A round of visual questions, shown as a clickable board, and its votes brought back.
//   node board.mjs serve  <brief-dir> <round> [--port n] [--minutes n]   serve it locally; exits when the user clicks Done
//   node board.mjs build  <brief-dir> <round> [out.html]                 one file, images embedded; ends on a code to paste
//   node board.mjs decode <brief-dir> <round> "<code>"                   read a pasted code
// All three end the same way: rounds/<round>.votes.json is written and merged into brief.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readBrief, writeBrief, loadRound, pageRound, roundPath, decode, record } from './lib/schema.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };

/** The board page for a round. `<` is escaped so that a name can never close the script block. */
export function page(pageData) {
  return readFileSync(join(here, 'board.html'), 'utf8').replace('__ROUND__', () => JSON.stringify(pageData).replace(/</g, '\\u003c'));
}

/** The same page with every image embedded, for where no local server can be reached. */
export function buildSingle(dir, round) {
  const data = pageRound(round);
  const embed = (it) => {
    const type = MIME[extname(it.src).toLowerCase()];
    if (!type) throw new Error(`${it.src}: not an image type the board can embed`);
    it.src = `data:${type};base64,${readFileSync(join(dir, it.src)).toString('base64')}`;
  };
  for (const s of data.steps) (s.type === 'swipe' ? s.items : s.pairs.flatMap((p) => [p.a, p.b])).forEach(embed);
  return page(data);
}

/** Write the votes file and merge it into brief.json. */
export function save(dir, round, code) {
  const votes = decode(round, code);
  writeFileSync(roundPath(dir, round.id, 'votes.json'), JSON.stringify(votes, null, 2) + '\n');
  writeBrief(dir, record(readBrief(dir), votes));
  return votes;
}

/** A reading of the votes short enough to act on at once. */
export function summary(votes) {
  const by = (v) => votes.answers.filter((a) => a.kind === 'swipe' && a.verdict === v).map((a) => a.name + (a.attributes.length ? ` (${a.attributes.join('; ')})` : ''));
  const L = [];
  for (const [v, label] of [['for_us', 'Speaks to them'], ['liked_not_for_us', 'Liked, not for them'], ['never', 'Not at all'], ['unknown', 'Did not know'], ['skipped', 'Skipped']]) {
    if (by(v).length) L.push(`${label}: ${by(v).join(', ')}`);
  }
  for (const a of votes.answers.filter((x) => x.kind === 'duel')) {
    const res = a.choice === 'a' ? a.names[0] : a.choice === 'b' ? a.names[1] : a.choice;
    L.push(`${a.names[0]} / ${a.names[1]}: ${res}${a.attributes.length ? ` (${a.attributes.join('; ')})` : ''}`);
  }
  if (votes.note) L.push(`Note: "${votes.note}"`);
  return L.join('\n');
}

export function serve(dir, round, { port = 0, minutes = 30 } = {}) {
  const root = resolve(dir);
  return new Promise((done, fail) => {
    const srv = createServer((req, res) => {
      const path = decodeURIComponent((req.url || '/').split('?')[0]);
      if (req.method === 'POST' && path === '/votes') {
        let body = '';
        req.on('data', (c) => { body += c; if (body.length > 1e5) req.destroy(); });
        req.on('end', () => {
          try { const votes = save(dir, round, body); res.end('ok'); srv.close(); clearTimeout(timer); done(votes); }
          catch (e) { res.statusCode = 400; res.end(String(e.message)); }
        });
      } else if (path === '/') {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(page({ ...pageRound(round), post: '/votes' }));
      } else {
        const file = resolve(root, '.' + path);
        try {
          if (!file.startsWith(root + sep) || !MIME[extname(file).toLowerCase()]) throw new Error('outside');
          const buf = readFileSync(file);
          res.setHeader('content-type', MIME[extname(file).toLowerCase()]); res.end(buf);
        } catch { res.statusCode = 404; res.end(); }
      }
    });
    const timer = setTimeout(() => { srv.close(); fail(new Error(`no answer after ${minutes} minutes. The round is unchanged; serve it again or use build.`)); }, minutes * 60000);
    srv.on('error', fail);
    srv.listen(port, '127.0.0.1', () => console.log(`Board for round ${round.id}: http://127.0.0.1:${srv.address().port}/`));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, dir, id, ...rest] = process.argv.slice(2);
  const flag = (name) => { const i = rest.indexOf(`--${name}`); return i < 0 ? undefined : Number(rest[i + 1]); };
  try {
    if (!['serve', 'build', 'decode'].includes(cmd) || !dir || !id) throw new Error('usage: board.mjs serve|build|decode <brief-dir> <round> [...]');
    const round = loadRound(dir, id);
    if (cmd === 'build') {
      const out = rest[0] || roundPath(dir, id, 'html');
      writeFileSync(out, buildSingle(dir, round));
      console.log(`Wrote ${out}. Send it to the user; it ends on a code to paste back, then: board.mjs decode ${dir} ${id} "<code>"`);
    } else {
      const votes = cmd === 'decode' ? save(dir, round, rest[0] || '') : await serve(dir, round, { port: flag('port') || 0, minutes: flag('minutes') || 30 });
      console.log(`Votes for round ${id}, recorded in brief.json:\n${summary(votes)}`);
    }
  } catch (e) { console.error(e.message); process.exit(1); }
}
