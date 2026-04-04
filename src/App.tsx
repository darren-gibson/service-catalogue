import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { editor as MonacoEditor } from 'monaco-editor'
import mermaid from 'mermaid'
import './App.css'
import type { ShortcutLabels, VisualConfig } from './app/types'
import { clampEditorWidth, loadUiPreferences, saveUiPreferences, UI_PREFERENCES_STORAGE_KEY, type UiPreferences } from './app/uiPreferences'
import { AppHeader } from './components/AppHeader'
import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'
import { buildNodeDetailsIndex } from './domain/nodeDetails'
import { useAppShortcuts } from './hooks/useAppShortcuts'
import { useFileActions } from './hooks/useFileActions'
import { useMermaidDiagram } from './hooks/useMermaidDiagram'
import { parseDsl } from './parser/parseDsl'
import { validateModel } from './parser/validateModel'
import { toMermaid } from './visualization/toMermaid'

const DEFAULT_VISUAL_CONFIG: VisualConfig = {
  theme: 'auto',
  direction: 'LR',
  curve: 'basis',
  nodeSpacing: 30,
  rankSpacing: 50,
  diagramPadding: 12,
}

function buildMermaidSource(diagram: string, config: VisualConfig, isDarkMode: boolean): string {
  const resolvedTheme = config.theme === 'auto'
    ? (isDarkMode ? 'dark' : 'default')
    : config.theme

  const initConfig = {
    theme: resolvedTheme,
    flowchart: {
      curve: config.curve,
      nodeSpacing: config.nodeSpacing,
      rankSpacing: config.rankSpacing,
      diagramPadding: config.diagramPadding,
    },
  }

  return `%%{init: ${JSON.stringify(initConfig)}}%%\n${diagram}`
}

mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })

const MIN_ZOOM = 0.05
const MAX_ZOOM = 8
const ZOOM_FACTOR = 1.25

function App() {
  const storedPreferences = useMemo(() => loadUiPreferences(), [])
  const {
    source,
    setSource,
    documentName,
    fileInputRef,
    openFromUrl,
    handleOpen,
    handleSave,
    handleSaveAs,
    handleFileInputChange,
  } = useFileActions()
  const [showCode, setShowCode] = useState(storedPreferences.showCode ?? false)
  const [visualConfig, setVisualConfig] = useState<VisualConfig>(DEFAULT_VISUAL_CONFIG)
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(storedPreferences.isConfigCollapsed ?? true)
  const [openMenu, setOpenMenu] = useState<'main' | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(
    storedPreferences.isDarkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(storedPreferences.isEditorCollapsed ?? false)
  const [editorWidth, setEditorWidth] = useState(storedPreferences.editorWidth ?? 33)
  const [zoom, setZoom] = useState(1)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)
  const workspaceRef = useRef<HTMLElement | null>(null)
  const detailsPanelRef = useRef<HTMLElement | null>(null)
  const diagramFrameRef = useRef<HTMLDivElement | null>(null)
  const menuBarRef = useRef<HTMLDivElement | null>(null)
  const dragModeRef = useRef<'editor' | null>(null)

  const parseResult = useMemo(() => parseDsl(source), [source])
  const validationDiagnostics = useMemo(
    () => validateModel(parseResult.model),
    [parseResult.model],
  )

  const diagnostics = [...parseResult.diagnostics, ...validationDiagnostics]
  const nodeDetailsIndex = useMemo(() => buildNodeDetailsIndex(parseResult.model), [parseResult.model])
  const { byId: nodeDetailsById, byName: nodeDetailsByName } = nodeDetailsIndex

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodeDetailsById.get(selectedNodeId) ?? null : null),
    [nodeDetailsById, selectedNodeId],
  )

  const mermaidText = useMemo(
    () => (diagnostics.length === 0
      ? buildMermaidSource(
          toMermaid(parseResult.model, { direction: visualConfig.direction }),
          visualConfig,
          isDarkMode,
        )
      : ''),
    [diagnostics.length, isDarkMode, parseResult.model, visualConfig],
  )

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId((current) => {
      if (current === nodeId) {
        return null
      }

      setIsEditorCollapsed(false)
      return nodeId
    })
  }, [])

  const { chartRef, chartSize, svg } = useMermaidDiagram({
    mermaidText,
    nodeDetailsById,
    nodeDetailsByName,
    selectedNodeId,
    onSelectNode: handleSelectNode,
  })
  const isPreviewStale = diagnostics.length > 0 && Boolean(svg)

  useEffect(() => {
    if (!selectedNodeId) {
      return
    }
    detailsPanelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedNodeId])

  useEffect(() => {
    const monaco = monacoRef.current
    const editor = editorRef.current
    if (!editor || !monaco) {
      return
    }

    const model = editor.getModel()
    if (!model) {
      return
    }

    const markers = diagnostics.map((issue) => {
      const line = issue.line > 0 ? issue.line : 1
      return {
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: 1,
        message: issue.message,
        severity: monaco.MarkerSeverity.Error,
      }
    })

    monaco.editor.setModelMarkers(model, 'dsl-lint', markers)
  }, [diagnostics])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (dragModeRef.current === 'editor') {
        const workspace = workspaceRef.current
        if (!workspace) {
          return
        }

        const rect = workspace.getBoundingClientRect()
        const ratio = ((event.clientX - rect.left) / rect.width) * 100
        const next = Math.min(75, Math.max(25, ratio))
        setEditorWidth(next)
      }

    }

    const onPointerUp = () => {
      dragModeRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const menuBar = menuBarRef.current
      if (!menuBar) {
        return
      }

      const target = event.target
      if (target instanceof Node && !menuBar.contains(target)) {
        setOpenMenu(null)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  useEffect(() => {
    const preferences: UiPreferences = {
      isDarkMode,
      isEditorCollapsed,
      editorWidth: clampEditorWidth(editorWidth),
      showCode,
      isConfigCollapsed,
    }

    saveUiPreferences(preferences)
  }, [editorWidth, isConfigCollapsed, isDarkMode, isEditorCollapsed, showCode])

  const beginEditorResize = () => {
    dragModeRef.current = 'editor'
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const zoomByFactor = (direction: 'in' | 'out') => {
    setZoom((value) => {
      const scaled = direction === 'in' ? value * ZOOM_FACTOR : value / ZOOM_FACTOR
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(scaled.toFixed(3))))
    })
  }

  const fitToPane = useCallback(() => {
    const frame = diagramFrameRef.current
    if (!frame || chartSize.width === 0 || chartSize.height === 0) return
    const { clientWidth, clientHeight } = frame
    const scaleX = clientWidth / chartSize.width
    const scaleY = clientHeight / chartSize.height
    const fit = Math.min(scaleX, scaleY, MAX_ZOOM)
    setZoom(Math.max(MIN_ZOOM, Number(fit.toFixed(3))))
  }, [chartSize])

  useEffect(() => {
    fitToPane()
  }, [fitToPane])

  const shortcutLabels = useMemo(() => {
    const isMac = /mac/i.test(window.navigator.platform)
    return {
      open: isMac ? '⌘O' : 'Ctrl+O',
      save: isMac ? '⌘S' : 'Ctrl+S',
      saveAs: isMac ? '⇧⌘S' : 'Ctrl+Shift+S',
      toggleCode: isMac ? '⌘B' : 'Ctrl+B',
    } satisfies ShortcutLabels
  }, [])

  const handleOpenFromUrl = () => {
    const url = window.prompt('Enter the URL to open:', '')
    if (url && url.trim()) {
      void openFromUrl(url.trim())
    }
  }

  const toggleColorMode = () => {
    setIsDarkMode((value) => !value)
  }

  const resetUiPreferences = () => {
    window.localStorage.removeItem(UI_PREFERENCES_STORAGE_KEY)
    setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsEditorCollapsed(false)
    setEditorWidth(33)
    setShowCode(false)
    setIsConfigCollapsed(true)
    setOpenMenu(null)
  }

  useAppShortcuts({
    onCloseMenu: () => setOpenMenu(null),
    onOpen: handleOpen,
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onToggleCodePane: () => setIsEditorCollapsed((value) => !value),
  })

  return (
    <main className={`app-shell ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".dsl,.catalogue,.txt,text/plain"
        style={{ display: 'none' }}
        onChange={(event) => {
          void handleFileInputChange(event)
        }}
      />

      <AppHeader
        documentName={documentName}
        isDarkMode={isDarkMode}
        openMenu={openMenu}
        isEditorCollapsed={isEditorCollapsed}
        showCode={showCode}
        shortcutLabels={shortcutLabels}
        menuBarRef={menuBarRef}
        onToggleMenu={() => setOpenMenu((value) => (value === 'main' ? null : 'main'))}
        onToggleTheme={toggleColorMode}
        onOpen={() => handleOpen()}
        onOpenFromUrl={handleOpenFromUrl}
        onSave={() => handleSave()}
        onSaveAs={() => handleSaveAs()}
        onToggleCodePane={() => setIsEditorCollapsed((value) => !value)}
        onToggleMermaidCode={() => setShowCode((value) => !value)}
        onResetLayoutPreferences={resetUiPreferences}
        onCloseMenu={() => setOpenMenu(null)}
      />

      <section className="workspace" ref={workspaceRef}>
        {!isEditorCollapsed ? (
          <EditorPane
            source={source}
            isDarkMode={isDarkMode}
            editorWidth={editorWidth}
            diagnostics={diagnostics}
            selectedNode={selectedNode}
            detailsPanelRef={detailsPanelRef}
            editorRef={editorRef}
            monacoRef={monacoRef}
            onSourceChange={setSource}
            onClearSelectedNode={() => setSelectedNodeId(null)}
          />
        ) : null}

        {!isEditorCollapsed ? (
          <div
            className="splitter splitter-vertical"
            role="separator"
            aria-label="Resize editor"
            onPointerDown={beginEditorResize}
          />
        ) : null}

        <PreviewPane
          isPreviewStale={isPreviewStale}
          isConfigCollapsed={isConfigCollapsed}
          visualConfig={visualConfig}
          chartSize={chartSize}
          zoom={zoom}
          svg={svg}
          mermaidText={mermaidText}
          showCode={showCode}
          diagramFrameRef={diagramFrameRef}
          chartRef={chartRef}
          onZoomOut={() => zoomByFactor('out')}
          onZoomIn={() => zoomByFactor('in')}
          onFitToPane={fitToPane}
          onExpandConfig={() => setIsConfigCollapsed(false)}
          onCollapseConfig={() => setIsConfigCollapsed(true)}
          onVisualConfigChange={setVisualConfig}
        />
      </section>
    </main>
  )
}

export default App
