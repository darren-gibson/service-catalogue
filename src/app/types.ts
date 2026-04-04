export type MermaidThemeChoice = 'auto' | 'default' | 'neutral' | 'forest' | 'base' | 'dark'
export type MermaidDirection = 'LR' | 'TB' | 'RL' | 'BT'
export type MermaidCurve = 'basis' | 'linear' | 'monotoneX' | 'stepBefore'

export interface VisualConfig {
  theme: MermaidThemeChoice
  direction: MermaidDirection
  curve: MermaidCurve
  nodeSpacing: number
  rankSpacing: number
  diagramPadding: number
}

export interface ShortcutLabels {
  open: string
  save: string
  saveAs: string
  toggleCode: string
}