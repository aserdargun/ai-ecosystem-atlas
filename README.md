# AI Ecosystem Atlas

![Next.js 16.3.0](https://img.shields.io/badge/Next.js-16.3.0-111111?logo=nextdotjs&logoColor=white)
![TypeScript 5.9.3](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Checks: npm run check](https://img.shields.io/badge/checks-npm%20run%20check-168c6b)

AI Ecosystem Atlas is a public, evidence-backed research console for comparing AI product and developer ecosystems. The first release examines Anthropic/Claude and OpenAI/ChatGPT across models, end-user products, coding agents, developer platforms, governance, and pricing.

The atlas is designed for inspection, not verdicts. It keeps provider-neutral capabilities, vendor claims, pair-specific assessments, models, plans, and official sources in separate canonical records. The interface does not calculate an aggregate score, rank vendors, or declare a winner.

![AI Ecosystem Atlas Research Console](public/ai-ecosystem-atlas.png)

## Purpose

AI ecosystems extend well beyond model benchmarks. Buyers, builders, and researchers also need to understand knowledge-work surfaces, agent runtimes, customization, connectors, execution environments, permissions, APIs, and organizational controls. AI Ecosystem Atlas makes those product-level facts searchable, comparable, source-linked, and maintainable in public Git history.

Version 0.1 is deliberately source-first and static at the content layer. Adding or correcting a fact means changing a small canonical record, checking its official evidence, and reviewing the derived comparison—without maintaining a database, CMS, private editor, or provider-specific presentation table.

## Features

- A responsive, semantic comparison table for 66 provider-neutral capabilities.
- Search across categories, capabilities, tags, vendor entries, product names, models, and plans.
- Composable category, availability, comparison-status, and freshness filters.
- Validated, shareable URL state for filters, vendor order, and the active view.
- Expandable evidence with official source titles, direct URLs, publishers, and exact verification dates.
- Explorer and vendor-comparison views derived from the same records and active filters.
- Explicit `available`, `limited`, `not-available`, `not-documented`, and `unknown` states.
- Runtime schema and relationship validation plus unit, component, lint, type, and production-build checks.
- A data model intended to add vendors without introducing vendor-specific source columns.

### Category taxonomy

The canonical display order is enforced during validation:

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

## Architecture

The application uses Next.js App Router, React, strict TypeScript, Tailwind CSS, and Zod. The server page imports and validates the repository-managed dataset once. Static page content stays server-rendered, while one focused `ResearchConsole` client boundary owns search, filter controls, vendor selection, row disclosure, view switching, and URL synchronization. Pure selector functions build immutable comparison rows and summaries; the client does not fetch or mutate data.

```text
Canonical records
  -> Zod parsing and relationship validation
  -> normalized AtlasDataset
  -> pure selectors and indexes
  -> server-rendered page shell and serialized public dataset
  -> ResearchConsole client boundary
  -> URL-synchronized search, filters, vendor pair, and view
```

This structure makes invalid source data fail early, keeps presentation logic independent of the seed vendors, and requires no backing data service. There is no account system, database, CMS, write API, scraper, analytics dependency, or remote-font dependency in v0.1.

## Data schema

The canonical dataset is assembled in [`src/data/index.ts`](src/data/index.ts) and validated by [`src/data/validation.ts`](src/data/validation.ts) against the Zod record definitions in [`src/data/schema.ts`](src/data/schema.ts).

| Record | Role |
| --- | --- |
| `Vendor` | A company and its named ecosystem. |
| `Category` | One ordered section in the fixed 17-category taxonomy. |
| `Capability` | A provider-neutral question or comparison dimension. |
| `VendorEntry` | One vendor's sourced statement for one capability. |
| `ComparisonAssessment` | A pair-specific editorial summary kept separate from vendor facts. |
| `Model` | A model's positioning, lifecycle, modalities, limits, and optional token pricing. |
| `Plan` | A consumer, business, or enterprise offer with public pricing language. |
| `Source` | An official first-party document referenced by evidence-bearing records. |

All IDs are stable lowercase kebab-case strings, dates use `YYYY-MM-DD`, and source URLs must use HTTPS. A substantive `VendorEntry`, `Model`, or `Plan` must reference at least one source and include `verifiedAt`. Relationships, unique IDs, unique category-scoped ordering, the exact taxonomy, vendor/capability pairs, and non-future verification dates are checked at load time.

This is a complete `VendorEntry` from the current seed:

```ts
const entry: VendorEntry = {
  id: "anthropic-primary-coding-agent",
  capabilityId: "primary-coding-agent",
  vendorId: "anthropic",
  title: "Claude Code",
  summary:
    "Claude Code is Anthropic's first-party agentic coding tool for understanding, editing, testing, and reviewing code.",
  details: [],
  productNames: ["Claude Code"],
  availability: "available",
  sourceIds: ["anthropic-claude-code"],
  verifiedAt: "2026-08-11",
};
```

`verifiedAt` is the date on which a contributor checked the cited official evidence. It is not necessarily the feature announcement date, model release date, plan launch date, or date on which the underlying product last changed.

## Local development

Requirements:

- Node.js 22 or newer
- npm 10.9.8

Install the locked dependencies:

```bash
npm ci
```

Start the local development server, then open `http://localhost:3000`:

```bash
npm run dev
```

Run the release checks individually:

```bash
npm run validate:data
npm run lint
npm run typecheck
npm test
npm run build
```

Or run the same validation, lint, type, unit/component, and production-build sequence with one command:

```bash
npm run check
```

## Updating the atlas

Every change follows the same public, reviewable workflow:

1. Identify the capability, model, plan, or source record that changed.
2. Consult a current official Anthropic or OpenAI page.
3. Update or add the source record before referencing it.
4. Update the canonical fact and set `verifiedAt` to the official-source check date.
5. Add or update tests when schema or selector behavior changes.
6. Run validation, tests, type checking, linting, and the production build.
7. Inspect the affected comparison and source expansion in the browser.
8. Commit the data and evidence change and submit it for public review.

For example, to update the “Primary coding agent” capability, first review or add its official document in [`src/data/sources.ts`](src/data/sources.ts). Then change the corresponding fact in [`src/data/vendor-entries.ts`](src/data/vendor-entries.ts), reuse the source ID, and set `verifiedAt` to the day you checked that page. Update the pair-specific assessment only when the evidence changes the comparison conclusion. Finally, run the documented checks and inspect the expanded row so the claim, availability, source link, and visible date agree.

Do not translate an undocumented claim into `not-available`. When reviewed first-party material does not establish a fact, use `not-documented` or `unknown` as appropriate.

## Adding a vendor

The comparison table is generated from stable vendor IDs, so a new ecosystem does not need a hard-coded table column. Add and verify records in this order:

1. Add the vendor identity to [`src/data/vendors.ts`](src/data/vendors.ts).
2. Expand the `Source.publisher` enum in [`src/data/schema.ts`](src/data/schema.ts) for the new first-party publisher.
3. Add official documents to [`src/data/sources.ts`](src/data/sources.ts).
4. Add one sourced fact per covered capability to [`src/data/vendor-entries.ts`](src/data/vendor-entries.ts). Missing pairs already render as `Not documented`; do not manufacture entries solely for apparent completeness.
5. Add current model records in [`src/data/models.ts`](src/data/models.ts) and plan records in [`src/data/plans.ts`](src/data/plans.ts).
6. Add pair-specific comparisons in [`src/data/assessments.ts`](src/data/assessments.ts). These assessments describe evidence; they must not become rankings or opaque scores.
7. Update [`tests/data/dataset.test.ts`](tests/data/dataset.test.ts) and selector/component coverage for the expanded vendor set and pair behavior.
8. Validate the dataset, exercise both vendor positions and views, and run the complete release checks.

Add to [`src/data/capabilities.ts`](src/data/capabilities.ts) only when the vendor exposes a genuinely new provider-neutral comparison dimension. Preserve the category taxonomy in [`src/data/categories.ts`](src/data/categories.ts) unless a separately reviewed schema change intentionally revises it.

## Source methodology

V0.1 uses official first-party Anthropic and OpenAI documentation, help pages, product pages, pricing pages, and announcements. A source record identifies its publisher, URL, and source type; claims refer to source IDs so one official page can support multiple records without duplicating URLs. Evidence-bearing records expose their source links and verification dates in the interface.

Important limitations:

- Vendor documentation is first-party evidence, not independent performance evaluation.
- The atlas records documented product scope and positioning; it does not benchmark quality, reliability, latency, safety, or real-world outcomes.
- The seed covers Anthropic and OpenAI only. Architecture for more vendors is not the same as completed research for those vendors.
- Research is maintained manually. There is no unattended scraper, automatic fact update, or ordinary-build network check, so an official page can change or disappear after verification.
- `verifiedAt` records an evidence check, not a release or announcement date; older records should be rechecked before time-sensitive decisions.
- `not-documented` means the reviewed official material did not establish a capability. It does not prove that the capability is technically impossible or commercially unavailable.
- Pair assessments are transparent editorial summaries of cited facts. They are not quantitative scores, recommendations, or declarations of a winner.
- Public prices and limits can depend on region, billing period, seat count, usage tier, taxes, preview status, and negotiated terms; the canonical text preserves material qualifications when documented.

## Repository structure

```text
.
├── docs/superpowers/          # Approved product specification and implementation plan
├── scripts/
│   └── validate-data.ts       # Deterministic dataset validation entry point
├── src/
│   ├── app/                   # Next.js App Router shell and global styles
│   ├── components/atlas/      # Research Console, table, evidence, filters, vendor view
│   ├── components/            # Shared site header and footer
│   ├── data/                  # Canonical records, Zod schema, and relationship validation
│   └── lib/                   # Pure comparison, search, freshness, label, and URL selectors
├── tests/
│   ├── app/                   # Server-page rendering coverage
│   ├── components/            # User-facing interaction and evidence coverage
│   ├── data/                  # Schema and complete-dataset integrity coverage
│   └── lib/                   # Selector and URL-state coverage
├── next.config.ts
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Roadmap

1. Add Google/Gemini and Microsoft/Copilot using the existing vendor model.
2. Add change history and per-record supersession metadata.
3. Add an optional scheduled link-health and stale-data report.
4. Add saved comparison presets without requiring accounts.
5. Evaluate a public contribution form or CMS only after repository-based updates become a measurable bottleneck.
6. Add CSV and JSON export formats.
7. Add multilingual presentation while retaining one canonical fact layer.

Public visibility does not imply a software license. No license has been selected for v0.1; licensing remains an explicit project-owner decision.
