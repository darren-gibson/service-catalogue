import type { ShortcutLabels } from '../app/types'
import type { RefObject } from 'react'
import { UiIcon } from './AppIcons'

interface AppHeaderProps {
  documentName: string
  isDarkMode: boolean
  openMenu: 'main' | null
  isEditorCollapsed: boolean
  showCode: boolean
  shortcutLabels: ShortcutLabels
  menuBarRef: RefObject<HTMLDivElement | null>
  onToggleMenu: () => void
  onToggleTheme: () => void
  onOpen: () => void
  onOpenFromUrl: () => void
  onSave: () => void
  onSaveAs: () => void
  onToggleCodePane: () => void
  onToggleMermaidCode: () => void
  onResetLayoutPreferences: () => void
  onCloseMenu: () => void
}

export function AppHeader({
  documentName,
  isDarkMode,
  openMenu,
  isEditorCollapsed,
  showCode,
  shortcutLabels,
  menuBarRef,
  onToggleMenu,
  onToggleTheme,
  onOpen,
  onOpenFromUrl,
  onSave,
  onSaveAs,
  onToggleCodePane,
  onToggleMermaidCode,
  onResetLayoutPreferences,
  onCloseMenu,
}: AppHeaderProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <div className="title-row" ref={menuBarRef}>
          <button
            type="button"
            className={`menu-toggle ${openMenu === 'main' ? 'menu-toggle-open' : ''}`}
            aria-label="Open menu"
            onClick={onToggleMenu}
          >
            <UiIcon name="menu" />
          </button>
          <div className="title-wrap">
            <h1>Service Catalogue</h1>
            <p>{documentName}</p>
          </div>
          <button
            type="button"
            className="icon-btn title-theme-toggle"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={onToggleTheme}
          >
            <UiIcon name={isDarkMode ? 'moon' : 'sun'} />
          </button>
          {openMenu === 'main' ? (
            <div className="menu-sheet">
              <div className="menu-section">
                <div className="menu-section-title">File</div>
                <button type="button" className="menu-item" onClick={() => { onCloseMenu(); onOpen() }}>
                  <span>Open</span>
                  <span className="menu-shortcut">{shortcutLabels.open}</span>
                </button>
                <button type="button" className="menu-item" onClick={() => { onCloseMenu(); onOpenFromUrl() }}>
                  <span>Open from URL</span>
                </button>
                <button type="button" className="menu-item" onClick={() => { onCloseMenu(); onSave() }}>
                  <span>Save</span>
                  <span className="menu-shortcut">{shortcutLabels.save}</span>
                </button>
                <button type="button" className="menu-item" onClick={() => { onCloseMenu(); onSaveAs() }}>
                  <span>Save As</span>
                  <span className="menu-shortcut">{shortcutLabels.saveAs}</span>
                </button>
              </div>
              <div className="menu-section">
                <div className="menu-section-title">View</div>
                <button type="button" className="menu-item" onClick={() => { onCloseMenu(); onToggleCodePane() }}>
                  <span>{isEditorCollapsed ? 'Show Code Pane' : 'Hide Code Pane'}</span>
                  <span className="menu-shortcut">{shortcutLabels.toggleCode}</span>
                </button>
                <button type="button" className="menu-item" onClick={() => { onCloseMenu(); onToggleMermaidCode() }}>
                  <span>{showCode ? 'Hide Mermaid Code' : 'Show Mermaid Code'}</span>
                </button>
                <button type="button" className="menu-item" onClick={() => { onCloseMenu(); onResetLayoutPreferences() }}>
                  <span>Reset Layout/Preferences</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}