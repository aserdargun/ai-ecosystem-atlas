import type { Capability } from "@/data/schema";

type CapabilitySeed = [id: string, name: string, description: string, tags: string[]];

const groups: Array<[categoryId: string, seeds: CapabilitySeed[]]> = [
  ["models", [
    ["frontier-model-lineup", "Frontier model lineup", "Current generally available frontier model families.", ["models", "lineup"]],
    ["context-window", "Context window", "Documented model input-context limits.", ["tokens", "context"]],
    ["multimodal-input", "Multimodal input", "Model support for inputs beyond plain text.", ["vision", "images"]],
    ["native-image-generation", "Native image generation", "First-party generation of images from prompts.", ["images", "generation"]],
  ]],
  ["chat-knowledge-work", [
    ["conversational-chat", "Conversational chat", "A first-party conversational assistant experience.", ["chat", "assistant"]],
    ["projects", "Projects", "Workspaces that group chats, files, and instructions.", ["projects", "workspace"]],
    ["delegated-knowledge-work", "Delegated knowledge work", "Agentic delegation of research, analysis, and deliverables.", ["delegation", "knowledge-work"]],
    ["long-running-work", "Long-running work", "Tasks that continue beyond a single interactive response.", ["long-running", "background"]],
  ]],
  ["coding-agents", [
    ["primary-coding-agent", "Primary coding agent", "A first-party agent for software-development tasks.", ["coding", "agent"]],
    ["terminal-cli", "Terminal CLI", "A coding-agent interface that runs from a terminal.", ["terminal", "cli"]],
    ["ide-integration", "IDE integration", "A first-party coding-agent integration for editors or IDEs.", ["ide", "editor"]],
    ["desktop-coding", "Desktop coding", "A native desktop surface for coding-agent work.", ["desktop", "coding"]],
    ["browser-cloud-coding", "Browser or cloud coding", "A browser-accessible coding agent backed by remote execution.", ["browser", "cloud"]],
  ]],
  ["agentic-workflows", [
    ["custom-subagents", "Custom subagents", "Specialized child agents with their own instructions or configuration.", ["subagents", "delegation"]],
    ["multi-agent-orchestration", "Multi-agent orchestration", "Coordinated execution across more than one agent.", ["multi-agent", "orchestration"]],
    ["hosted-agent-runtime", "Hosted agent runtime", "A vendor-managed runtime for executing persistent agents.", ["hosted", "runtime"]],
    ["function-tool-calling", "Function and tool calling", "Structured model requests to application-defined tools.", ["functions", "tools"]],
  ]],
  ["customization", [
    ["project-instruction-file", "Project instruction file", "Repository-scoped instructions discovered from a conventional file.", ["instructions", "repository"]],
    ["configuration-scopes", "Configuration scopes", "Configuration at user, project, and managed scopes.", ["configuration", "scopes"]],
    ["lifecycle-hooks", "Lifecycle hooks", "Commands or handlers triggered at defined agent lifecycle events.", ["hooks", "events"]],
    ["custom-agent-definitions", "Custom agent definitions", "Reusable named agent configurations with specialized behavior.", ["agents", "definitions"]],
  ]],
  ["skills-plugins", [
    ["agent-skills", "Agent skills", "Reusable instruction packages that teach an agent a workflow.", ["skills", "instructions"]],
    ["plugin-packaging", "Plugin packaging", "A package format combining reusable agent extensions.", ["plugins", "packaging"]],
    ["plugin-distribution", "Plugin distribution", "A documented channel for sharing or publishing extension packages.", ["plugins", "distribution"]],
  ]],
  ["connectors-mcp", [
    ["mcp-client", "MCP client", "First-party support for connecting to Model Context Protocol servers.", ["mcp", "client"]],
    ["remote-connectors", "Remote connectors", "Hosted connections to third-party services and organizational data.", ["connectors", "remote"]],
    ["local-connectors", "Local connectors", "Connections to tools or data running on a user's machine or network.", ["connectors", "local"]],
  ]],
  ["memory-context", [
    ["chat-memory", "Chat memory", "Persistent personalization or context across conversations.", ["memory", "chat"]],
    ["project-memory", "Project memory", "Persistent context scoped to a project or workspace.", ["memory", "projects"]],
    ["coding-auto-memory", "Coding auto-memory", "Coding-agent memory maintained automatically across tasks.", ["memory", "coding"]],
    ["cross-provider-import", "Cross-provider import", "A supported path to import personalization from another assistant.", ["import", "migration"]],
  ]],
  ["files-artifacts", [
    ["file-analysis", "File analysis", "Understanding and analyzing uploaded or connected files.", ["files", "analysis"]],
    ["document-generation", "Document generation", "Creating editable documents or downloadable deliverables.", ["documents", "generation"]],
    ["interactive-artifacts", "Interactive artifacts", "Interactive work products rendered beside or within chat.", ["artifacts", "canvas"]],
    ["sandboxed-code-execution", "Sandboxed code execution", "Executing code in an isolated environment for analysis or generation.", ["sandbox", "code"]],
  ]],
  ["research-web", [
    ["web-search", "Web search", "Searching current web content from the product or API.", ["web", "search"]],
    ["deep-research", "Deep research", "Multi-step research that synthesizes multiple sources.", ["research", "agent"]],
    ["source-citations", "Source citations", "Answers that expose links or citations for web evidence.", ["citations", "sources"]],
    ["web-fetch", "Web fetch", "Retrieving content from a specific URL for model use.", ["web", "fetch"]],
  ]],
  ["computer-browser-voice", [
    ["computer-use-product", "Computer use product", "A first-party product surface that can operate a computer.", ["computer-use", "product"]],
    ["computer-use-api", "Computer use API", "A developer tool schema or API for screen, mouse, and keyboard interaction.", ["computer-use", "api"]],
    ["browser-control", "Browser control", "A first-party agent interface for navigating and acting in a browser.", ["browser", "control"]],
    ["voice-mode", "Voice mode", "Real-time spoken interaction in a first-party assistant.", ["voice", "audio"]],
  ]],
  ["local-cloud-environments", [
    ["local-execution", "Local execution", "Agent execution against a local checkout or machine.", ["local", "execution"]],
    ["managed-cloud-environments", "Managed cloud environments", "Vendor-managed remote environments for agent work.", ["cloud", "environment"]],
    ["worktree-isolation", "Worktree isolation", "Parallel task isolation with Git worktrees or an equivalent mechanism.", ["git", "worktrees"]],
    ["execution-sandbox", "Execution sandbox", "Restrictions that limit filesystem, network, or command access.", ["sandbox", "isolation"]],
  ]],
  ["automation-scheduling", [
    ["scheduled-tasks", "Scheduled tasks", "Tasks that run at a selected time or recurring cadence.", ["schedule", "recurring"]],
    ["background-continuation", "Background continuation", "Work that continues asynchronously after the initiating request.", ["background", "async"]],
    ["event-driven-automation", "Event-driven automation", "Agent runs triggered by external events or automation pipelines.", ["events", "automation"]],
  ]],
  ["permissions-security", [
    ["permission-modes", "Permission modes", "Named operating modes that govern which actions require approval.", ["permissions", "modes"]],
    ["fine-grained-permission-rules", "Fine-grained permission rules", "Allow and deny rules scoped to tools, commands, or resources.", ["permissions", "rules"]],
    ["full-autonomy-mode", "Full autonomy mode", "An explicit mode that minimizes or bypasses approval prompts.", ["autonomy", "approvals"]],
    ["enterprise-policy", "Enterprise policy", "Administrator-enforced controls over agent behavior and configuration.", ["enterprise", "policy"]],
  ]],
  ["api-sdk", [
    ["core-model-api", "Core model API", "A first-party API for model requests and responses.", ["api", "models"]],
    ["agent-sdk", "Agent SDK", "A first-party SDK for building and running agents.", ["sdk", "agents"]],
    ["built-in-api-tools", "Built-in API tools", "Vendor-hosted tools enabled directly in model API requests.", ["api", "tools"]],
    ["api-mcp", "API MCP", "MCP connectivity available inside the model or agent API.", ["api", "mcp"]],
  ]],
  ["enterprise-governance", [
    ["team-enterprise-plans", "Team and enterprise plans", "Managed multi-user offerings for organizations.", ["team", "enterprise"]],
    ["sso-scim", "SSO and SCIM", "Enterprise identity and automated user provisioning controls.", ["sso", "scim"]],
    ["audit-logs", "Audit logs", "Organization-level records of administrative or user activity.", ["audit", "logs"]],
    ["data-retention-controls", "Data-retention controls", "Configurable policies governing how long organization data is retained.", ["retention", "governance"]],
  ]],
  ["pricing-plans", [
    ["consumer-plans", "Consumer plans", "Free and paid plans intended for individual users.", ["consumer", "plans"]],
    ["business-plans", "Business plans", "Self-serve multi-user plans for teams or businesses.", ["business", "plans"]],
    ["enterprise-pricing", "Enterprise pricing", "Published enterprise pricing or a documented sales-led quote path.", ["enterprise", "pricing"]],
    ["api-token-pricing", "API token pricing", "Published model input and output token prices.", ["api", "pricing"]],
  ]],
];

export const capabilities = groups.flatMap(([categoryId, seeds]) =>
  seeds.map(([id, name, description, tags], index) => ({
    id,
    categoryId,
    name,
    description,
    tags,
    order: index + 1,
  })),
) satisfies Capability[];
