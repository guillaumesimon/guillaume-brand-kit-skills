export type Swatch = { role: string; hex: string }

export type Board = {
  brand: string
  mode: 'quick' | 'normal'
  made: number
  total: number
  universe: string
  headline: string
  palette: Swatch[]
  display: string
  text: string
  radius: number
  refused: string[]
  isLive: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'brand-board': { board: Shaped<Board | null> }
  }
}
