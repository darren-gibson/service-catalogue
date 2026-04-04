import { useEffect } from 'react'

interface UseAppShortcutsOptions {
  onCloseMenu: () => void
  onOpen: () => Promise<void>
  onSave: () => Promise<void>
  onSaveAs: () => Promise<void>
  onToggleCodePane: () => void
}

export function useAppShortcuts({
  onCloseMenu,
  onOpen,
  onSave,
  onSaveAs,
  onToggleCodePane,
}: UseAppShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      if (event.key === 'Escape') {
        onCloseMenu()
        return
      }

      if (!modifier) {
        return
      }

      if (key === 'o' && !event.shiftKey) {
        event.preventDefault()
        void onOpen()
        return
      }

      if (key === 's' && event.shiftKey) {
        event.preventDefault()
        void onSaveAs()
        return
      }

      if (key === 's') {
        event.preventDefault()
        void onSave()
        return
      }

      if (key === 'b') {
        event.preventDefault()
        onToggleCodePane()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onCloseMenu, onOpen, onSave, onSaveAs, onToggleCodePane])
}