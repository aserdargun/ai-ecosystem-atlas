import type { Category } from "@/data/schema";

export const categories = [
  ["models", "Models", "Models", "Model families, modalities, and context limits."],
  ["chat-knowledge-work", "Chat & Knowledge Work", "Knowledge Work", "Conversational and delegated knowledge-work surfaces."],
  ["coding-agents", "Coding Agents", "Coding", "First-party agents for understanding, changing, and reviewing code."],
  ["agentic-workflows", "Agentic Workflows", "Agents", "Agent definition, orchestration, and tool-calling primitives."],
  ["customization", "Customization", "Customization", "Instructions, configuration, hooks, and reusable agent definitions."],
  ["skills-plugins", "Skills & Plugins", "Skills", "Packaged instructions and distributable extensions."],
  ["connectors-mcp", "Connectors & MCP", "Connectors", "Connections to remote and local tools and data."],
  ["memory-context", "Memory & Context", "Memory", "Persistent personal, project, and coding context."],
  ["files-artifacts", "Files & Artifacts", "Files", "File analysis, generated deliverables, and interactive work products."],
  ["research-web", "Research & Web", "Research", "Search, research, citation, and URL-retrieval capabilities."],
  ["computer-browser-voice", "Computer, Browser & Voice", "Computer & Voice", "Direct interaction through computers, browsers, and speech."],
  ["local-cloud-environments", "Local & Cloud Environments", "Environments", "Execution locations, isolation, and managed environments."],
  ["automation-scheduling", "Automation & Scheduling", "Automation", "Scheduled, background, and event-triggered work."],
  ["permissions-security", "Permissions & Security", "Security", "Approval modes, fine-grained rules, autonomy, and policy controls."],
  ["api-sdk", "API & SDK", "API & SDK", "Core model APIs, agent SDKs, and built-in tools."],
  ["enterprise-governance", "Enterprise & Governance", "Enterprise", "Organization plans, identity, audit, and retention controls."],
  ["pricing-plans", "Pricing & Plans", "Pricing", "Consumer, business, enterprise, and token-based pricing."],
].map(([id, name, shortName, description], index) => ({
  id,
  name,
  shortName,
  description,
  order: index + 1,
})) satisfies Category[];
