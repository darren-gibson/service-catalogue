import Editor from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import type { RefObject } from 'react'
import { DSL_LANGUAGE_ID, ensureDslLanguage } from '../editor/dslLanguage'
import type { NodeDetails } from '../domain/nodeDetails'
import { NodeDetailsPanel } from './NodeDetailsPanel'
import { PaneLabel } from './AppIcons'

interface DiagnosticItem {
  line: number
  message: string
}

interface EditorPaneProps {
  source: string
  isDarkMode: boolean
  editorWidth: number
  diagnostics: DiagnosticItem[]
  selectedNode: NodeDetails | null
  detailsPanelRef: RefObject<HTMLElement | null>
  editorRef: RefObject<MonacoEditor.IStandaloneCodeEditor | null>
  monacoRef: RefObject<typeof import('monaco-editor') | null>
  onSourceChange: (value: string) => void
  onClearSelectedNode: () => void
}

export function EditorPane({
  source,
  isDarkMode,
  editorWidth,
  diagnostics,
  selectedNode,
  detailsPanelRef,
  editorRef,
  monacoRef,
  onSourceChange,
  onClearSelectedNode,
}: EditorPaneProps) {
  return (
    <article className="pane pane-editor" style={{ flexBasis: `${editorWidth}%` }}>
      <div className="pane-head pane-head-between">
        <PaneLabel icon="code" label="Code" />
        <span className={`pill ${diagnostics.length === 0 ? 'pill-ok' : 'pill-error'}`}>
          {diagnostics.length === 0 ? 'Valid' : `${diagnostics.length} Issues`}
        </span>
      </div>
      <div className="editor">
        <Editor
          value={source}
          defaultLanguage={DSL_LANGUAGE_ID}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          onChange={(value) => onSourceChange(value ?? '')}
          beforeMount={(monaco) => ensureDslLanguage(monaco)}
          onMount={(editor, monaco) => {
            editorRef.current = editor
            monacoRef.current = monaco
          }}
          options={{
            minimap: { enabled: false },
            automaticLayout: true,
            fontSize: 14,
            fontFamily: 'Menlo, Consolas, Monaco, monospace',
            wordWrap: 'off',
            insertSpaces: false,
            tabSize: 2,
            detectIndentation: false,
            tabCompletion: 'on',
            tabFocusMode: false,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: false,
            formatOnType: false,
          }}
        />
      </div>
      {diagnostics.length > 0 ? (
        <section className="diagnostics-box diagnostics-box-code diagnostics-box-visible">
          <div className="pane-head diagnostics-head">
            <PaneLabel icon="diagnostics" label="Diagnostics" />
          </div>
          <ul className="diagnostics">
            {diagnostics.map((issue, index) => (
              <li key={`${issue.line}-${index}`}>
                {issue.line > 0 ? `Line ${issue.line}: ` : ''}
                {issue.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <NodeDetailsPanel
        detailsPanelRef={detailsPanelRef}
        selectedNode={selectedNode}
        onClose={onClearSelectedNode}
      />
    </article>
  )
}