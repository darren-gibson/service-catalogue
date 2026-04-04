import type { CatalogueModel } from './types'

export type NodeKindLabel = 'OutcomeDomain' | 'ServiceProduct' | 'ServiceOffering' | 'Consumer'

export interface NodeDetails {
  id: string
  kind: NodeKindLabel
  name: string
  description?: string
  slo?: string
  requestRequirements?: string
  provisionedService?: string
  outcomeDomain?: string
  serviceProduct?: string
}

const NODE_ID_PATTERN = /(?:sg_od|sg_sp|so|c)_[a-z0-9_]+/

export function toNodeId(prefix: string, name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return `${prefix}_${normalized || 'node'}`
}

export function extractCanonicalNodeId(nodeId: string): string {
  return nodeId.match(NODE_ID_PATTERN)?.[0] ?? nodeId
}

export function matchesRenderedNodeId(renderedId: string, canonicalId: string): boolean {
  return renderedId === canonicalId
    || renderedId.startsWith(`${canonicalId}-`)
    || renderedId.endsWith(`-${canonicalId}`)
    || renderedId.includes(`-${canonicalId}-`)
}

export function buildNodeDetailsIndex(model: CatalogueModel) {
  const byId = new Map<string, NodeDetails>()

  for (const outcome of model.outcomeDomains) {
    const id = toNodeId('sg_od', outcome.name)
    byId.set(id, {
      id,
      kind: 'OutcomeDomain',
      name: outcome.name,
      description: outcome.description,
    })
  }

  for (const product of model.serviceProducts) {
    const id = toNodeId('sg_sp', product.name)
    byId.set(id, {
      id,
      kind: 'ServiceProduct',
      name: product.name,
      description: product.description,
      outcomeDomain: product.outcomeDomain,
    })
  }

  for (const offering of model.serviceOfferings) {
    const id = toNodeId('so', offering.name)
    byId.set(id, {
      id,
      kind: 'ServiceOffering',
      name: offering.name,
      description: offering.description,
      slo: offering.slo,
      requestRequirements: offering.requestRequirements,
      provisionedService: offering.provisionedService,
      serviceProduct: offering.serviceProduct,
    })
  }

  for (const consumer of model.consumers) {
    const id = toNodeId('c', consumer.name)
    byId.set(id, {
      id,
      kind: 'Consumer',
      name: consumer.name,
      description: consumer.description,
    })
  }

  const byName = new Map<string, NodeDetails>()
  for (const item of byId.values()) {
    byName.set(item.name, item)
    if (item.kind === 'Consumer') {
      byName.set(`👥 ${item.name}`, item)
    }
  }

  return { byId, byName }
}