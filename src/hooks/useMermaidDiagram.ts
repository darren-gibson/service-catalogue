import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import type { NodeDetails } from '../domain/nodeDetails'
import { extractCanonicalNodeId, matchesRenderedNodeId } from '../domain/nodeDetails'

interface UseMermaidDiagramOptions {
  mermaidText: string
  nodeDetailsById: Map<string, NodeDetails>
  nodeDetailsByName: Map<string, NodeDetails>
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
}

export function useMermaidDiagram({
  mermaidText,
  nodeDetailsById,
  nodeDetailsByName,
  selectedNodeId,
  onSelectNode,
}: UseMermaidDiagramOptions) {
  const [svg, setSvg] = useState('')
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })
  const chartRef = useRef<HTMLDivElement | null>(null)
  const bindMermaidFunctionsRef = useRef<((element: Element) => void) | null>(null)

  useEffect(() => {
    let cancelled = false

    async function renderMermaid() {
      if (!mermaidText) {
        return
      }

      try {
        const id = `catalogue-${Date.now()}`
        const { svg: rendered, bindFunctions } = await mermaid.render(id, mermaidText)
        if (!cancelled) {
          bindMermaidFunctionsRef.current = bindFunctions ?? null
          setSvg(rendered)
        }
      } catch (error) {
        if (!cancelled) {
          bindMermaidFunctionsRef.current = null
          const message = error instanceof Error ? error.message : String(error)
          setSvg(`<pre>Mermaid render error: ${message}</pre>`)
        }
      }
    }

    renderMermaid()
    return () => {
      cancelled = true
    }
  }, [mermaidText])

  useEffect(() => {
    type MermaidCallbackWindow = Window & {
      showNodeDetails?: (nodeId: string) => void
    }

    const callbackWindow = window as MermaidCallbackWindow
    callbackWindow.showNodeDetails = (nodeId: string) => {
      const canonicalId = extractCanonicalNodeId(nodeId)
      if (nodeDetailsById.has(canonicalId)) {
        onSelectNode(canonicalId)
      }
    }

    return () => {
      delete callbackWindow.showNodeDetails
    }
  }, [nodeDetailsById, onSelectNode])

  useEffect(() => {
    const chartEl = chartRef.current
    const bindFunctions = bindMermaidFunctionsRef.current
    if (!chartEl || !svg || !bindFunctions) {
      return
    }

    bindFunctions(chartEl)
  }, [svg])

  useEffect(() => {
    const chartEl = chartRef.current
    if (!chartEl) {
      return
    }

    for (const element of chartEl.querySelectorAll('.is-selected-node')) {
      element.classList.remove('is-selected-node')
    }

    if (!selectedNodeId) {
      return
    }

    const candidateNodes = chartEl.querySelectorAll('g.node[id], g.cluster[id]')
    for (const node of candidateNodes) {
      const renderedId = node.getAttribute('id')
      if (renderedId && matchesRenderedNodeId(renderedId, selectedNodeId)) {
        node.classList.add('is-selected-node')
      }
    }
  }, [selectedNodeId, svg])

  useEffect(() => {
    const chartEl = chartRef.current
    if (!chartEl || !svg) {
      return
    }

    const onSvgClick = (event: Event) => {
      const path = event.composedPath().filter((item): item is Element => item instanceof Element)
      const nodeGroup = path.find((el) => el.matches('g.node, g.cluster')) ?? null
      const idsInPath = path
        .map((el) => el.getAttribute('id'))
        .filter((value): value is string => Boolean(value && value.length > 0))
      const firstNodeId = idsInPath.find((value) => /(?:sg_od|sg_sp|so|c)_/.test(value)) ?? idsInPath[0] ?? ''
      const nodeId = nodeGroup?.getAttribute('id') || firstNodeId
      const label = (nodeGroup?.textContent || '').trim().replace(/\s+/g, ' ')

      let nextSelectedId: string | null = nodeDetailsById.get(nodeId)?.id ?? null

      if (!nextSelectedId) {
        nextSelectedId = nodeDetailsById.get(extractCanonicalNodeId(nodeId))?.id ?? null
      }

      if (!nextSelectedId && label) {
        nextSelectedId = nodeDetailsByName.get(label)?.id ?? null
      }

      if (nextSelectedId) {
        onSelectNode(nextSelectedId)
      }
    }

    chartEl.addEventListener('click', onSvgClick, true)
    return () => {
      chartEl.removeEventListener('click', onSvgClick, true)
    }
  }, [nodeDetailsById, nodeDetailsByName, onSelectNode, svg])

  useEffect(() => {
    const chartEl = chartRef.current
    if (!chartEl || !svg) {
      setChartSize({ width: 0, height: 0 })
      return
    }

    const updateSize = () => {
      setChartSize({
        width: chartEl.scrollWidth,
        height: chartEl.scrollHeight,
      })
    }

    const frame = requestAnimationFrame(updateSize)
    window.addEventListener('resize', updateSize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateSize)
    }
  }, [svg])

  return {
    chartRef,
    chartSize,
    svg,
  }
}