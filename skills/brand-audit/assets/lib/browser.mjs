// Chromium helpers. Playwright is resolved from the environment (NODE_PATH or a local
// node_modules), never vendored: `npm i playwright && npx playwright install chromium` if missing.
import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

export const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export async function launch() {
  let chromium;
  // Look where a user is likely to have installed it: beside the skill, in the project they run from, or on NODE_PATH.
  for (const from of [require, createRequire(join(process.cwd(), 'noop.js'))]) {
    try { ({ chromium } = from('playwright')); break; } catch { /* try the next place */ }
  }
  if (!chromium) throw new Error('playwright not found. In your project folder, run: npm i playwright && npx playwright install chromium');
  try { return await chromium.launch(); }
  catch (e) {
    try { return await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); }
    catch { throw e; }
  }
}

/**
 * Re-encode an image buffer (PNG, JPEG, WebP) as WebP, scaled to fit maxW x maxH.
 * `page` is any open page; it is only used for its canvas.
 */
export async function saveWebp(page, buffer, outPath, maxW = 1600, maxH = maxW) {
  const b64 = buffer.toString('base64');
  const out = await page.evaluate(async ({ b64, maxW, maxH }) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const bmp = await createImageBitmap(new Blob([bytes]));
    const k = Math.min(1, maxW / bmp.width, maxH / bmp.height);
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(bmp.width * k));
    c.height = Math.max(1, Math.round(bmp.height * k));
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.8).split(',')[1];
  }, { b64, maxW, maxH });
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, Buffer.from(out, 'base64'));
}

/** Launch Chromium once and say whether it works. Used by `capture.mjs --check`. */
export async function probe() {
  const b = await launch();
  const v = b.version();
  await b.close();
  return v;
}
