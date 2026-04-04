# Domain Model Spec

## Lightweight Domain Model Spec

Define the MVP domain model for a service-catalogue DSL. The model includes three catalogue node types, one consumer node type, relationship edges, optional authoring fields, and name-based identity.

## Scope

Included in v1:
- OutcomeDomain
- ServiceProduct
- ServiceOffering
- Consumer
- contains edges
- uses edges
- name-based identity

Excluded from v1:
- lifecycle states
- delivery workflow modelling
- metrics definitions
- advanced relationship types
- ownership hierarchy beyond node naming

## Node Definitions

### OutcomeDomain
- Purpose: top-level grouping for service outcomes.
- Required fields:
  - name
- Optional fields:
  - description
- Rules:
  - name is the identifier.
  - name must be globally unique.

### ServiceProduct
- Purpose: a product grouping under an OutcomeDomain.
- Required fields:
  - name
- Optional fields:
  - description
- Rules:
  - name is the identifier.
  - name must be globally unique.

### ServiceOffering
- Purpose: the consumer-facing service that can be used or requested.
- Required fields:
  - name
- Optional fields:
  - description
  - slo
  - requestRequirements
  - provisionedService
- Rules:
  - name is the identifier.
  - name must be globally unique.

### Consumer
- Purpose: an actor that uses a ServiceOffering.
- Required fields:
  - name
- Optional fields:
  - description
- Rules:
  - name is the identifier.
  - name must be globally unique.

## Edge Definitions

### OutcomeDomain -> ServiceProduct
- Relationship: contains
- Meaning: the ServiceProduct belongs to the OutcomeDomain.

### ServiceProduct -> ServiceOffering
- Relationship: contains
- Meaning: the ServiceOffering belongs to the ServiceProduct.

### Consumer -> ServiceOffering
- Relationship: uses
- Meaning: the Consumer uses the ServiceOffering.

### ServiceOffering -> ServiceOffering
- Relationship: uses
- Meaning: one ServiceOffering consumes another ServiceOffering.

## Identity And Uniqueness Rules
- Names are the canonical identifiers for all nodes.
- OutcomeDomain names are globally unique.
- ServiceProduct names are globally unique.
- ServiceOffering names are globally unique.
- Consumer names are globally unique.
- References in the DSL must use these names.

## Comment Annotations
- Comments are supported in DSL source for readability and author guidance.
- Comments do not create domain nodes, fields, or relationships.
- Comments are ignored by parsing output, mapping, validation, and visualization data models.
- Supported forms are defined in the DSL spec (standalone and inline trailing comments).

## Validation
1. Check node-name uniqueness according to the rules above.
2. Check that each edge links valid node names.
3. Check that each Consumer declaration provides a non-empty name.
4. Optional fields are metadata and must not alter identity rules.
