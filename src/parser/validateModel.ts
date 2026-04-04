import type { CatalogueModel } from "../domain/types";
import type { Diagnostic } from "./types";

export function validateModel(model: CatalogueModel): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  const names = new Map<string, string>();
  const addName = (name: string, kind: string) => {
    const existing = names.get(name);
    if (existing) {
      diagnostics.push({
        line: 0,
        message: `Name '${name}' is duplicated across node types (${existing} and ${kind})`,
      });
      return;
    }
    names.set(name, kind);
  };

  model.outcomeDomains.forEach((item) => addName(item.name, item.kind));
  model.serviceProducts.forEach((item) => addName(item.name, item.kind));
  model.serviceOfferings.forEach((item) => addName(item.name, item.kind));
  model.consumers.forEach((item) => addName(item.name, item.kind));

  const consumers = new Set(model.consumers.map((c) => c.name));
  const offerings = new Set(model.serviceOfferings.map((s) => s.name));

  model.uses.forEach((edge) => {
    const sourceIsConsumer = consumers.has(edge.from);
    const sourceIsOffering = offerings.has(edge.from);

    if (!sourceIsConsumer && !sourceIsOffering) {
      diagnostics.push({
        line: 0,
        message: `Uses source '${edge.from}' must reference a Consumer or ServiceOffering`,
      });
    }

    if (!offerings.has(edge.to)) {
      diagnostics.push({
        line: 0,
        message: `Uses target '${edge.to}' must reference a ServiceOffering`,
      });
    }
  });

  return diagnostics;
}
