import type {
  Availability,
  ComparisonStatus,
  VendorEntry,
} from "@/data/schema";

type VendorFact = {
  title: string;
  summary: string;
  productNames: string[];
  sourceIds: string[];
  availability: Availability;
  details?: string[];
};

export type CapabilityFact = {
  capabilityId: string;
  anthropic: VendorFact;
  openai: VendorFact;
  assessmentStatus: ComparisonStatus;
  assessmentSummary: string;
};

const available = (
  title: string,
  summary: string,
  productNames: string[],
  sourceIds: string[],
  details?: string[],
): VendorFact => ({
  title,
  summary,
  productNames,
  sourceIds,
  availability: "available",
  details,
});

const limited = (
  title: string,
  summary: string,
  productNames: string[],
  sourceIds: string[],
): VendorFact => ({
  title,
  summary,
  productNames,
  sourceIds,
  availability: "limited",
});

const undocumented = (
  title: string,
  subject: string,
  productNames: string[],
  sourceIds: string[],
): VendorFact => ({
  title,
  summary: `The reviewed official documentation does not document ${subject}.`,
  productNames,
  sourceIds,
  availability: "not-documented",
});

const pair = (
  capabilityId: string,
  anthropic: VendorFact,
  openai: VendorFact,
  assessmentStatus: ComparisonStatus,
  assessmentSummary: string,
): CapabilityFact => ({
  capabilityId,
  anthropic,
  openai,
  assessmentStatus,
  assessmentSummary,
});

export const capabilityFacts = [
  pair(
    "frontier-model-lineup",
    available("Current Claude models", "Anthropic documents Claude Fable 5, Opus 5, Sonnet 5, and Haiku 4.5 as its latest generally available lineup.", ["Claude"], ["anthropic-models"]),
    available("Current OpenAI models", "OpenAI recommends the GPT-5.6 Sol, Terra, and Luna family for current frontier API workloads.", ["GPT-5.6"], ["openai-models"]),
    "strong-parity",
    "Both vendors publish multiple current frontier models with positioning and lifecycle documentation.",
  ),
  pair(
    "context-window",
    available("Claude context limits", "Current Claude models document context windows from 200,000 to 1,000,000 tokens.", ["Claude"], ["anthropic-models"]),
    available("OpenAI context limits", "The current GPT-5.6 API family documents 1,050,000-token context windows.", ["GPT-5.6"], ["openai-models"]),
    "strong-parity",
    "Both vendors publish numeric context-window limits for current models.",
  ),
  pair(
    "multimodal-input",
    available("Claude text and image input", "Anthropic documents text and image input across current Claude models.", ["Claude"], ["anthropic-models"]),
    available("OpenAI text and image input", "OpenAI documents text and image input across its latest models.", ["GPT-5.6"], ["openai-models"]),
    "strong-parity",
    "Both current model lineups accept text and image input.",
  ),
  pair(
    "native-image-generation",
    undocumented("Claude image generation", "a native image-generation model or tool in the reviewed Claude model and tool catalogs", ["Claude"], ["anthropic-models", "anthropic-tool-reference"]),
    available("GPT Image generation", "OpenAI provides first-party image-generation models and an image-generation API tool.", ["GPT Image 2", "Image generation"], ["openai-image-generation", "openai-models"]),
    "vendor-specific",
    "OpenAI documents native image generation; the reviewed Anthropic catalogs do not document an equivalent.",
  ),

  pair(
    "conversational-chat",
    available("Claude chat", "Claude is available as a first-party conversational assistant on web, mobile, and desktop surfaces.", ["Claude"], ["anthropic-product", "anthropic-pricing"]),
    available("ChatGPT", "ChatGPT provides OpenAI's first-party conversational assistant experience.", ["ChatGPT"], ["openai-developers", "openai-chatgpt-pricing"]),
    "strong-parity",
    "Both vendors provide a first-party conversational assistant across common user surfaces.",
  ),
  pair(
    "projects",
    available("Claude Projects", "Claude plans include Projects for organizing chats and documents.", ["Claude Projects"], ["anthropic-pricing"]),
    available("Projects in ChatGPT", "ChatGPT Projects group chats, uploaded files, and custom instructions around ongoing work.", ["ChatGPT Projects"], ["openai-chatgpt-projects"]),
    "strong-parity",
    "Both products provide project workspaces that organize persistent work context.",
  ),
  pair(
    "delegated-knowledge-work",
    available("Claude Cowork", "Claude Cowork delegates research, document, and repetitive tasks and returns completed deliverables.", ["Claude Cowork"], ["anthropic-enterprise", "anthropic-pricing"]),
    available("ChatGPT Work", "OpenAI documents ChatGPT Work for research, file analysis, and polished documents, spreadsheets, and presentations.", ["ChatGPT Work"], ["openai-developers"]),
    "different-approach",
    "Both support delegated knowledge work through differently organized product workflows.",
  ),
  pair(
    "long-running-work",
    available("Long-running Cowork tasks", "Claude Cowork is positioned for complex delegated work that can run in the background.", ["Claude Cowork"], ["anthropic-enterprise"]),
    available("Long-running Codex work", "OpenAI documents long-running Codex tasks with progress, steering, and review.", ["Codex"], ["openai-codex-long-running"]),
    "different-approach",
    "Both continue substantial work beyond one response, centered on Cowork and Codex respectively.",
  ),

  pair(
    "primary-coding-agent",
    available("Claude Code", "Claude Code is Anthropic's first-party agentic coding tool for understanding, editing, testing, and reviewing code.", ["Claude Code"], ["anthropic-claude-code"]),
    available("Codex", "Codex is OpenAI's first-party coding agent for understanding codebases, building, testing, fixing, and reviewing changes.", ["Codex"], ["openai-codex", "openai-developers"]),
    "strong-parity",
    "Both vendors offer a first-party agentic coding product.",
  ),
  pair(
    "terminal-cli",
    available("Claude Code CLI", "Claude Code provides an interactive and non-interactive terminal command-line interface.", ["Claude Code"], ["anthropic-claude-code-cli"]),
    available("Codex CLI", "Codex CLI runs the coding agent from a terminal against a local checkout.", ["Codex CLI"], ["openai-codex-cli"]),
    "strong-parity",
    "Both coding agents have first-party terminal interfaces.",
  ),
  pair(
    "ide-integration",
    available("Claude Code IDE integrations", "Claude Code documentation links first-party IDE setup for editor-integrated coding workflows.", ["Claude Code"], ["anthropic-claude-code"]),
    available("Codex IDE extension", "OpenAI provides a Codex IDE extension for editor-integrated agent work.", ["Codex IDE extension"], ["openai-codex-ide"]),
    "strong-parity",
    "Both agents integrate with development editors, though their supported editor surfaces differ.",
  ),
  pair(
    "desktop-coding",
    available("Claude Code on desktop", "Anthropic includes Claude Code and desktop deployment in current Claude plans.", ["Claude Code", "Claude Desktop"], ["anthropic-pricing", "anthropic-enterprise"]),
    available("Codex desktop experience", "OpenAI exposes Codex inside the ChatGPT desktop experience with local projects and agent work.", ["Codex", "ChatGPT"], ["openai-codex", "openai-developers"]),
    "strong-parity",
    "Both ecosystems provide desktop-accessible coding-agent work.",
  ),
  pair(
    "browser-cloud-coding",
    available("Claude Code on the web", "Anthropic documents Claude Code as available from terminal, desktop, and web surfaces.", ["Claude Code"], ["anthropic-enterprise"]),
    available("Codex cloud", "Codex cloud runs coding tasks in isolated cloud environments from a browser-accessible workflow.", ["Codex cloud"], ["openai-codex-cloud"]),
    "strong-parity",
    "Both provide browser-accessible coding backed by remote execution.",
  ),

  pair(
    "custom-subagents",
    available("Claude Code subagents", "Claude Code supports specialized subagents with separate prompts, tools, and configuration.", ["Claude Code subagents"], ["anthropic-claude-code-subagents"]),
    available("Codex subagents", "Codex supports specialized subagents defined for delegated roles and tasks.", ["Codex subagents"], ["openai-codex-subagents"]),
    "strong-parity",
    "Both coding agents expose configurable subagents.",
  ),
  pair(
    "multi-agent-orchestration",
    limited("Claude subagent orchestration", "Claude Code can delegate to subagents, while the reviewed sources do not present a general multi-agent API as a stable product primitive.", ["Claude Code subagents"], ["anthropic-claude-code-subagents"]),
    limited("OpenAI multi-agent orchestration", "OpenAI documents multi-agent orchestration in beta alongside Agents SDK orchestration patterns.", ["OpenAI Agents SDK"], ["openai-multi-agent", "openai-agents-sdk"]),
    "partial-parity",
    "Both document multi-agent patterns, with different maturity and surface area.",
  ),
  pair(
    "hosted-agent-runtime",
    limited("Claude Managed Agents", "Anthropic documents a managed-agent runtime with vendor-hosted tools and beta API surfaces.", ["Claude Managed Agents"], ["anthropic-managed-agents"]),
    available("OpenAI hosted agent execution", "OpenAI provides hosted agent execution through Codex cloud and agent platform tooling.", ["Codex cloud", "OpenAI Agents SDK"], ["openai-codex-cloud", "openai-agents-sdk"]),
    "partial-parity",
    "Both provide hosted execution, but Anthropic's cited Managed Agents surface is documented as beta.",
  ),
  pair(
    "function-tool-calling",
    available("Claude tool use", "The Claude API accepts tool schemas and returns structured tool-use requests or server-executed results.", ["Claude API"], ["anthropic-tool-use"]),
    available("OpenAI function calling", "The OpenAI API supports function calling and built-in tools in agentic response loops.", ["Responses API"], ["openai-tools"]),
    "strong-parity",
    "Both APIs support structured tool calling for agentic applications.",
  ),

  pair(
    "project-instruction-file",
    available("CLAUDE.md", "Claude Code reads persistent repository instructions from CLAUDE.md memory files.", ["Claude Code", "CLAUDE.md"], ["anthropic-claude-code-memory"]),
    available("AGENTS.md", "Codex discovers repository-scoped custom instructions in AGENTS.md files.", ["Codex", "AGENTS.md"], ["openai-codex-agents"]),
    "different-approach",
    "Both coding agents use conventional repository instruction files with different names and discovery rules.",
  ),
  pair(
    "configuration-scopes",
    available("Claude Code settings scopes", "Claude Code supports user, project, local, and managed settings scopes.", ["Claude Code"], ["anthropic-claude-code-settings"]),
    available("Codex configuration scopes", "Codex supports user and project configuration plus managed controls.", ["Codex"], ["openai-codex-config"]),
    "strong-parity",
    "Both coding agents support layered configuration scopes.",
  ),
  pair(
    "lifecycle-hooks",
    available("Claude Code hooks", "Claude Code hooks run configured commands at documented agent lifecycle events.", ["Claude Code hooks"], ["anthropic-claude-code-hooks"]),
    available("Codex hooks", "Codex hooks run configured handlers around documented agent lifecycle events.", ["Codex hooks"], ["openai-codex-hooks"]),
    "strong-parity",
    "Both coding agents document lifecycle hooks for automation and policy integration.",
  ),
  pair(
    "custom-agent-definitions",
    available("Claude custom subagents", "Claude Code stores reusable named subagent definitions with specialized prompts and tool access.", ["Claude Code subagents"], ["anthropic-claude-code-subagents"]),
    available("Codex custom subagents", "Codex supports reusable named subagent definitions with role-specific configuration.", ["Codex subagents"], ["openai-codex-subagents"]),
    "strong-parity",
    "Both use named subagent definitions as reusable custom agents.",
  ),

  pair(
    "agent-skills",
    available("Claude Code skills", "Claude Code loads reusable Agent Skills containing instructions and supporting resources.", ["Claude Code skills"], ["anthropic-claude-code-skills"]),
    available("Codex skills", "Codex supports reusable skills that package workflow instructions and resources.", ["Codex skills"], ["openai-codex-skills"]),
    "strong-parity",
    "Both coding agents use reusable skill packages.",
  ),
  pair(
    "plugin-packaging",
    available("Claude Code plugins", "Claude Code plugins package commands, agents, skills, hooks, and integrations.", ["Claude Code plugins"], ["anthropic-claude-code-plugins"]),
    available("Codex plugins", "OpenAI documents plugin packaging for reusable Codex and ChatGPT extensions.", ["Codex plugins"], ["openai-codex-plugins"]),
    "strong-parity",
    "Both ecosystems package multiple extension types into plugins.",
  ),
  pair(
    "plugin-distribution",
    available("Claude plugin distribution", "Claude Code plugin documentation includes installing and sharing packaged plugins.", ["Claude Code plugins"], ["anthropic-claude-code-plugins"]),
    available("OpenAI plugin publishing", "OpenAI documents testing and publishing reusable plugin packages.", ["ChatGPT plugins", "Codex plugins"], ["openai-codex-plugins"]),
    "strong-parity",
    "Both document channels for sharing packaged extensions.",
  ),

  pair(
    "mcp-client",
    available("Claude MCP clients", "Claude products and the Messages API can connect to MCP servers.", ["Claude", "Claude Code", "Claude API"], ["anthropic-mcp"]),
    available("OpenAI MCP clients", "OpenAI documents MCP connections for its API and Codex surfaces.", ["Responses API", "Codex"], ["openai-mcp", "openai-codex"]),
    "strong-parity",
    "Both ecosystems implement first-party MCP client support.",
  ),
  pair(
    "remote-connectors",
    available("Claude remote connectors", "Claude offers a connector directory and remote MCP connections to external services.", ["Claude connectors"], ["anthropic-connectors", "anthropic-pricing"]),
    available("OpenAI remote connectors", "The OpenAI API supports connectors and remote MCP servers, while ChatGPT plans expose connected services.", ["ChatGPT connectors", "Responses API"], ["openai-mcp", "openai-chatgpt-pricing"]),
    "strong-parity",
    "Both connect to hosted third-party services and remote MCP servers.",
  ),
  pair(
    "local-connectors",
    available("Claude local connectors", "Claude plans document administrative controls for local connectors and desktop extensions.", ["Claude connectors", "Claude Desktop"], ["anthropic-pricing", "anthropic-mcp"]),
    available("Codex local MCP", "Codex can connect to MCP servers launched locally from command configuration.", ["Codex", "MCP"], ["openai-codex", "openai-mcp"]),
    "different-approach",
    "Both reach local tools, centered on desktop connectors and coding-agent MCP configuration respectively.",
  ),

  pair(
    "chat-memory",
    available("Claude memory", "Claude memory can retain user preferences and context across conversations with user controls.", ["Claude memory"], ["anthropic-memory", "anthropic-pricing"]),
    available("ChatGPT memory", "ChatGPT memory uses saved memories and chat history, subject to plan and workspace controls.", ["ChatGPT memory"], ["openai-chatgpt-memory"]),
    "strong-parity",
    "Both assistants provide optional cross-conversation memory with controls.",
  ),
  pair(
    "project-memory",
    available("Claude project memory", "Claude documents memory scoped to individual projects.", ["Claude Projects", "Claude memory"], ["anthropic-memory"]),
    available("ChatGPT project memory", "ChatGPT Projects can use project-only memory that stays within the project's conversations and files.", ["ChatGPT Projects"], ["openai-chatgpt-projects"]),
    "strong-parity",
    "Both provide memory scoped to a project context.",
  ),
  pair(
    "coding-auto-memory",
    available("Claude Code memory", "Claude Code maintains instruction and memory files used across coding sessions.", ["Claude Code memory"], ["anthropic-claude-code-memory"]),
    available("Codex memories", "Codex documents automatically maintained memories for durable coding context.", ["Codex memories"], ["openai-codex-memory"]),
    "different-approach",
    "Both persist coding context, using different memory mechanisms and controls.",
  ),
  pair(
    "cross-provider-import",
    available("Import memory into Claude", "Anthropic documents importing memory details from another AI tool.", ["Claude memory"], ["anthropic-memory"]),
    available("Import from another agent", "OpenAI documents an import workflow for bringing context from another agent into ChatGPT.", ["ChatGPT"], ["openai-chatgpt-import"]),
    "strong-parity",
    "Both document a supported cross-assistant import path.",
  ),

  pair(
    "file-analysis",
    available("Claude file analysis", "Claude can analyze files and execute code as documented in current plan features and tools.", ["Claude"], ["anthropic-pricing", "anthropic-server-tools"]),
    available("ChatGPT file analysis", "ChatGPT accepts uploaded files for analysis within documented file limits.", ["ChatGPT"], ["openai-chatgpt-files"]),
    "strong-parity",
    "Both assistants analyze user-provided files.",
  ),
  pair(
    "document-generation",
    available("Claude file creation", "Claude plans include creating and editing files with code execution.", ["Claude"], ["anthropic-pricing"]),
    available("ChatGPT Work deliverables", "ChatGPT Work creates documents, spreadsheets, presentations, and other reviewable deliverables.", ["ChatGPT Work"], ["openai-developers"]),
    "strong-parity",
    "Both create editable or downloadable knowledge-work deliverables.",
  ),
  pair(
    "interactive-artifacts",
    available("Claude Artifacts", "Claude plans include Artifacts for interactive content created alongside a conversation.", ["Claude Artifacts"], ["anthropic-pricing"]),
    available("ChatGPT interactive work products", "OpenAI documents visualizations and interactive file work inside ChatGPT Work.", ["ChatGPT Work"], ["openai-developers"]),
    "different-approach",
    "Both render work products beyond plain chat, with different product concepts and interaction models.",
  ),
  pair(
    "sandboxed-code-execution",
    available("Claude code execution", "Anthropic provides a server-executed code tool in a sandboxed container.", ["Claude API code execution"], ["anthropic-server-tools", "anthropic-tool-reference"]),
    available("OpenAI code interpreter and sandbox agents", "OpenAI provides hosted code-execution tools and sandbox-agent runtimes.", ["Code Interpreter", "OpenAI Agents SDK"], ["openai-tools", "openai-agents-sdk"]),
    "strong-parity",
    "Both provide vendor-hosted isolated code execution.",
  ),

  pair(
    "web-search",
    available("Claude web search", "Claude's API web-search tool retrieves current web results and returns source citations.", ["Claude web search"], ["anthropic-tool-reference"]),
    available("OpenAI web search", "OpenAI provides web search in ChatGPT and as a built-in API tool.", ["ChatGPT search", "Web search tool"], ["openai-web-search", "openai-chatgpt-pricing"]),
    "strong-parity",
    "Both offer current web search in product and developer workflows.",
  ),
  pair(
    "deep-research",
    available("Claude Research", "Paid Claude plans document Research for multi-step information gathering and synthesis.", ["Claude Research"], ["anthropic-pricing"]),
    available("Deep research in ChatGPT", "ChatGPT deep research conducts multi-step research and produces a cited report.", ["ChatGPT deep research"], ["openai-chatgpt-deep-research"]),
    "strong-parity",
    "Both assistants provide a dedicated multi-step research workflow.",
  ),
  pair(
    "source-citations",
    available("Claude search citations", "Claude web-search responses include citations to sources drawn from search results.", ["Claude web search"], ["anthropic-tool-reference"]),
    available("OpenAI research citations", "OpenAI web search and deep research expose links or citations to supporting sources.", ["ChatGPT deep research", "Web search tool"], ["openai-web-search", "openai-chatgpt-deep-research"]),
    "strong-parity",
    "Both expose source evidence for web-grounded answers.",
  ),
  pair(
    "web-fetch",
    available("Claude web fetch", "Anthropic's web-fetch tool retrieves content from specific web pages and PDFs.", ["Claude web fetch"], ["anthropic-server-tools", "anthropic-tool-reference"]),
    undocumented("OpenAI URL fetch", "a standalone URL-fetch API tool distinct from web search in the reviewed OpenAI tool catalog", ["OpenAI API tools"], ["openai-tools", "openai-web-search"]),
    "vendor-specific",
    "Anthropic documents a dedicated web-fetch tool; the reviewed OpenAI tool catalog does not document the same primitive.",
  ),

  pair(
    "computer-use-product",
    available("Claude computer-use products", "Claude offers computer-oriented workflows through Cowork and Claude for Chrome, subject to plan availability.", ["Claude Cowork", "Claude for Chrome"], ["anthropic-pricing", "anthropic-enterprise"]),
    available("ChatGPT computer use", "OpenAI documents computer-use workflows directly in the ChatGPT experience.", ["ChatGPT computer use"], ["openai-chatgpt-computer"]),
    "different-approach",
    "Both can act through a computer, surfaced through different first-party products.",
  ),
  pair(
    "computer-use-api",
    limited("Claude computer-use tool", "Anthropic publishes a client-executed computer tool schema in beta.", ["Claude computer tool"], ["anthropic-tool-reference"]),
    available("OpenAI computer-use tool", "OpenAI provides a computer-use tool for model-guided screenshot, mouse, and keyboard loops.", ["Computer use tool"], ["openai-computer-use"]),
    "partial-parity",
    "Both expose developer computer-use tools, with Anthropic's cited schema documented as beta.",
  ),
  pair(
    "browser-control",
    available("Claude for Chrome", "Claude plans document Claude for Chrome as a browser-control product surface.", ["Claude for Chrome"], ["anthropic-pricing"]),
    available("ChatGPT browser", "OpenAI documents an in-product browser that ChatGPT can navigate for user-directed work.", ["ChatGPT browser"], ["openai-chatgpt-browser"]),
    "strong-parity",
    "Both provide first-party browser navigation and action workflows.",
  ),
  pair(
    "voice-mode",
    available("Claude voice mode", "Claude plans list voice mode across supported assistant surfaces.", ["Claude voice mode"], ["anthropic-pricing"]),
    available("ChatGPT Voice", "ChatGPT supports spoken conversation through its Voice experience.", ["ChatGPT Voice"], ["openai-chatgpt-voice"]),
    "strong-parity",
    "Both assistants support first-party voice interaction.",
  ),

  pair(
    "local-execution",
    available("Claude Code local execution", "Claude Code operates from a terminal against files and commands on the user's machine.", ["Claude Code"], ["anthropic-claude-code", "anthropic-claude-code-cli"]),
    available("Codex local execution", "Codex CLI and desktop workflows operate against local checkouts under configured permissions.", ["Codex CLI", "Codex"], ["openai-codex-cli", "openai-codex"]),
    "strong-parity",
    "Both coding agents can execute against a local repository.",
  ),
  pair(
    "managed-cloud-environments",
    limited("Claude managed environments", "Anthropic documents Claude Managed Agents as a beta hosted runtime and Claude Code web as remote execution.", ["Claude Managed Agents", "Claude Code"], ["anthropic-managed-agents", "anthropic-enterprise"]),
    available("Codex cloud environments", "Codex cloud runs tasks in OpenAI-managed isolated cloud environments.", ["Codex cloud"], ["openai-codex-cloud"]),
    "partial-parity",
    "Both offer managed remote execution, with different product maturity and scope.",
  ),
  pair(
    "worktree-isolation",
    undocumented("Claude Code worktree isolation", "a first-party managed worktree workflow in the reviewed Claude Code documentation", ["Claude Code"], ["anthropic-claude-code"]),
    available("Codex worktrees", "Codex documents Git worktrees for isolating parallel coding tasks.", ["Codex worktrees"], ["openai-codex-worktrees"]),
    "vendor-specific",
    "OpenAI documents explicit worktree isolation; the reviewed Claude Code overview does not.",
  ),
  pair(
    "execution-sandbox",
    available("Claude Code sandbox", "Claude Code sandboxing limits filesystem and network access while reducing approval prompts.", ["Claude Code sandbox"], ["anthropic-claude-code-sandbox", "anthropic-claude-code-security"]),
    available("Codex sandbox", "Codex sandboxing restricts filesystem and network access according to the selected execution profile.", ["Codex sandbox"], ["openai-codex-sandbox", "openai-codex-security"]),
    "strong-parity",
    "Both coding agents combine sandboxing with approval controls.",
  ),

  pair(
    "scheduled-tasks",
    available("Claude Cowork scheduled tasks", "Claude Cowork supports recurring and on-demand scheduled tasks on paid plans.", ["Claude Cowork"], ["anthropic-cowork-scheduling"]),
    available("Codex automations", "Codex automations schedule recurring agent tasks and surface their results for review.", ["Codex automations"], ["openai-codex-automations"]),
    "strong-parity",
    "Both schedule recurring agent work, centered on Cowork and Codex.",
  ),
  pair(
    "background-continuation",
    available("Cowork background tasks", "Claude Cowork can continue delegated tasks while the user focuses elsewhere.", ["Claude Cowork"], ["anthropic-enterprise", "anthropic-cowork-scheduling"]),
    available("OpenAI background work", "Codex long-running work and API background mode continue tasks asynchronously.", ["Codex", "Responses API"], ["openai-codex-long-running", "openai-background-mode"]),
    "strong-parity",
    "Both continue agent work asynchronously beyond the initiating interaction.",
  ),
  pair(
    "event-driven-automation",
    available("Claude Code automation", "Claude Code supports non-interactive CLI execution suitable for CI and scripted event triggers.", ["Claude Code CLI"], ["anthropic-claude-code-cli", "anthropic-claude-code-hooks"]),
    available("OpenAI event-driven automation", "OpenAI supports API webhooks and non-interactive Codex execution for event-triggered workflows.", ["OpenAI webhooks", "Codex CLI"], ["openai-webhooks", "openai-codex-cli"]),
    "strong-parity",
    "Both integrate agent execution into external automation pipelines.",
  ),

  pair(
    "permission-modes",
    available("Claude Code permission modes", "Claude Code exposes named permission modes, including plan-oriented and approval-controlled operation.", ["Claude Code"], ["anthropic-claude-code-cli", "anthropic-claude-code-security"]),
    available("Codex permission profiles", "Codex exposes named sandbox and approval profiles that govern agent actions.", ["Codex"], ["openai-codex-security", "openai-codex-sandbox"]),
    "strong-parity",
    "Both provide named operating modes for approvals and access.",
  ),
  pair(
    "fine-grained-permission-rules",
    available("Claude Code allow and deny rules", "Claude Code supports tool-level allow and deny rules in settings and CLI flags.", ["Claude Code"], ["anthropic-claude-code-settings", "anthropic-claude-code-cli"]),
    available("Codex permission rules", "Codex supports configuration rules and profiles controlling tools, commands, network, and filesystem access.", ["Codex"], ["openai-codex-config", "openai-codex-security"]),
    "strong-parity",
    "Both support fine-grained controls beyond a single global approval switch.",
  ),
  pair(
    "full-autonomy-mode",
    available("Claude Code bypass-permissions mode", "Claude Code exposes an explicitly dangerous option to skip permission prompts.", ["Claude Code"], ["anthropic-claude-code-cli"]),
    available("Codex full-access profile", "Codex exposes a full-access execution profile with reduced approval friction and explicit risk controls.", ["Codex"], ["openai-codex-security", "openai-codex-sandbox"]),
    "strong-parity",
    "Both expose explicit high-autonomy modes with strong safety warnings.",
  ),
  pair(
    "enterprise-policy",
    available("Claude managed settings", "Claude Code supports managed organization settings, and Claude Enterprise adds role-based and connector controls.", ["Claude Code", "Claude Enterprise"], ["anthropic-claude-code-settings", "anthropic-enterprise"]),
    available("OpenAI managed controls", "OpenAI organization offerings provide managed configuration, roles, and feature access controls.", ["ChatGPT Enterprise", "Codex"], ["openai-enterprise", "openai-codex-config"]),
    "strong-parity",
    "Both allow administrators to enforce organizational policy.",
  ),

  pair(
    "core-model-api",
    available("Claude Messages API", "Anthropic provides the Claude API for model messages, tools, and agent workflows.", ["Claude API"], ["anthropic-tool-use", "anthropic-models"]),
    available("OpenAI Responses API", "OpenAI provides the Responses API for current model and tool workflows.", ["Responses API"], ["openai-tools", "openai-models"]),
    "strong-parity",
    "Both vendors provide first-party model APIs for production applications.",
  ),
  pair(
    "agent-sdk",
    available("Claude agent tooling", "Anthropic documents managed-agent tooling and SDK-assisted agent sessions.", ["Claude Managed Agents"], ["anthropic-managed-agents"]),
    available("OpenAI Agents SDK", "OpenAI provides an Agents SDK for agent definitions, execution, orchestration, guardrails, and state.", ["OpenAI Agents SDK"], ["openai-agents-sdk"]),
    "different-approach",
    "Both provide agent-building libraries or managed tooling, with different runtime abstractions.",
  ),
  pair(
    "built-in-api-tools",
    available("Anthropic server tools", "The Claude API hosts web search, web fetch, code execution, and tool search.", ["Claude API tools"], ["anthropic-server-tools", "anthropic-tool-reference"]),
    available("OpenAI built-in tools", "The Responses API provides built-in web, file, computer, shell, code, image, and MCP tools.", ["Responses API tools"], ["openai-tools"]),
    "strong-parity",
    "Both APIs expose vendor-hosted tools directly in model requests.",
  ),
  pair(
    "api-mcp",
    limited("Claude API MCP connector", "The Claude API exposes an MCP connector documented as a beta server tool.", ["Claude API MCP connector"], ["anthropic-mcp", "anthropic-tool-reference"]),
    available("OpenAI API MCP", "The OpenAI API connects to remote MCP servers and first-party connectors as built-in tools.", ["Responses API MCP"], ["openai-mcp"]),
    "partial-parity",
    "Both APIs connect to MCP servers, with different documented maturity.",
  ),

  pair(
    "team-enterprise-plans",
    available("Claude Team and Enterprise", "Anthropic publishes managed Team and Enterprise plans for organizations.", ["Claude Team", "Claude Enterprise"], ["anthropic-pricing", "anthropic-enterprise"]),
    available("ChatGPT Business and Enterprise", "OpenAI publishes Business and Enterprise offerings for managed workspaces.", ["ChatGPT Business", "ChatGPT Enterprise"], ["openai-chatgpt-pricing", "openai-enterprise"]),
    "strong-parity",
    "Both offer self-serve business and managed enterprise plans.",
  ),
  pair(
    "sso-scim",
    available("Claude SSO and SCIM", "Claude organization plans document SSO, while Enterprise adds SCIM provisioning.", ["Claude Team", "Claude Enterprise"], ["anthropic-pricing", "anthropic-enterprise"]),
    available("OpenAI SSO and SCIM", "ChatGPT organization plans document SAML SSO, and Enterprise provides managed identity provisioning.", ["ChatGPT Business", "ChatGPT Enterprise"], ["openai-chatgpt-pricing", "openai-enterprise-provisioning"]),
    "strong-parity",
    "Both support enterprise identity and provisioning controls.",
  ),
  pair(
    "audit-logs",
    available("Claude audit logs", "Claude Enterprise includes audit logs and a Compliance API for monitoring.", ["Claude Enterprise"], ["anthropic-pricing", "anthropic-enterprise"]),
    available("OpenAI audit and compliance controls", "OpenAI documents Compliance API audit events for managed enterprise workspaces.", ["ChatGPT Enterprise"], ["openai-enterprise-audit"]),
    "strong-parity",
    "Both enterprise offerings document organization audit capabilities.",
  ),
  pair(
    "data-retention-controls",
    available("Claude retention controls", "Claude Enterprise includes custom data-retention controls.", ["Claude Enterprise"], ["anthropic-pricing", "anthropic-enterprise"]),
    available("OpenAI retention controls", "OpenAI documents enterprise data controls and configurable retention for managed customers.", ["ChatGPT Enterprise"], ["openai-enterprise-governance", "openai-enterprise-privacy"]),
    "strong-parity",
    "Both enterprise offerings provide retention-related governance controls.",
  ),

  pair(
    "consumer-plans",
    available("Claude individual plans", "Anthropic publishes Free, Pro, and Max plans for individual users.", ["Claude Free", "Claude Pro", "Claude Max"], ["anthropic-pricing"]),
    available("ChatGPT individual plans", "OpenAI publishes Free, Go, Plus, and Pro plans for individual users.", ["ChatGPT Free", "ChatGPT Go", "ChatGPT Plus", "ChatGPT Pro"], ["openai-chatgpt-pricing"]),
    "strong-parity",
    "Both publish free and paid individual plans with usage qualifications.",
  ),
  pair(
    "business-plans",
    available("Claude Team", "Claude Team is a self-serve plan for teams of 2 to 150 with standard and premium seats.", ["Claude Team"], ["anthropic-pricing"]),
    available("ChatGPT Business", "ChatGPT Business is a managed self-serve workspace available from two users.", ["ChatGPT Business"], ["openai-chatgpt-pricing"]),
    "strong-parity",
    "Both publish self-serve multi-user business plans.",
  ),
  pair(
    "enterprise-pricing",
    available("Claude Enterprise pricing", "Anthropic publishes a base seat price plus API-rate usage for Claude Enterprise, with qualified billing terms.", ["Claude Enterprise"], ["anthropic-pricing", "anthropic-enterprise"]),
    available("ChatGPT Enterprise sales pricing", "OpenAI directs ChatGPT Enterprise buyers to contact sales and does not publish a universal contract price.", ["ChatGPT Enterprise"], ["openai-chatgpt-pricing", "openai-enterprise"]),
    "different-approach",
    "Anthropic publishes a qualified base structure; OpenAI documents a sales-led quote path.",
  ),
  pair(
    "api-token-pricing",
    available("Claude API token pricing", "Anthropic publishes per-million input, cache, and output token rates for current Claude models.", ["Claude API"], ["anthropic-api-pricing", "anthropic-models"]),
    available("OpenAI API token pricing", "OpenAI publishes per-million input, cached-input, and output token rates for current models.", ["OpenAI API"], ["openai-api-pricing", "openai-models"]),
    "strong-parity",
    "Both publish model-specific token pricing with separate input and output rates.",
  ),
] satisfies CapabilityFact[];

const verifiedAt = "2026-08-11";

export const vendorEntries = capabilityFacts.flatMap(({ capabilityId, anthropic, openai }) =>
  ([
    ["anthropic", anthropic],
    ["openai", openai],
  ] as const).map(([vendorId, fact]) => ({
    id: `${vendorId}-${capabilityId}`,
    capabilityId,
    vendorId,
    title: fact.title,
    summary: fact.summary,
    details: fact.details ?? [],
    productNames: fact.productNames,
    availability: fact.availability,
    sourceIds: fact.sourceIds,
    verifiedAt,
  })),
) satisfies VendorEntry[];
