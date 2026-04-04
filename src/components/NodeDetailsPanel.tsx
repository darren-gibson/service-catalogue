import type { RefObject } from 'react'
import type { NodeDetails } from '../domain/nodeDetails'
import { PaneLabel, UiIcon } from './AppIcons'

interface NodeDetailsPanelProps {
  detailsPanelRef: RefObject<HTMLElement | null>
  selectedNode: NodeDetails | null
  onClose: () => void
}

export function NodeDetailsPanel({ detailsPanelRef, selectedNode, onClose }: NodeDetailsPanelProps) {
  if (!selectedNode) {
    return null
  }

  return (
    <section className="details-panel details-panel-code" ref={detailsPanelRef}>
      <div className="details-header">
        <PaneLabel icon="details" label={selectedNode.name} />
        <button
          type="button"
          className="icon-btn"
          aria-label="Close details"
          onClick={onClose}
        >
          <UiIcon name="collapse" />
        </button>
      </div>
      <div className="details-content">
        <div className="detail-row">
          <strong>Type</strong>
          <p>{selectedNode.kind}</p>
        </div>
        {selectedNode.outcomeDomain && (
          <div className="detail-row">
            <strong>Outcome Domain</strong>
            <p>{selectedNode.outcomeDomain}</p>
          </div>
        )}
        {selectedNode.serviceProduct && (
          <div className="detail-row">
            <strong>Service Product</strong>
            <p>{selectedNode.serviceProduct}</p>
          </div>
        )}
        {selectedNode.description && (
          <div className="detail-row">
            <strong>Description</strong>
            <p>{selectedNode.description}</p>
          </div>
        )}
        {selectedNode.slo && (
          <div className="detail-row">
            <strong>SLO</strong>
            <p>{selectedNode.slo}</p>
          </div>
        )}
        {selectedNode.requestRequirements && (
          <div className="detail-row">
            <strong>Input</strong>
            <p>{selectedNode.requestRequirements}</p>
          </div>
        )}
        {selectedNode.provisionedService && (
          <div className="detail-row">
            <strong>Output</strong>
            <p>{selectedNode.provisionedService}</p>
          </div>
        )}
      </div>
    </section>
  )
}