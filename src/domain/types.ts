export type NodeKind = "OutcomeDomain" | "ServiceProduct" | "ServiceOffering" | "Consumer";

export interface OutcomeDomain {
  kind: "OutcomeDomain";
  name: string;
  description?: string;
}

export interface ServiceProduct {
  kind: "ServiceProduct";
  name: string;
  outcomeDomain: string;
  description?: string;
}

export interface ServiceOffering {
  kind: "ServiceOffering";
  name: string;
  serviceProduct: string;
  description?: string;
  slo?: string;
  requestRequirements?: string;
  provisionedService?: string;
}

export interface Consumer {
  kind: "Consumer";
  name: string;
  description?: string;
}

export interface UsesEdge {
  from: string;
  to: string;
}

export interface CatalogueModel {
  outcomeDomains: OutcomeDomain[];
  serviceProducts: ServiceProduct[];
  serviceOfferings: ServiceOffering[];
  consumers: Consumer[];
  uses: UsesEdge[];
}
