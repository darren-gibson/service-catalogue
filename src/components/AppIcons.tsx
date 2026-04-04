type UiIconName = 'menu' | 'code' | 'preview' | 'config' | 'details' | 'diagnostics' | 'zoomIn' | 'zoomOut' | 'fit' | 'collapse' | 'sun' | 'moon'

function UiIcon({ name }: { name: UiIconName }) {
  switch (name) {
    case 'menu':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 4.25h12M2 8h12M2 11.75h12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      )
    case 'code':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 4 2.75 8 6 12M10 4 13.25 8 10 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    case 'preview':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2.25" y="3" width="11.5" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.75 6.25h10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'config':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6.5 2.75 7 1.5h2l.5 1.25 1.45.6 1.23-.52 1.4 1.4-.52 1.23.6 1.45L14.5 7v2l-1.25.5-.6 1.45.52 1.23-1.4 1.4-1.23-.52-1.45.6L9 14.5H7l-.5-1.25-1.45-.6-1.23.52-1.4-1.4.52-1.23-.6-1.45L1.5 9V7l1.25-.5.6-1.45-.52-1.23 1.4-1.4 1.23.52 1.45-.6Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'details':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 5.5h6M5 8h6M5 10.5h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      )
    case 'diagnostics':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2.2 14 13H2L8 2.2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
          <path d="M8 6v3.25M8 11.2v.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      )
    case 'zoomIn':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="3.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 5.3v3.4M5.3 7h3.4M10.4 10.4l2.35 2.35" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      )
    case 'zoomOut':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="3.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.3 7h3.4M10.4 10.4l2.35 2.35" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      )
    case 'fit':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M5 2.75H2.75V5M11 2.75h2.25V5M5 13.25H2.75V11M11 13.25h2.25V11" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    case 'collapse':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 8h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      )
    case 'sun':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.55 3.55l1.05 1.05M11.4 11.4l1.05 1.05M12.45 3.55 11.4 4.6M4.6 11.4l-1.05 1.05" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
        </svg>
      )
    case 'moon':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10.85 2.2a5.85 5.85 0 1 0 2.95 10.9A6.3 6.3 0 0 1 10.85 2.2Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
      )
  }
}

function PaneLabel({ icon, label }: { icon: UiIconName; label: string }) {
  return (
    <span className="pane-label">
      <span className="pane-icon"><UiIcon name={icon} /></span>
      <span>{label}</span>
    </span>
  )
}

export { PaneLabel, UiIcon }
export type { UiIconName }