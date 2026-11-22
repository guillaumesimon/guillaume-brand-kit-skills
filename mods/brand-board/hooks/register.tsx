import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Board, Swatch } from '../types'

const PANE = 'brand-board'
const TOOL = 'mcp__brand-board__show'
const board = atom({ plugin: 'brand-board', key: 'board' } as const, null, {
  shape: 'board-1',
})

const HEX = /^#[0-9a-fA-F]{6}$/
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const str = (v: unknown, max: number, fallback = '') =>
  typeof v === 'string' ? v.slice(0, max) : fallback
const num = (v: unknown, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback

// Luminance decides whether a label on a swatch is dark or light.
const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255) < 140
}
const pick = (palette: Swatch[], role: string, fallback: string) =>
  palette.find(s => s.role.toLowerCase() === role)?.hex ?? fallback

// A generic family only: an SVG drawn as an image loads no webfont, so the
// specimen shows the kind of face (serif, sans, mono), never the face itself.
const family = (name: string) =>
  /mono|code/i.test(name)
    ? 'ui-monospace, Menlo, monospace'
    : /serif|fraunces|garamond|playfair|lora|newsreader|instrument|times|georgia|caslon|tiempos/i.test(name) &&
        !/sans/i.test(name)
      ? 'Georgia, "Times New Roman", serif'
      : 'system-ui, -apple-system, "Helvetica Neue", sans-serif'

const wrap = (text: string, perLine: number, maxLines: number) => {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > perLine && line) {
      lines.push(line)
      line = word
    } else {
      line = (line + ' ' + word).trim()
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, maxLines)
}

const specimen = (b: Board, width: number) => {
  const page = pick(b.palette, 'page', '#FFFFFF')
  const ink = pick(b.palette, 'ink', isDark(page) ? '#FFFFFF' : '#111111')
  const accent = pick(b.palette, 'accent', ink)
  const hairline = pick(b.palette, 'hairline', isDark(page) ? '#444444' : '#DDDDDD')
  const lines = wrap(b.headline || b.brand, Math.floor(width / 15), 3)
  const top = 64
  const after = top + lines.length * 34
  const r = Math.max(0, Math.min(22, b.radius))
  const sw = b.palette.slice(0, 6)
  const cell = (width - 32) / Math.max(1, sw.length)
  const height = after + 150

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" rx="12" fill="${page}" stroke="${hairline}"/>
<text x="16" y="30" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="${ink}" opacity=".55">${esc(b.brand.toUpperCase())}</text>
${lines.map((l, i) => `<text x="16" y="${top + i * 34}" font-family='${family(b.display)}' font-size="28" font-weight="600" fill="${ink}">${esc(l)}</text>`).join('\n')}
<rect x="16" y="${after - 8}" width="118" height="36" rx="${r}" fill="${accent}"/>
<text x="75" y="${after + 15}" text-anchor="middle" font-family='${family(b.text)}' font-size="13" font-weight="600" fill="${isDark(accent) ? '#FFFFFF' : '#111111'}">Commencer</text>
<rect x="146" y="${after - 8}" width="118" height="36" rx="${r}" fill="none" stroke="${ink}" stroke-opacity=".35"/>
<text x="205" y="${after + 15}" text-anchor="middle" font-family='${family(b.text)}' font-size="13" fill="${ink}">En savoir plus</text>
<line x1="16" y1="${after + 48}" x2="${width - 16}" y2="${after + 48}" stroke="${hairline}"/>
${sw.map((s, i) => `<rect x="${16 + i * cell}" y="${after + 62}" width="${cell - 6}" height="44" rx="6" fill="${s.hex}" stroke="${hairline}"/>
<text x="${16 + i * cell + 6}" y="${after + 80}" font-family="ui-monospace, Menlo, monospace" font-size="9" fill="${isDark(s.hex) ? '#FFFFFF' : '#111111'}">${esc(s.role)}</text>
<text x="${16 + i * cell + 6}" y="${after + 98}" font-family="ui-monospace, Menlo, monospace" font-size="9" fill="${isDark(s.hex) ? '#FFFFFF' : '#111111'}" opacity=".8">${s.hex.toUpperCase()}</text>`).join('\n')}
<text x="16" y="${after + 130}" font-family='${family(b.text)}' font-size="11" fill="${ink}" opacity=".6">${esc(`${b.display} · ${b.text} · rayon ${b.radius}px`)}</text>
</svg>`
}

const progress = (b: Board) =>
  b.made >= b.total
    ? `${b.brand} · ${b.total} décisions prises`
    : `${b.brand} · décision ${b.made + 1} sur ${b.total}`

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'show',
      description:
        'Update the brand board shown beside the chat during a brand-kit session. Call it after each decision the user makes (a duel, a change, a refusal) and each time the asserted system changes, with the whole current state. It draws a specimen of what is decided so far (palette, headline, button shape) and the progress, in a pane and above the next question. It shows state; it never replaces showing real sites for a duel. Pass isLive false once the kit is written.',
      isDeferred: false,
      inputSchema: {
        type: 'object',
        required: ['brand', 'made', 'total'],
        properties: {
          brand: { type: 'string', description: 'Brand or project name' },
          mode: { type: 'string', enum: ['quick', 'normal'] },
          made: { type: 'number', description: 'User decisions made so far' },
          total: { type: 'number', description: 'Decision budget (5 in quick mode)' },
          universe: { type: 'string', description: 'The universe read back in plain words, one sentence' },
          headline: { type: 'string', description: "A headline in the user's own words" },
          palette: {
            type: 'array',
            description: 'Up to six roles. page, ink, accent and hairline drive the specimen',
            items: {
              type: 'object',
              required: ['role', 'hex'],
              properties: { role: { type: 'string' }, hex: { type: 'string', description: '#RRGGBB' } },
            },
          },
          display: { type: 'string', description: 'Display face name' },
          text: { type: 'string', description: 'Text face name' },
          radius: { type: 'number', description: 'Control radius in px' },
          refused: { type: 'array', items: { type: 'string' }, description: 'What the user refused, in their words' },
          isLive: { type: 'boolean', description: 'false when the session is over' },
        },
      },
    })
    await $.command.register({ name: 'brand-board', description: 'Open the brand board pane' })

    return next(e)
  })

  on('command.run', { command: 'brand-board' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Planche de marque' })

    return { text: 'Planche de marque ouverte.' }
  })

  // Served at tool.call, not tool.run: the tool only draws, so it needs no
  // permission check, and engines older than tool.run load it too.
  on('tool.call', { tool: TOOL }, async ($, e) => {
    const input = e as unknown as Record<string, unknown>
    const palette = (Array.isArray(input.palette) ? input.palette : [])
      .map(s => s as Record<string, unknown>)
      .filter(s => s && typeof s.role === 'string' && typeof s.hex === 'string' && HEX.test(s.hex))
      .slice(0, 6)
      .map(s => ({ role: str(s.role, 16), hex: s.hex as string }))
    const next: Board = {
      brand: str(input.brand, 40, 'Marque'),
      mode: input.mode === 'normal' ? 'normal' : 'quick',
      made: Math.max(0, Math.round(num(input.made, 0))),
      total: Math.max(1, Math.round(num(input.total, 5))),
      universe: str(input.universe, 280),
      headline: str(input.headline, 90),
      palette,
      display: str(input.display, 40, 'à décider'),
      text: str(input.text, 40, 'à décider'),
      radius: Math.round(num(input.radius, 8)),
      refused: (Array.isArray(input.refused) ? input.refused : [])
        .filter((r): r is string => typeof r === 'string')
        .slice(0, 8)
        .map(r => r.slice(0, 80)),
      isLive: input.isLive !== false,
    }
    await update($, board, () => next)
    const { isPlaced } = await $.ui.open({ id: PANE, title: 'Planche de marque' })

    return {
      result: isPlaced
        ? `Brand board updated and shown (${progress(next)}).`
        : `Brand board updated (${progress(next)}); no surface draws the pane here.`,
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const els = $.ui.resolve(e)
    const { Box, Text } = els
    const b = await read($, board)

    if (b === null) {
      return (
        <Box flexDirection="column">
          <Text dimColor>Aucune marque en cours. La planche se remplit pendant une session brand-kit.</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>{progress(b)}</Text>
        {b.universe !== '' && <Text>{b.universe}</Text>}
        {e.surface === 'terminal' ? (
          <Box flexDirection="column">
            {b.palette.map(s => (
              <Text>
                <Text backgroundColor={s.hex}>{'      '}</Text> {s.role} {s.hex.toUpperCase()}
              </Text>
            ))}
            <Text dimColor>
              {b.display} · {b.text} · rayon {b.radius}px
            </Text>
          </Box>
        ) : (
          'Svg' in els &&
          b.palette.length > 0 && (
            <els.Svg
              source={specimen(b, 360)}
              alt={`Spécimen : ${b.palette.map(s => `${s.role} ${s.hex}`).join(', ')}`}
            />
          )
        )}
        {b.refused.length > 0 && (
          <Box flexDirection="column">
            <Text dimColor>Jamais</Text>
            {b.refused.map(r => (
              <Text>– {r}</Text>
            ))}
          </Box>
        )}
      </Box>
    )
  })

  on('ui.render', { component: 'AskUserQuestion' }, async ($, e, next) => {
    const b = await read($, board)

    if (b === null || !b.isLive) {
      return next(e)
    }

    const els = $.ui.resolve(e)
    const { Box, Text } = els
    const canDraw = e.surface !== 'terminal' && 'Svg' in els && b.palette.length > 0

    return (
      <Box flexDirection="column">
        <Text dimColor>{progress(b)}</Text>
        {canDraw && <els.Svg source={specimen(b, 360)} alt="Ce qui est décidé jusqu'ici" />}
        {await next(e)}
      </Box>
    )
  })
}
