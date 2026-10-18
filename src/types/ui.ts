export type AvatarTone = 'primary' | 'primary-container' | 'secondary' | 'soft' | 'muted'

export type BadgeTone = 'primary' | 'success' | 'neutral' | 'solid'

export type ButtonVariant =
  'primary' | 'gradient' | 'success' | 'tonal' | 'surface' | 'outline' | 'soft'

export interface SelectOption {
  value: string
  label: string
}

export interface MetricFooterItem {
  text: string
  icon?: string
  tone?: 'default' | 'positive' | 'negative' | 'strong'
}

interface MetricBase {
  id: string
  label: string
  icon: string
  accent: 'primary' | 'primary-container' | 'outline' | 'secondary'
  iconTone: 'primary' | 'neutral' | 'success'
  emphasized?: boolean
  unit?: string
  note?: string
  footer: readonly MetricFooterItem[]
  footerSeparator?: boolean
}

/** A summary card. Numeric formats take a number; `text` takes a ready-made string. */
export type Metric = MetricBase &
  (
    | { format: 'count' | 'hours' | 'peso' | 'percent'; value: number }
    | { format: 'text'; value: string }
  )
