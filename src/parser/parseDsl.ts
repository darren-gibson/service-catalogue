import type { CatalogueModel, ServiceOffering } from "../domain/types";
import type { Diagnostic, ParseResult } from "./types";

function stripComment(line: string): string {
  let output = "";

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === "\\" && next === "#") {
      output += "#";
      i += 1;
      continue;
    }

    if (ch === "#") {
      break;
    }

    output += ch;
  }

  return output.replace(/[ \t]+$/, "");
}

function countLeadingTabs(value: string): number {
  let i = 0;
  while (i < value.length && value[i] === "\t") {
    i += 1;
  }
  return i;
}

export function parseDsl(input: string): ParseResult {
  const diagnostics: Diagnostic[] = [];
  const model: CatalogueModel = {
    outcomeDomains: [],
    serviceProducts: [],
    serviceOfferings: [],
    consumers: [],
    uses: [],
  };

  const lines = input.split(/\r?\n/);

  let headerSeen = false;
  let currentOutcome: string | null = null;
  let currentProduct: string | null = null;
  let currentOffering: ServiceOffering | null = null;
  let currentOutcomeIndex: number | null = null;
  let currentProductIndex: number | null = null;
  let currentConsumerIndex: number | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNo = index + 1;
    const rawLine = lines[index];
    const noComment = stripComment(rawLine);

    if (noComment.trim() === "") {
      continue;
    }

    if (!headerSeen) {
      if (noComment.trim() !== "serviceCatalogue") {
        diagnostics.push({
          line: lineNo,
          message: "First non-comment line must be serviceCatalogue",
        });
      }
      headerSeen = true;
      continue;
    }

    if (/^ +/.test(noComment)) {
      diagnostics.push({
        line: lineNo,
        message: "Spaces are not allowed for hierarchy indentation; use tabs",
      });
      continue;
    }

    const trimmed = noComment.trim();

    if (trimmed.startsWith("Consumer:")) {
      const name = trimmed.slice("Consumer:".length).trim();
      if (!name) {
        diagnostics.push({ line: lineNo, message: "Consumer name cannot be empty" });
        continue;
      }

      model.consumers.push({ kind: "Consumer", name });
      currentConsumerIndex = model.consumers.length - 1;
      currentOutcome = null;
      currentProduct = null;
      currentOutcomeIndex = null;
      currentProductIndex = null;
      currentOffering = null;
      continue;
    }

    if (trimmed.includes("-->")) {
      const [source, target] = trimmed.split("-->").map((part) => part.trim());
      if (!source || !target) {
        diagnostics.push({ line: lineNo, message: "Uses relationship must be '<source> --> <target>'" });
        continue;
      }

      model.uses.push({ from: source, to: target });
      currentConsumerIndex = null;
      currentOffering = null;
      continue;
    }

    const depth = countLeadingTabs(noComment);
    const content = noComment.slice(depth).trim();

    if (!content) {
      continue;
    }

    if (depth > 3) {
      diagnostics.push({ line: lineNo, message: "Hierarchy depth greater than 3 is invalid" });
      continue;
    }

    if (depth === 0) {
      currentOutcome = content;
      currentProduct = null;
      currentOffering = null;
      model.outcomeDomains.push({ kind: "OutcomeDomain", name: content });
      currentOutcomeIndex = model.outcomeDomains.length - 1;
      currentProductIndex = null;
      currentConsumerIndex = null;
      continue;
    }

    if (depth === 1) {
      const keyValue = content.split(":");
      const key = keyValue[0]?.trim();
      const value = keyValue.slice(1).join(":").trim();

      if (key === "description") {
        if (!value) {
          diagnostics.push({ line: lineNo, message: "Parameter line must be '<key>: <value>'" });
          continue;
        }

        if (currentConsumerIndex !== null) {
          model.consumers[currentConsumerIndex].description = value;
          continue;
        }

        if (currentOutcomeIndex !== null) {
          model.outcomeDomains[currentOutcomeIndex].description = value;
          continue;
        }

        diagnostics.push({ line: lineNo, message: "Description must be under an OutcomeDomain or Consumer" });
        continue;
      }

      if (!currentOutcome) {
        diagnostics.push({ line: lineNo, message: "ServiceProduct must be under an OutcomeDomain" });
        continue;
      }

      currentProduct = content;
      currentOffering = null;
      model.serviceProducts.push({
        kind: "ServiceProduct",
        name: content,
        outcomeDomain: currentOutcome,
      });
      currentProductIndex = model.serviceProducts.length - 1;
      currentConsumerIndex = null;
      continue;
    }

    if (depth === 2) {
      const keyValue = content.split(":");
      const key = keyValue[0]?.trim();
      const value = keyValue.slice(1).join(":").trim();

      if (key === "description") {
        if (!value) {
          diagnostics.push({ line: lineNo, message: "Parameter line must be '<key>: <value>'" });
          continue;
        }

        if (currentProductIndex !== null) {
          model.serviceProducts[currentProductIndex].description = value;
          continue;
        }

        diagnostics.push({ line: lineNo, message: "Description must be under a ServiceProduct" });
        continue;
      }

      if (!currentProduct) {
        diagnostics.push({ line: lineNo, message: "ServiceOffering must be under a ServiceProduct" });
        continue;
      }

      currentOffering = {
        kind: "ServiceOffering",
        name: content,
        serviceProduct: currentProduct,
      };
      model.serviceOfferings.push(currentOffering);
      currentConsumerIndex = null;
      continue;
    }

    if (!currentOffering) {
      diagnostics.push({ line: lineNo, message: "Parameter line must be under a ServiceOffering" });
      continue;
    }

    const keyValue = content.split(":");
    const key = keyValue[0]?.trim();
    const value = keyValue.slice(1).join(":").trim();

    if (!key || !value) {
      diagnostics.push({ line: lineNo, message: "Parameter line must be '<key>: <value>'" });
      continue;
    }

    if (key === "in") {
      currentOffering.requestRequirements = value;
      continue;
    }

    if (key === "out") {
      currentOffering.provisionedService = value;
      continue;
    }

    if (key === "description") {
      currentOffering.description = value;
      continue;
    }

    if (key === "slo") {
      currentOffering.slo = value;
      continue;
    }

    diagnostics.push({
      line: lineNo,
      message: "Invalid ServiceOffering parameter key. Use 'description', 'slo', 'in', and/or 'out'",
    });
  }

  if (!headerSeen) {
    diagnostics.push({ line: 1, message: "Missing serviceCatalogue header" });
  }

  return { model, diagnostics };
}
