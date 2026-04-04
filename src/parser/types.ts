import type { CatalogueModel } from "../domain/types";

export interface Diagnostic {
  line: number;
  message: string;
}

export interface ParseResult {
  model: CatalogueModel;
  diagnostics: Diagnostic[];
}
