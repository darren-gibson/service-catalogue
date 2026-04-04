# DSL Spec

## Hierarchy-First DSL Spec

Define a lightweight DSL for the service catalogue that uses indentation to represent the structural hierarchy and arrow syntax to represent uses relationships.

## Header

First non-comment line:
serviceCatalogue

## Hierarchy

Hierarchy is inferred by indentation depth:
- depth 0: OutcomeDomain
- depth 1: ServiceProduct, or description for OutcomeDomain/Consumer
- depth 2: ServiceOffering, or description for ServiceProduct
- depth 3: optional ServiceOffering parameter line

Rules:
- Tabs are required for hierarchy indentation.
- Mixed tabs and spaces are invalid.
- Depth greater than 3 is invalid.

## ServiceOffering Parameters

Optional parameters are child lines under a ServiceOffering.

General form:
		<service offering>
			description: <text>
			slo: <text>
			in: <text>
			out: <text>

Mapping:
- description maps to description.
- slo maps to slo.
- in maps to requestRequirements.
- out maps to provisionedService.

Rules:
- Allowed parameter keys are description, slo, in, and out.
- Parameter lines must be exactly one tab deeper than the parent ServiceOffering.

## Description Parameters

Description can be added to all node types.

General forms:
	<outcome domain>
		description: <text>

	<service product>
			description: <text>

Consumer: <name>
	description: <text>

## Consumers

General form:
Consumer: <name>

## Uses

General form:
<source> --> <target>

Rules:
- Source must resolve to a Consumer or ServiceOffering.
- Target must resolve to a ServiceOffering.

## Comments

Supported syntax:
- Standalone: # comment text
- Inline trailing: <statement> # comment text

Rules:
- Comments are non-semantic.
- Unescaped # starts a comment.
- Use \# for literal hash characters in parameter values.

## Validation Rules
1. Header must be serviceCatalogue.
2. Hierarchy depth and parent-child structure must be valid.
3. Names must satisfy uniqueness rules from the domain model.
4. Uses references must resolve.
5. Uses edges must be Consumer -> ServiceOffering.
6. Parameter keys must be description, slo, in, and/or out.
7. Comments must be ignored by parser and validator.

## Example

serviceCatalogue

# Hierarchy
Developer Enablement # Outcome domain for engineering experience
	description: Domain focused on developer productivity and platform enablement
	Environment Management
		description: Standardized environment lifecycle and access controls
		Non-Production Environment
			description: Self-service provisioning for non-production use
			slo: 99.9% availability, provisioned within 30 minutes
			in: Team code and environment size
			out: Ready-to-use non-production environment via \#gold profile
		Production Access Request
			description: Controlled path to request and approve production access
			slo: 95% of requests approved within 1 business day
			out: Approved production access

# Consumers
Consumer: Product Team
	description: Teams shipping customer-facing product features
Consumer: Engineering Teams # Internal users
	description: Internal engineering teams consuming shared platforms
Consumer: Delivery Partner
	description: External partner teams requiring governed access

# Uses
Product Team --> Non-Production Environment
Engineering Teams --> Non-Production Environment
Delivery Partner --> Production Access Request # External consumption
