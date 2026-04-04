import type { CatalogueModel, ServiceOffering } from "../domain/types";

export interface MermaidDiagramOptions {
  direction?: "LR" | "TB" | "RL" | "BT";
}

function sanitizeId(prefix: string, value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${prefix}_${normalized || "node"}`;
}

function escapeLabel(value: string): string {
  return value.replace(/"/g, "&quot;");
}

function formatEdgeLabel(value: string): string {
  // Mermaid flowchart edge labels can break on punctuation like parentheses unless quoted.
  // JSON.stringify gives us a safely quoted string with escaped characters when needed.
  return JSON.stringify(value.trim());
}

function offeringLabel(offering: ServiceOffering): string {
  return escapeLabel(offering.name);
}

function consumerLabel(name: string): string {
  // Prefix with a team/user icon to visually distinguish consumer nodes.
  return escapeLabel(`👥 ${name}`);
}

export function toMermaid(model: CatalogueModel, options: MermaidDiagramOptions = {}): string {
  const lines: string[] = [`flowchart ${options.direction ?? "LR"}`];

  const outcomeSubgraphIds = new Map<string, string>();
  const productSubgraphIds = new Map<string, string>();
  const productNamesByOutcome = new Map<string, string[]>();
  const offeringNamesByProduct = new Map<string, string[]>();
  const offeringByName = new Map<string, ServiceOffering>();
  const offeringNodeIds = new Map<string, string>();
  const consumerNodeIds = new Map<string, string>();

  for (const outcome of model.outcomeDomains) {
    outcomeSubgraphIds.set(outcome.name, sanitizeId("sg_od", outcome.name));
    productNamesByOutcome.set(outcome.name, []);
  }

  for (const product of model.serviceProducts) {
    productSubgraphIds.set(product.name, sanitizeId("sg_sp", product.name));
    offeringNamesByProduct.set(product.name, []);

    const list = productNamesByOutcome.get(product.outcomeDomain);
    if (list) {
      list.push(product.name);
    }
  }

  for (const offering of model.serviceOfferings) {
    offeringByName.set(offering.name, offering);
    offeringNodeIds.set(offering.name, sanitizeId("so", offering.name));

    const list = offeringNamesByProduct.get(offering.serviceProduct);
    if (list) {
      list.push(offering.name);
    }
  }

  for (const outcome of model.outcomeDomains) {
    const outcomeSubgraphId = outcomeSubgraphIds.get(outcome.name);
    if (!outcomeSubgraphId) {
      continue;
    }

    lines.push(`  subgraph ${outcomeSubgraphId}["${escapeLabel(outcome.name)}"]`);
    lines.push("    direction TB");

    for (const productName of productNamesByOutcome.get(outcome.name) ?? []) {
      const productSubgraphId = productSubgraphIds.get(productName);
      if (!productSubgraphId) {
        continue;
      }

      lines.push(`    subgraph ${productSubgraphId}["${escapeLabel(productName)}"]`);
      lines.push("      direction TB");

      for (const offeringName of offeringNamesByProduct.get(productName) ?? []) {
        const offering = offeringByName.get(offeringName);
        const offeringNodeId = offeringNodeIds.get(offeringName);

        if (!offering || !offeringNodeId) {
          continue;
        }

        lines.push(`      ${offeringNodeId}["${offeringLabel(offering)}"]`);
      }

      lines.push("    end");
    }

    lines.push("  end");
  }

  for (const consumer of model.consumers) {
    const id = sanitizeId("c", consumer.name);
    consumerNodeIds.set(consumer.name, id);
    // Render consumers as a distinct hexagon shape to visually separate users/teams.
    lines.push(`  ${id}{{"${consumerLabel(consumer.name)}"}}`);
  }

  for (const use of model.uses) {
    const sourceId = consumerNodeIds.get(use.from) ?? offeringNodeIds.get(use.from);
    const targetId = offeringNodeIds.get(use.to);
    const offering = offeringByName.get(use.to);
    const edgeLabel = offering?.requestRequirements?.trim();

    if (sourceId && targetId) {
      if (edgeLabel) {
        lines.push(`  ${sourceId} -->|${formatEdgeLabel(edgeLabel)}| ${targetId}`);
      } else {
        lines.push(`  ${sourceId} --> ${targetId}`);
      }
    }
  }

  // Expose explicit click hooks for all node types so the app can open a details panel.
  for (const outcome of model.outcomeDomains) {
    const outcomeNodeId = outcomeSubgraphIds.get(outcome.name);
    if (outcomeNodeId) {
      lines.push(`  click ${outcomeNodeId} showNodeDetails "Show details"`);
    }
  }

  for (const product of model.serviceProducts) {
    const productNodeId = productSubgraphIds.get(product.name);
    if (productNodeId) {
      lines.push(`  click ${productNodeId} showNodeDetails "Show details"`);
    }
  }

  for (const offering of model.serviceOfferings) {
    const offeringNodeId = offeringNodeIds.get(offering.name);
    if (offeringNodeId) {
      lines.push(`  click ${offeringNodeId} showNodeDetails "Show details"`);
    }
  }

  for (const consumer of model.consumers) {
    const consumerNodeId = consumerNodeIds.get(consumer.name);
    if (consumerNodeId) {
      lines.push(`  click ${consumerNodeId} showNodeDetails "Show details"`);
    }
  }

  return lines.join("\n");
}
