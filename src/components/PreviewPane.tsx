import type { VisualConfig, MermaidCurve, MermaidDirection, MermaidThemeChoice } from '../app/types'
import type { RefObject } from 'react'
import { PaneLabel, UiIcon } from './AppIcons'

interface PreviewPaneProps {
  isPreviewStale: boolean
  isConfigCollapsed: boolean
  visualConfig: VisualConfig
  chartSize: { width: number; height: number }
  zoom: number
  svg: string
  mermaidText: string
  showCode: boolean
  diagramFrameRef: RefObject<HTMLDivElement | null>
  chartRef: RefObject<HTMLDivElement | null>
  onZoomOut: () => void
  onZoomIn: () => void
  onFitToPane: () => void
  onExpandConfig: () => void
  onCollapseConfig: () => void
  onVisualConfigChange: (updater: (value: VisualConfig) => VisualConfig) => void
}

export function PreviewPane({
  isPreviewStale,
  isConfigCollapsed,
  visualConfig,
  chartSize,
  zoom,
  svg,
  mermaidText,
  showCode,
  diagramFrameRef,
  chartRef,
  onZoomOut,
  onZoomIn,
  onFitToPane,
  onExpandConfig,
  onCollapseConfig,
  onVisualConfigChange,
}: PreviewPaneProps) {
  return (
    <article className={`pane pane-preview ${isPreviewStale ? 'pane-preview-stale' : ''}`}>
      <div className="pane-head pane-head-between">
        <PaneLabel icon="preview" label="Preview" />
        <div className="inline-controls">
          <button type="button" className="icon-btn" aria-label="Zoom out" onClick={onZoomOut}>
            <UiIcon name="zoomOut" />
          </button>
          <button type="button" className="icon-btn" aria-label="Fit diagram" onClick={onFitToPane}>
            <UiIcon name="fit" />
          </button>
          <button type="button" className="icon-btn" aria-label="Zoom in" onClick={onZoomIn}>
            <UiIcon name="zoomIn" />
          </button>
        </div>
      </div>
      <section className={`config-panel config-panel-preview ${isConfigCollapsed ? 'config-panel-collapsed' : ''}`}>
        <div
          className={`config-toggle ${isConfigCollapsed ? 'pane-head-clickable' : ''}`}
          onClick={isConfigCollapsed ? onExpandConfig : undefined}
          role={isConfigCollapsed ? 'button' : undefined}
          tabIndex={isConfigCollapsed ? 0 : undefined}
          onKeyDown={isConfigCollapsed ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onExpandConfig()
            }
          } : undefined}
        >
          <PaneLabel icon="config" label="Config" />
          {!isConfigCollapsed ? (
            <button
              type="button"
              className="icon-btn"
              aria-label="Collapse config"
              onClick={(event) => {
                event.stopPropagation()
                onCollapseConfig()
              }}
            >
              <UiIcon name="collapse" />
            </button>
          ) : null}
        </div>
        {!isConfigCollapsed ? (
          <div className="config-panel-body">
            <div className="config-panel-head">
              <strong>Visual Settings</strong>
              <span>Customize diagram visuals in the preview pane.</span>
            </div>
            <div className="config-grid">
              <label className="config-field">
                <span>Theme</span>
                <select
                  value={visualConfig.theme}
                  onChange={(event) => onVisualConfigChange((value) => ({
                    ...value,
                    theme: event.target.value as MermaidThemeChoice,
                  }))}
                >
                  <option value="auto">Auto</option>
                  <option value="default">Default</option>
                  <option value="neutral">Neutral</option>
                  <option value="forest">Forest</option>
                  <option value="base">Base</option>
                  <option value="dark">Dark</option>
                </select>
              </label>

              <label className="config-field">
                <span>Direction</span>
                <select
                  value={visualConfig.direction}
                  onChange={(event) => onVisualConfigChange((value) => ({
                    ...value,
                    direction: event.target.value as MermaidDirection,
                  }))}
                >
                  <option value="LR">Left to Right</option>
                  <option value="TB">Top to Bottom</option>
                  <option value="RL">Right to Left</option>
                  <option value="BT">Bottom to Top</option>
                </select>
              </label>

              <label className="config-field">
                <span>Curve</span>
                <select
                  value={visualConfig.curve}
                  onChange={(event) => onVisualConfigChange((value) => ({
                    ...value,
                    curve: event.target.value as MermaidCurve,
                  }))}
                >
                  <option value="basis">Basis</option>
                  <option value="linear">Linear</option>
                  <option value="monotoneX">Monotone</option>
                  <option value="stepBefore">Step</option>
                </select>
              </label>

              <label className="config-field">
                <span>Node spacing</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={visualConfig.nodeSpacing}
                  onChange={(event) => onVisualConfigChange((value) => ({
                    ...value,
                    nodeSpacing: Number(event.target.value) || 0,
                  }))}
                />
              </label>

              <label className="config-field">
                <span>Rank spacing</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={visualConfig.rankSpacing}
                  onChange={(event) => onVisualConfigChange((value) => ({
                    ...value,
                    rankSpacing: Number(event.target.value) || 0,
                  }))}
                />
              </label>

              <label className="config-field">
                <span>Padding</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={visualConfig.diagramPadding}
                  onChange={(event) => onVisualConfigChange((value) => ({
                    ...value,
                    diagramPadding: Number(event.target.value) || 0,
                  }))}
                />
              </label>
            </div>
          </div>
        ) : null}
      </section>
      <div className="diagram-frame" ref={diagramFrameRef}>
        {svg ? (
          <div className="chart-viewport">
            <div
              className="chart-stage"
              style={chartSize.width > 0 ? { width: chartSize.width * zoom, height: chartSize.height * zoom } : undefined}
            >
              <div
                ref={chartRef}
                className={`chart chart-zoom ${isPreviewStale ? 'chart-stale' : ''}`}
                style={{ transform: `scale(${zoom})` }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        ) : (
          <p className="muted">No valid diagram rendered yet.</p>
        )}
      </div>

      {showCode ? (
        <pre className="mermaid-text">{mermaidText || 'No chart generated due to diagnostics.'}</pre>
      ) : null}
    </article>
  )
}