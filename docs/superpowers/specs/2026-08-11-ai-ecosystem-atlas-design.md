# AI Ecosystem Atlas Design Specification

**Status:** Approved 2026-08-11

**Repository:** `aserdargun/ai-ecosystem-atlas`

**Application name:** AI Ecosystem Atlas

**Release:** Public v0.1

## 1. Purpose

AI Ecosystem Atlas is a public, evidence-backed comparison application for AI product and developer ecosystems. The first release compares Anthropic/Claude with OpenAI/ChatGPT in English. The architecture must support adding Google, Microsoft, xAI, Perplexity, and other vendors by adding canonical records rather than redesigning the interface or introducing provider-specific columns in source data.

The application turns the earlier Claude-versus-ChatGPT research and handwritten-note themes into a maintainable research console. It separates provider-neutral capabilities, vendor claims, model facts, plan facts, assessments, and sources so each fact can be updated, verified, searched, filtered, and compared independently.

## 2. Product principles

1. **Evidence before assertion.** Substantive claims link to official sources and carry verification dates.
2. **Canonical data before presentation.** Comparison rows are derived from normalized records; a wide Anthropic/OpenAI table is never the source of truth.
3. **Unknown is a valid state.** The interface distinguishes unavailable, limited, undocumented, and unknown facts instead of inventing parity.
4. **Public and auditable.** The repository, application, data, and update history are public. V0.1 does not require accounts, a private admin area, or a database.
5. **Designed for more vendors.** Vendor selection and comparison logic work with stable vendor IDs and do not depend on two hard-coded providers.
6. **Research-console density.** The primary interface optimizes scanning and evidence inspection rather than presenting a marketing landing page.

## 3. V0.1 scope

### Included

- A modern Next.js App Router application using React and strict TypeScript.
- A source-first, statically deployable architecture.
- A normalized and runtime-validated comparison dataset.
- Anthropic/Claude and OpenAI/ChatGPT seed data recovered from the referenced comparison and refreshed against current official documentation before release.
- The following category taxonomy, in this display order:
  1. Models
  2. Chat & Knowledge Work
  3. Coding Agents
  4. Agentic Workflows
  5. Customization
  6. Skills & Plugins
  7. Connectors & MCP
  8. Memory & Context
  9. Files & Artifacts
  10. Research & Web
  11. Computer, Browser & Voice
  12. Local & Cloud Environments
  13. Automation & Scheduling
  14. Permissions & Security
  15. API & SDK
  16. Enterprise & Governance
  17. Pricing & Plans
- Global search and category, availability, comparison-status, and freshness filters.
- Vendor selection and a focused vendor-comparison view.
- A responsive, detailed comparison table with expandable evidence.
- Official source URLs and `verified_at` dates for substantive vendor entries, model records, and plan records.
- Shareable URL query parameters for comparison and filter state.
- A polished public README describing purpose, architecture, schema, local development, the update workflow, and roadmap.
- Automated data-integrity, selector, component, type, lint, and production-build checks.

### Excluded from v0.1

- User accounts, authentication, private workspaces, and a browser-based content editor.
- A database, CMS, hosted write API, or server-side mutation path.
- Automated scraping or unattended fact updates.
- User comments, ratings, vendor scoring, or a single “winner” ranking.
- Vendors beyond Anthropic and OpenAI, except for architecture and UI affordances that make later vendors possible.
- A production deployment. The requested delivery is the public GitHub repository and committed implementation.

## 4. Chosen approach

Use a **source-first static atlas**. Canonical TypeScript data modules live in the repository, are parsed by a strict schema, and are transformed into view models by pure selector functions. Next.js statically renders the application shell and seed dataset. A small client boundary owns search, filters, URL synchronization, row expansion, and vendor selection.

This approach was chosen over document-first MDX because the product depends on reliable joins and filtering. It was chosen over a database-backed application because public Git history provides the required update and audit workflow without authentication, migrations, operational security, or hosting dependencies.

## 5. Technology decisions

- **Framework:** current supported stable Next.js with the App Router, resolved and locked during scaffolding.
- **Language:** strict TypeScript; no JavaScript application modules.
- **UI:** React Server Components by default, with the interactive research console isolated behind one focused client boundary.
- **Styling:** Tailwind CSS plus CSS custom properties for atlas color, typography, spacing, and state tokens.
- **Validation:** Zod schemas executed when canonical content is loaded and in dedicated integrity tests.
- **Icons:** one consistent, tree-shakeable outline icon set; icons accompany text and never replace required labels.
- **Unit/component tests:** Vitest and Testing Library.
- **Browser tests:** Playwright for the primary comparison workflow and responsive behavior.
- **Package manager:** npm with a committed lockfile.

Heavy UI frameworks, chart packages, remote fonts, analytics, authentication libraries, and client data-fetching libraries are intentionally unnecessary for v0.1.

## 6. Canonical data model

All IDs are stable lowercase kebab-case strings. Dates use ISO `YYYY-MM-DD`. URLs must use HTTPS. Canonical records are independent of the current display vendors.

### Vendor and category

```ts
type Vendor = {
  id: string;
  name: string;
  shortName: string;
  ecosystemName: string;
  description: string;
  homepageUrl: string;
  accent: string;
};

type Category = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  order: number;
};
```

### Capability and vendor entry

```ts
type Capability = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  tags: string[];
  order: number;
};

type Availability =
  | "available"
  | "limited"
  | "not-available"
  | "not-documented"
  | "unknown";

type VendorEntry = {
  id: string;
  capabilityId: string;
  vendorId: string;
  title: string;
  summary: string;
  details: string[];
  productNames: string[];
  availability: Availability;
  sourceIds: string[];
  verifiedAt: string;
};
```

Capabilities are provider-neutral questions or comparison dimensions. There is at most one vendor entry per capability/vendor pair. A missing pair is rendered as `Not documented`, not treated as `not-available`.

### Comparison assessment

```ts
type ComparisonStatus =
  | "strong-parity"
  | "partial-parity"
  | "different-approach"
  | "vendor-specific"
  | "insufficient-evidence";

type ComparisonAssessment = {
  capabilityId: string;
  vendorIds: [string, string];
  status: ComparisonStatus;
  summary: string;
};
```

Assessments are pair-specific editorial conclusions. They remain separate from vendor facts so adding a third vendor does not corrupt the underlying claims.

### Model and plan

```ts
type Model = {
  id: string;
  vendorId: string;
  name: string;
  family: string;
  positioning: string;
  lifecycle: "current" | "preview" | "legacy" | "deprecated";
  inputModalities: string[];
  outputModalities: string[];
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  knowledgeCutoff?: string;
  pricing?: {
    inputPerMillionUsd?: number;
    cachedInputPerMillionUsd?: number;
    outputPerMillionUsd?: number;
  };
  sourceIds: string[];
  verifiedAt: string;
};

type Plan = {
  id: string;
  vendorId: string;
  name: string;
  audience: string;
  priceDisplay: string;
  billingNote?: string;
  highlights: string[];
  sourceIds: string[];
  verifiedAt: string;
};
```

Unknown numeric facts are omitted rather than represented as zero. `priceDisplay` preserves public phrasing because subscription pricing may include regional, billing-period, or seat-count qualifications.

### Source

```ts
type Source = {
  id: string;
  title: string;
  publisher: "Anthropic" | "OpenAI";
  url: string;
  sourceType:
    | "documentation"
    | "help"
    | "product"
    | "pricing"
    | "announcement";
  note?: string;
};
```

V0.1 seed claims use official first-party Anthropic and OpenAI sources.

## 7. Validation invariants

The build and integrity test fail when any of these conditions is true:

- IDs are duplicated or do not match lowercase kebab-case.
- A capability references a missing category.
- A vendor entry references a missing vendor, capability, or source.
- Two vendor entries use the same capability/vendor pair.
- A comparison assessment references missing vendors or a missing capability.
- A model or plan references a missing vendor or source.
- Required source lists are empty.
- Verification dates are malformed or later than the build date.
- Source URLs are malformed or do not use HTTPS.
- Category order or capability order is duplicated within its scope.
- The 17 required category IDs are missing or reordered.

External URL availability is not checked during ordinary builds because network failures would make local development nondeterministic. A future scheduled workflow may perform link-health checks separately.

## 8. Data flow and application boundaries

```text
Canonical records
  -> Zod parsing and relationship validation
  -> normalized AtlasDataset
  -> pure selectors and indexes
  -> server-rendered page shell and serialized public dataset
  -> ResearchConsole client boundary
  -> URL-synchronized search, filters, vendor pair, and expanded rows
```

The server page imports and validates data once. Static header, methodology, taxonomy, and source metadata remain server-rendered. `ResearchConsole` receives the minimal validated dataset needed for interaction. Selectors construct lookup indexes once, then derive visible comparison rows from primitive filter state. No client-side request waterfall or mutation route is required.

## 9. Research Console interface

### Page anatomy

1. A near-black masthead containing the atlas mark, product name, methodology link, source link, and GitHub link.
2. A compact introduction stating that this is a living, evidence-backed ecosystem comparison.
3. A results summary with computed capability, category, source, and most-recent-verification counts.
4. A two-column application shell with a category rail and main comparison surface.
5. A footer explaining update provenance and linking to repository update instructions.

### Toolbar

- A labeled global search input.
- Two vendor selectors that default to Anthropic and OpenAI, prohibit the same vendor on both sides, and preserve left/right order.
- Filters for availability, comparison status, and freshness.
- A clear-all action visible only when state differs from defaults.
- A view toggle between `Explorer` and `Vendor comparison`.
- A live result count announced politely to assistive technology.

### Search

Search is case-insensitive and diacritic-insensitive. It matches capability and category text, tags, vendor-entry text, product names, model names, and plan names. Search terms are ANDed after whitespace tokenization so `code memory` requires both terms in the indexed row text.

### Comparison table

The detailed table contains:

1. Capability and category
2. Selected left vendor
3. Selected right vendor
4. Assessment
5. Verification and sources

The header and capability column remain sticky when space permits. Each row shows concise summaries and availability labels. Expanding a row reveals detail bullets, product names, assessment rationale, source titles, publisher labels, direct URLs, and verification dates without navigating away.

The table uses semantic table, header, scope, and disclosure-button markup. Row expansion is keyboard operable and maintains a visible focus indicator.

### Vendor comparison view

The vendor view uses the same records and active filters. It summarizes category coverage, availability counts, model and plan records, strongest parity, different approaches, and vendor-specific capabilities. It does not calculate a winner or opaque score.

### URL state

Validated query parameters are:

- `q`: search string
- `category`: category ID
- `left`: left vendor ID
- `right`: right vendor ID
- `availability`: comma-separated availability values
- `status`: comma-separated comparison-status values
- `freshness`: `current`, `aging`, or `stale`
- `view`: `explorer` or `vendors`

Unknown values fall back safely to defaults. The URL updates without full navigation and reconstructs filter state after reload.

### Freshness

- `current`: verified within 90 days
- `aging`: verified 91–180 days ago
- `stale`: verified more than 180 days ago

The visible label includes the exact verification date. Color is not the only freshness signal.

### Responsive behavior

- **Desktop, 1200px and wider:** persistent category rail, full toolbar, sticky table header, and sticky capability column.
- **Tablet, 768–1199px:** compact rail or horizontal category strip, wrapped toolbar, and horizontally scrollable table.
- **Mobile, below 768px:** category/filter controls open in an accessible sheet, vendor selectors remain visible, and the semantic table scrolls horizontally with the capability column pinned when possible.

Mobile preserves side-by-side comparison. It does not replace the primary dataset with unrelated card grids or hide sources.

## 10. Visual design system

The accepted direction is **Research Console**.

- Warm off-white page canvas.
- Near-black masthead, navigation, and major headings.
- Restrained coral/orange accent for active filters, primary actions, and key freshness states.
- Muted neutral borders and surfaces with subtle vendor-specific accents.
- Compact table typography with more generous spacing around page-level controls.
- Small radii for controls and rows; larger radii only for page-level summary surfaces.
- One consistent outline icon family and a system font stack.
- No decorative stock imagery, low-legibility gradients, or generic hero illustration.

The interface must meet WCAG AA color contrast for normal text and controls, expose visible `:focus-visible` state, provide reduced-motion behavior, and never use color as the only state signal.

## 11. Empty, unknown, and failure states

- Missing optional fields are omitted without empty punctuation.
- A missing vendor-entry pair displays `Not documented` with explanatory text.
- `unknown`, `not-documented`, and `not-available` use different labels.
- Zero search results display active constraints and a one-click reset.
- Invalid query parameters are ignored and replaced with defaults.
- Invalid canonical data stops the build and names the record path and failed invariant.
- One inaccessible external source does not break local rendering.
- Client enhancement failure leaves the server-rendered introduction, methodology, counts, and initial comparison content understandable.

## 12. Testing and acceptance criteria

### Data and selector tests

- The full seed dataset passes every validation invariant.
- Invalid fixtures demonstrate failures for duplicate IDs, orphan references, duplicate vendor pairs, missing sources, malformed URLs, future dates, and reordered taxonomy.
- Search matches all declared fields, is case/diacritic insensitive, and uses AND semantics.
- Category, availability, status, and freshness filters compose correctly.
- Vendor-pair joins return `Not documented` for missing entries without inventing availability.
- Counts and freshness thresholds are deterministic for an injected current date.
- URL parsing accepts valid state and safely rejects unknown values.

### Component tests

- The default Anthropic/OpenAI comparison renders all seeded categories.
- Searching and combining filters updates rows and the live result count.
- Clearing filters restores default state.
- Vendor selectors cannot choose the same vendor on both sides.
- Expanding a row exposes evidence, product names, sources, and verification dates.
- Source links have descriptive accessible names and correct official URLs.
- Zero results show a reset action.
- Vendor comparison view derives from the active vendor pair and filters.

### Browser verification

- Search, category filtering, row expansion, source inspection, view switching, and reset work at 1440×900, 1024×768, and 390×844.
- Primary content is not clipped and page-level horizontal overflow is absent; table overflow stays inside its container.
- Keyboard users can reach every control, expand a row, and identify focus.
- The accepted Research Console structure, density, palette, copy roles, and table-first hierarchy are compared against the approved companion mockup.

### Release checks

- Lint passes.
- Strict TypeScript checking passes.
- Unit and component tests pass.
- Playwright smoke tests pass.
- The production build passes from a clean install.
- `git status` contains no generated build, report, environment, or brainstorming artifacts.

## 13. Public update workflow

1. Identify the capability, model, plan, or source record that changed.
2. Consult a current official Anthropic or OpenAI page.
3. Update or add the source record before referencing it.
4. Update the canonical fact and set `verifiedAt` to the official-source check date.
5. Add or update tests when schema or selector behavior changes.
6. Run validation, tests, type checking, linting, and the production build.
7. Inspect the affected comparison and source expansion in the browser.
8. Commit the data and evidence change and submit it for public review.

The README will demonstrate one capability update and state that `verifiedAt` records verification, not necessarily a product release date.

## 14. README requirements

The public README includes:

- Product purpose and ecosystem-level comparison explanation.
- A screenshot of the final Research Console captured during browser verification.
- Feature summary and 17-category taxonomy.
- Architecture and data-flow explanation.
- Canonical schema overview with a vendor-entry example.
- Local setup, development, testing, and production-build commands.
- Step-by-step public update workflow.
- Guidance for adding a vendor without hard-coded table columns.
- Source and verification methodology.
- Repository structure and roadmap.

No software license is added in v0.1 because public visibility does not itself authorize a particular open-source license. Licensing remains an explicit owner decision.

## 15. Roadmap

1. Add Google/Gemini and Microsoft/Copilot using the existing vendor model.
2. Add change history and per-record supersession metadata.
3. Add an optional scheduled link-health and stale-data report.
4. Add saved comparison presets without requiring accounts.
5. Evaluate a public contribution form or CMS only after repository-based updates become a measurable bottleneck.
6. Add CSV and JSON export formats.
7. Add multilingual presentation while retaining one canonical fact layer.

## 16. Definition of done

V0.1 is complete when the public `aserdargun/ai-ecosystem-atlas` repository contains the validated application, detailed Anthropic/OpenAI seed comparison, official source URLs and verification dates, functional search and filters, Explorer and vendor-comparison views, responsive detailed table, polished README, automated checks, final browser screenshot, and committed implementation; all release checks pass and the remote default branch reflects the verified local commit.
