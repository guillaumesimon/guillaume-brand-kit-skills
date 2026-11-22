import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'brand-board',
  component: 'Pane',
  requestId: 'brand-board',
  props: {
    title: 'Planche de marque',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

test('the tool fills the pane, on every surface', async ($, on) => {
  on('command.register', () => ({ value: { command: 'brand-board' } }))
  on('tool.register', () => ({ value: { tool: 'mcp__brand-board__show' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ran = await $.tool.call({
    tool: 'mcp__brand-board__show',
    brand: 'Brindille',
    made: 2,
    total: 5,
    headline: 'Le vélo qui grandit avec eux',
    palette: [
      { role: 'page', hex: '#FFF8E7' },
      { role: 'ink', hex: '#1B1B1B' },
      { role: 'accent', hex: '#F2B705' },
      { role: 'bad', hex: 'javascript:alert(1)' },
    ],
    refused: ['Ressembler à une banque'],
  })
  expect(String(ran.result)).toMatch(/décision 3 sur 5/)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })

    expect((await ui.find({ type: 'Text', text: /décision 3/ }))?.text).toBe(
      'Brindille · décision 3 sur 5',
    )
    expect((await ui.find({ type: 'Text', text: /banque/ }))?.text).toBe('– Ressembler à une banque')
    await ui.unmount()
  }
})

test('an empty board says so', async $ => {
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  expect((await ui.find({ type: 'Text' }))?.text).toMatch(/Aucune marque/)
  await ui.unmount()
})
