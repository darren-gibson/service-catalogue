export const SAMPLE_DSL = `serviceCatalogue

# Hierarchy
Developer Enablement
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

Security & Trust
	description: Domain focused on identity, access, and verification controls
	Identity Services
		description: Core identity capabilities used by platform and product teams
		Identity Verification
			description: Verifies engineer identity before granting privileged actions
			slo: 99.95% verification success, completed within 2 minutes
			in: Proof of identity (e.g. OAuth token)
			out: Verified identity result with assurance level

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
Delivery Partner --> Production Access Request
# Service offering dependency example
Production Access Request --> Identity Verification`