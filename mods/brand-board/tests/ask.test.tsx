import { expect, test } from 'claude-code/testing'

const BOARD = {
  tool: 'mcp__brand-board__show',
  brand: 'Brindille',
  made: 3,
  total: 5,
  universe: 'Du clair, une couleur franche, de grosses lettres, une voix qui parle normalement.',
  headline: 'Le vélo qui grandit avec eux',
  display: 'Bricolage Grotesque',
  text: 'Inter',
  radius: 12,
  palette: [
    { role: 'page', hex: '#FFF8E7' },
    { role: 'ink', hex: '#1B1B1B' },
    { role: 'accent', hex: '#F2B705' },
    { role: 'hairline', hex: '#E9DFC6' },
    { role: 'second', hex: '#1F5D45' },
  ],
  refused: ['Ressembler à une banque', 'Culpabiliser les parents'],
} as const

const ASK = {
  plugin: 'brand-board',
  component: 'AskUserQuestion',
  props: { tool: 'AskUserQuestion', questions: [] },
} as const

test('a live board draws above the question; a closed one leaves it alone', async ($, on) => {
  on('command.register', () => ({ value: { command: 'brand-board' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__brand-board__show' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  // Stands for the engine: its own question card, drawn from the props.
  on('ui.render', () => ({ type: 'engine', ref: 0 }) as const)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.tool.call(BOARD)

  const desktop = await $.ui.mount({ ...ASK, surface: 'desktop' })
  expect((await desktop.find({ type: 'Text', text: /décision/ }))?.text).toBe('Brindille · décision 4 sur 5')
  const svg = await desktop.find({ type: 'Svg' })
  expect(String(svg?.props.source)).toMatch(/^<svg /)
  expect(String(svg?.props.source)).toMatch(/#F2B705/)
  await desktop.unmount()

  const terminal = await $.ui.mount({ ...ASK, surface: 'terminal' })
  expect(await terminal.find({ type: 'Text', text: /décision/ })).toBeDefined()
  await terminal.unmount()

  await $.tool.call({ ...BOARD, made: 5, isLive: false })
  const closed = await $.ui.mount({ ...ASK, surface: 'desktop' })
  expect(await closed.find({ type: 'Svg' })).toBeUndefined()
  await closed.unmount()
})
