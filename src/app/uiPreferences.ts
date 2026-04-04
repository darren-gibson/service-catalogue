export const UI_PREFERENCES_STORAGE_KEY = 'service-catalogue.ui-preferences.v1'

export interface UiPreferences {
  isDarkMode?: boolean
  isEditorCollapsed?: boolean
  editorWidth?: number
  showCode?: boolean
  isConfigCollapsed?: boolean
}

export function clampEditorWidth(value: number): number {
  return Math.min(75, Math.max(25, value))
}

export function loadUiPreferences(): UiPreferences {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(UI_PREFERENCES_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    const candidate = parsed as Record<string, unknown>
    return {
      isDarkMode: typeof candidate.isDarkMode === 'boolean' ? candidate.isDarkMode : undefined,
      isEditorCollapsed: typeof candidate.isEditorCollapsed === 'boolean' ? candidate.isEditorCollapsed : undefined,
      editorWidth: typeof candidate.editorWidth === 'number' ? clampEditorWidth(candidate.editorWidth) : undefined,
      showCode: typeof candidate.showCode === 'boolean' ? candidate.showCode : undefined,
      isConfigCollapsed: typeof candidate.isConfigCollapsed === 'boolean' ? candidate.isConfigCollapsed : undefined,
    }
  } catch {
    return {}
  }
}

export function saveUiPreferences(preferences: UiPreferences) {
  window.localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}