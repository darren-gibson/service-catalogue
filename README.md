# Service Catalogue DSL Workbench

Service Catalogue DSL Workbench is a visual modeling tool for designing, validating, and exploring service ecosystems using a simple, hierarchy-first DSL and live Mermaid diagrams.

Teams can define domains, products, service offerings, consumers, and cross-service dependencies in plain text, then immediately inspect the rendered graph and node details to refine architecture and platform design decisions.

This project includes:

- hierarchy-first DSL parsing
- semantic validation
- Mermaid flowchart LR visualization

## Run

1. Install dependencies

   npm install

2. Start development server

   npm run dev

3. Build for production

   npm run build

## Specs

- specs/domain-model.md
- specs/dsl-spec.md

## DSL Features In MVP

- Header: serviceCatalogue
- Hierarchy by tab depth
  - depth 0: OutcomeDomain
  - depth 1: ServiceProduct, or description for OutcomeDomain/Consumer
  - depth 2: ServiceOffering, or description for ServiceProduct
  - depth 3: optional ServiceOffering parameter lines
- Optional node descriptions
  - description on OutcomeDomain, ServiceProduct, ServiceOffering, and Consumer
- ServiceOffering optional parameters
  - description: offering description
  - slo: service-level objective
  - in: request requirements
  - out: provisioned service result
- Consumers
  - Consumer: <name>
- Uses relationships
  - <consumer or service offering> --> <service offering>
- Comments
  - standalone and inline trailing comments with #
  - escape literal hash in values as \#

## Example Input

See examples/sample.catalogue.

## License

This project is licensed under the Apache License 2.0. See LICENSE.
