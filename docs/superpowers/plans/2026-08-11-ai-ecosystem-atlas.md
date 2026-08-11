# AI Ecosystem Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, commit, and publish the public `aserdargun/ai-ecosystem-atlas` repository as an evidence-backed Anthropic/OpenAI research console.

**Architecture:** A Next.js App Router page loads Zod-validated canonical TypeScript records on the server and passes a minimal public dataset to one interactive `ResearchConsole` client boundary. Pure selectors derive comparison rows, counts, search matches, filters, freshness, and vendor summaries; URL query parameters make views shareable without a database or mutation API.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 5.9.3, Tailwind CSS 4.3.3, Zod 4.4.3, Lucide React 1.31.0, Vitest 4.1.10, Testing Library 16.3.2, jsdom 30.0.1, Playwright 1.62.1, npm.

## Global Constraints

- The public application name is exactly **AI Ecosystem Atlas** and the public repository is exactly `aserdargun/ai-ecosystem-atlas`.
- V0.1 compares Anthropic/Claude and OpenAI/ChatGPT in English and supports future vendors without provider-specific source columns.
- The repository and application are public; v0.1 has no accounts, private admin area, database, CMS, write API, automated scraper, scoring, or winner ranking.
- Canonical data is normalized into vendors, categories, capabilities, vendor entries, pair assessments, models, plans, and sources.
- Every substantive vendor entry, model, and plan has official source references and a `verifiedAt` date.
- The required 17 categories retain the exact order defined in the approved specification.
- The accepted UI direction is the dense, table-first **Research Console** with a warm off-white canvas, near-black chrome, and restrained coral accent.
- The mobile experience preserves side-by-side comparison and source access.
- Invalid canonical data fails validation; missing facts render as explicit unknown or not-documented states.
- Search and filters synchronize to validated, shareable URL query parameters.
- Use React Server Components by default and keep interactive state inside one focused client boundary.
- No decorative stock imagery or remote-font dependency is introduced.
- Implementation follows test-driven development: observe each new behavior test fail before adding production code.
- The release is not complete until lint, strict types, unit/component tests, Playwright, production build, browser inspection, screenshot inspection, and Git status all pass.

---

## File map

### Project foundation

- `package.json` — exact dependency versions and quality scripts.
- `package-lock.json` — reproducible npm dependency graph.
- `next.config.ts` — static-safe Next.js configuration.
- `tsconfig.json` — strict TypeScript configuration and `@/*` alias.
- `eslint.config.mjs` — Next.js flat lint configuration.
- `postcss.config.mjs` — Tailwind PostCSS integration.
- `vitest.config.ts` — jsdom unit/component test configuration.
- `vitest.setup.ts` — Testing Library matchers and cleanup.
- `playwright.config.ts` — browser projects and local server lifecycle.

### Application shell and visual system

- `src/app/layout.tsx` — metadata, document shell, and global CSS import.
- `src/app/page.tsx` — server data load and page composition.
- `src/app/globals.css` — Tailwind import, design tokens, responsive table behavior, focus, and reduced motion.
- `src/components/site-header.tsx` — masthead and public navigation.
- `src/components/site-footer.tsx` — provenance and update links.

### Canonical data

- `src/data/schema.ts` — Zod schemas and exported inferred types.
- `src/data/validation.ts` — cross-record relationship invariants.
- `src/data/vendors.ts` — Anthropic and OpenAI vendor records.
- `src/data/categories.ts` — exact 17-category taxonomy.
- `src/data/capabilities.ts` — provider-neutral capability records.
- `src/data/vendor-entries.ts` — evidence-backed vendor facts.
- `src/data/assessments.ts` — pair-specific editorial comparisons.
- `src/data/models.ts` — current documented model-family records.
- `src/data/plans.ts` — current public plan records.
- `src/data/sources.ts` — official Anthropic and OpenAI URLs.
- `src/data/index.ts` — parse, validate, and export one `AtlasDataset`.

### Pure application logic

- `src/lib/freshness.ts` — verification-date classification.
- `src/lib/search.ts` — text normalization and AND-token matching.
- `src/lib/comparison.ts` — joins, filter composition, and vendor summaries.
- `src/lib/url-state.ts` — validated query-state parsing and serialization.
- `src/lib/labels.ts` — presentation labels for canonical enums.

### Research Console

- `src/components/atlas/research-console.tsx` — client state, transitions, and URL synchronization.
- `src/components/atlas/atlas-intro.tsx` — intro copy and computed summary metrics.
- `src/components/atlas/category-rail.tsx` — category navigation and counts.
- `src/components/atlas/filter-toolbar.tsx` — search, vendor, status, availability, freshness, view, and reset controls.
- `src/components/atlas/comparison-table.tsx` — semantic table and row dispatch.
- `src/components/atlas/comparison-row.tsx` — concise cells and accessible expansion control.
- `src/components/atlas/evidence-panel.tsx` — details, products, sources, and dates.
- `src/components/atlas/vendor-comparison.tsx` — filtered category coverage and distinction summary.
- `src/components/atlas/status-badge.tsx` — text-plus-color status treatment.
- `src/components/atlas/empty-state.tsx` — zero-results explanation and reset.
- `src/components/atlas/mobile-filter-sheet.tsx` — accessible mobile filter disclosure.

### Verification and documentation

- `tests/data/schema.test.ts` — schema and relationship failure fixtures.
- `tests/data/dataset.test.ts` — seed coverage, category, source, and freshness assertions.
- `tests/lib/freshness.test.ts` — exact freshness thresholds.
- `tests/lib/search.test.ts` — normalization and AND search.
- `tests/lib/comparison.test.ts` — joins, missing entries, filters, and summaries.
- `tests/lib/url-state.test.ts` — query parsing and serialization.
- `tests/components/research-console.test.tsx` — primary component interactions.
- `tests/components/evidence-panel.test.tsx` — source and detail accessibility.
- `tests/components/vendor-comparison.test.tsx` — aggregate vendor view.
- `e2e/atlas.spec.ts` — browser workflow and responsive layout smoke tests.
- `scripts/validate-data.ts` — CLI integrity check used in the update workflow.
- `public/ai-ecosystem-atlas.png` — final verified 1440×900 screenshot.
- `README.md` — public project, architecture, schema, workflow, and roadmap documentation, reviewed directly with every documented command executed.

---

### Task 1: Scaffold the strict Next.js application and quality harness

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Test: `tests/app/page.test.tsx`

**Interfaces:**
- Consumes: approved application name and Research Console design tokens.
- Produces: scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:e2e`, `validate:data`, and `check`; alias `@/* -> ./src/*`; a renderable root page.

- [ ] **Step 1: Write the failing page-shell test**

```tsx
import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

it("identifies the public application", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { name: "AI Ecosystem Atlas" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/evidence-backed comparison/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Install exact production and development dependencies**

Run:

```bash
npm install next@16.3.0 react@19.2.8 react-dom@19.2.8 zod@4.4.3 lucide-react@1.31.0
npm install -D typescript@5.9.3 @types/node@26.2.0 @types/react@19.2.18 @types/react-dom@19.2.4 tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 eslint@10.8.1 eslint-config-next@16.3.0 vitest@4.1.10 @vitejs/plugin-react@6.0.5 vite@8.2.1 jsdom@30.0.1 @testing-library/react@16.3.2 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.3 @playwright/test@1.62.1 tsx@4.23.12
```

- [ ] **Step 3: Add the configs and run the test to observe the missing page failure**

`vitest.config.ts` must resolve `@` to `src`, use `jsdom`, load `vitest.setup.ts`, and include `tests/**/*.test.{ts,tsx}`. `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`. `playwright.config.ts` runs `npm run dev -- --hostname 127.0.0.1` at `http://127.0.0.1:3000` and enables Chromium.

Run: `npm test -- tests/app/page.test.tsx`

Expected: FAIL because `@/app/page` does not exist.

- [ ] **Step 4: Implement the minimal root shell and exact scripts**

`package.json` scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "validate:data": "tsx scripts/validate-data.ts",
  "check": "npm run validate:data && npm run lint && npm run typecheck && npm test && npm run build"
}
```

`src/app/page.tsx` initially renders a `<main>`, an `h1` with `AI Ecosystem Atlas`, and the sentence `A public, evidence-backed comparison of AI product and developer ecosystems.`

- [ ] **Step 5: Verify the foundation**

Run: `npm test -- tests/app/page.test.tsx && npm run lint && npm run typecheck && npm run build`

Expected: all commands exit 0 and Next.js emits a production route for `/`.

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs postcss.config.mjs vitest.config.ts vitest.setup.ts playwright.config.ts src/app tests/app
git commit -m "build: scaffold the atlas application"
```

---

### Task 2: Define and enforce the canonical schema

**Files:**
- Create: `src/data/schema.ts`
- Create: `src/data/validation.ts`
- Test: `tests/data/schema.test.ts`

**Interfaces:**
- Consumes: ISO dates, HTTPS URLs, lowercase kebab IDs, and the 17-category invariant from the specification.
- Produces: `AtlasDataset`, `Vendor`, `Category`, `Capability`, `VendorEntry`, `ComparisonAssessment`, `Model`, `Plan`, `Source`, `Availability`, `ComparisonStatus`, `parseAtlasDataset(input, today)`.

- [ ] **Step 1: Write failing schema and relationship tests**

```ts
expect(() => parseAtlasDataset(validFixture, new Date("2026-08-11"))).not.toThrow();
expect(() => parseAtlasDataset(withDuplicateId, today)).toThrow(/duplicate id/i);
expect(() => parseAtlasDataset(withOrphanCapability, today)).toThrow(/missing category/i);
expect(() => parseAtlasDataset(withDuplicatePair, today)).toThrow(/capability\/vendor pair/i);
expect(() => parseAtlasDataset(withHttpSource, today)).toThrow(/https/i);
expect(() => parseAtlasDataset(withFutureDate, today)).toThrow(/future/i);
expect(() => parseAtlasDataset(withWrongTaxonomy, today)).toThrow(/category order/i);
```

The valid fixture contains two vendors, all 17 category IDs in order, one capability, two vendor entries, one pair assessment, one model, one plan, and two official sources.

- [ ] **Step 2: Run tests and observe missing parser failure**

Run: `npm test -- tests/data/schema.test.ts`

Expected: FAIL because `parseAtlasDataset` and the schema types do not exist.

- [ ] **Step 3: Implement Zod record schemas**

Export exact enum schemas for:

```ts
const availabilityValues = [
  "available",
  "limited",
  "not-available",
  "not-documented",
  "unknown",
] as const;

const comparisonStatusValues = [
  "strong-parity",
  "partial-parity",
  "different-approach",
  "vendor-specific",
  "insufficient-evidence",
] as const;
```

Each record schema uses `.strict()`. `verifiedAt` uses an ISO-date regex and each source URL uses `z.url().refine(url => url.startsWith("https://"))`.

- [ ] **Step 4: Implement cross-record validation**

`parseAtlasDataset(input, today)` parses structural schemas, then uses `Set` and `Map` indexes to reject duplicate IDs, orphan references, duplicate capability/vendor pairs, empty evidence lists, future dates, duplicate order values, and taxonomy drift. Errors include the record type and ID.

- [ ] **Step 5: Verify schema behavior**

Run: `npm test -- tests/data/schema.test.ts && npm run typecheck`

Expected: all schema tests and strict types pass.

- [ ] **Step 6: Commit the canonical contract**

```bash
git add src/data/schema.ts src/data/validation.ts tests/data/schema.test.ts
git commit -m "feat: define the canonical atlas schema"
```

---

### Task 3: Seed the official-source Anthropic/OpenAI dataset

**Files:**
- Create: `src/data/vendors.ts`
- Create: `src/data/categories.ts`
- Create: `src/data/capabilities.ts`
- Create: `src/data/vendor-entries.ts`
- Create: `src/data/assessments.ts`
- Create: `src/data/models.ts`
- Create: `src/data/plans.ts`
- Create: `src/data/sources.ts`
- Create: `src/data/index.ts`
- Create: `scripts/validate-data.ts`
- Test: `tests/data/dataset.test.ts`

**Interfaces:**
- Consumes: `parseAtlasDataset`, approved prior comparison themes, current official Anthropic/OpenAI documentation checked on `2026-08-11`.
- Produces: `atlasDataset: AtlasDataset` and a CLI that prints exact record counts plus `Latest verification: 2026-08-11`.

- [ ] **Step 1: Write the failing seed coverage test**

```ts
expect(atlasDataset.vendors.map(({ id }) => id)).toEqual(["anthropic", "openai"]);
expect(atlasDataset.categories).toHaveLength(17);
expect(new Set(atlasDataset.capabilities.map(item => item.categoryId)).size).toBe(17);
expect(atlasDataset.capabilities.length).toBeGreaterThanOrEqual(55);
expect(atlasDataset.vendorEntries.length).toBeGreaterThanOrEqual(110);
expect(atlasDataset.sources.length).toBeGreaterThanOrEqual(24);
expect(atlasDataset.sources.every(source => source.url.startsWith("https://"))).toBe(true);
expect(atlasDataset.vendorEntries.every(entry => entry.sourceIds.length > 0)).toBe(true);
expect(atlasDataset.vendorEntries.every(entry => entry.verifiedAt === "2026-08-11")).toBe(true);
```

The test also asserts at least two capabilities per category, at least one model and one plan per vendor, and exactly one assessment for each capability in the default vendor pair.

- [ ] **Step 2: Run the dataset test and observe the missing module failure**

Run: `npm test -- tests/data/dataset.test.ts`

Expected: FAIL because `atlasDataset` has not been created.

- [ ] **Step 3: Add the exact category taxonomy and vendor records**

Category IDs, in order:

```ts
[
  "models",
  "chat-knowledge-work",
  "coding-agents",
  "agentic-workflows",
  "customization",
  "skills-plugins",
  "connectors-mcp",
  "memory-context",
  "files-artifacts",
  "research-web",
  "computer-browser-voice",
  "local-cloud-environments",
  "automation-scheduling",
  "permissions-security",
  "api-sdk",
  "enterprise-governance",
  "pricing-plans",
]
```

Vendor IDs are `anthropic` and `openai`; homepage URLs are `https://www.anthropic.com/` and `https://openai.com/`.

- [ ] **Step 4: Add at least 55 provider-neutral capability records**

Use these exact capability IDs as the minimum seed set:

```text
frontier-model-lineup, context-window, multimodal-input, native-image-generation,
conversational-chat, projects, delegated-knowledge-work, long-running-work,
primary-coding-agent, terminal-cli, ide-integration, desktop-coding, browser-cloud-coding,
custom-subagents, multi-agent-orchestration, hosted-agent-runtime, function-tool-calling,
project-instruction-file, configuration-scopes, lifecycle-hooks, custom-agent-definitions,
agent-skills, plugin-packaging, plugin-distribution,
mcp-client, remote-connectors, local-connectors,
chat-memory, project-memory, coding-auto-memory, cross-provider-import,
file-analysis, document-generation, interactive-artifacts, sandboxed-code-execution,
web-search, deep-research, source-citations, web-fetch,
computer-use-product, computer-use-api, browser-control, voice-mode,
local-execution, managed-cloud-environments, worktree-isolation, execution-sandbox,
scheduled-tasks, background-continuation, event-driven-automation,
permission-modes, fine-grained-permission-rules, full-autonomy-mode, enterprise-policy,
core-model-api, agent-sdk, built-in-api-tools, api-mcp,
team-enterprise-plans, sso-scim, audit-logs, data-retention-controls,
consumer-plans, business-plans, enterprise-pricing, api-token-pricing
```

Assign each capability to exactly one approved category and give it a provider-neutral description, relevant search tags, and stable order.

- [ ] **Step 5: Add official first-party sources and evidence-backed records**

Use only current pages on these first-party hosts for the seed:

```text
docs.anthropic.com
support.anthropic.com
www.anthropic.com
claude.com
platform.claude.com
developers.openai.com
platform.openai.com
help.openai.com
openai.com
chatgpt.com
```

Each capability receives an Anthropic entry, an OpenAI entry, and a default pair assessment. Product facts from the prior comparison are retained only when a current official page supports them. Unsupported or ambiguous facts use `not-documented` or `unknown`. The exact source title and URL are stored once in `sources.ts` and referenced by stable IDs.

- [ ] **Step 6: Add current model and plan records**

Record only models and plans shown as current on official model/pricing documentation on 2026-08-11. Preserve documented token limits as numbers, omit unknown numbers, keep plan pricing qualifications in `priceDisplay`/`billingNote`, and never infer enterprise contract pricing.

- [ ] **Step 7: Parse and export the dataset and CLI**

`src/data/index.ts` constructs the raw record object and exports:

```ts
export const atlasDataset = parseAtlasDataset(rawDataset, new Date());
```

`scripts/validate-data.ts` imports `atlasDataset`, prints counts for every record collection, and exits nonzero on thrown validation errors.

- [ ] **Step 8: Verify seed integrity**

Run: `npm run validate:data && npm test -- tests/data && npm run typecheck`

Expected: at least 55 capabilities, 110 vendor entries, 55 assessments, 24 sources, complete category coverage, and all checks exit 0.

- [ ] **Step 9: Commit the canonical seed**

```bash
git add src/data scripts/validate-data.ts tests/data
git commit -m "data: seed the Anthropic and OpenAI atlas"
```

---

### Task 4: Build pure comparison, search, freshness, and URL selectors

**Files:**
- Create: `src/lib/freshness.ts`
- Create: `src/lib/search.ts`
- Create: `src/lib/comparison.ts`
- Create: `src/lib/url-state.ts`
- Create: `src/lib/labels.ts`
- Test: `tests/lib/freshness.test.ts`
- Test: `tests/lib/search.test.ts`
- Test: `tests/lib/comparison.test.ts`
- Test: `tests/lib/url-state.test.ts`

**Interfaces:**
- Consumes: `AtlasDataset` and its inferred record types.
- Produces: `classifyFreshness`, `normalizeSearchText`, `matchesSearch`, `buildComparisonRows`, `filterComparisonRows`, `buildCategoryCounts`, `buildVendorSummary`, `parseUrlState`, `serializeUrlState`, `defaultAtlasState`, and enum-label maps.

- [ ] **Step 1: Write failing freshness boundary tests**

```ts
const today = new Date("2026-08-11T12:00:00Z");
expect(classifyFreshness("2026-05-13", today)).toBe("current");
expect(classifyFreshness("2026-05-12", today)).toBe("aging");
expect(classifyFreshness("2026-02-12", today)).toBe("aging");
expect(classifyFreshness("2026-02-11", today)).toBe("stale");
```

- [ ] **Step 2: Write failing search, join, and URL tests**

Assert that `Mémoire` matches `memoire`, `code memory` uses AND semantics, a missing vendor pair yields a synthesized `not-documented` cell, filters compose, category counts reflect current filters except their own category selection, invalid vendor pairs fall back to Anthropic/OpenAI, and serialized query keys use the documented names.

- [ ] **Step 3: Run selector tests and observe missing exports**

Run: `npm test -- tests/lib`

Expected: FAIL because selector modules do not exist.

- [ ] **Step 4: Implement text and freshness utilities**

`normalizeSearchText` uses Unicode NFD normalization, removes combining marks, lowercases, and collapses whitespace. `matchesSearch` splits the normalized query on whitespace and requires `tokens.every(token => haystack.includes(token))`. Freshness computes whole calendar-day difference in UTC.

- [ ] **Step 5: Implement indexed comparison selectors**

`buildComparisonRows(dataset, leftVendorId, rightVendorId)` creates `Map` indexes for categories, entries, sources, and assessments, preserves category/capability order, and returns one immutable `ComparisonRow` per capability. `filterComparisonRows` performs one loop over rows, applying category, availability, status, freshness, and search constraints with early exits.

- [ ] **Step 6: Implement validated URL state**

```ts
type AtlasView = "explorer" | "vendors";
type Freshness = "current" | "aging" | "stale";
type AtlasState = {
  query: string;
  categoryId: string | null;
  leftVendorId: string;
  rightVendorId: string;
  availability: Availability[];
  statuses: ComparisonStatus[];
  freshness: Freshness[];
  view: AtlasView;
};
```

Parsing accepts only IDs and enum values found in the dataset, deduplicates arrays, caps the query at 120 characters, and rejects identical left/right vendors. Serialization omits defaults and sorts multi-value parameters in canonical enum order.

- [ ] **Step 7: Verify all pure logic**

Run: `npm test -- tests/lib && npm run typecheck`

Expected: all boundary, search, join, filter, summary, and URL tests pass.

- [ ] **Step 8: Commit selectors**

```bash
git add src/lib tests/lib
git commit -m "feat: add atlas comparison selectors"
```

---

### Task 5: Implement the Research Console shell, filters, and semantic table

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Create: `src/components/atlas/research-console.tsx`
- Create: `src/components/atlas/atlas-intro.tsx`
- Create: `src/components/atlas/category-rail.tsx`
- Create: `src/components/atlas/filter-toolbar.tsx`
- Create: `src/components/atlas/comparison-table.tsx`
- Create: `src/components/atlas/comparison-row.tsx`
- Create: `src/components/atlas/evidence-panel.tsx`
- Create: `src/components/atlas/status-badge.tsx`
- Create: `src/components/atlas/empty-state.tsx`
- Create: `src/components/atlas/mobile-filter-sheet.tsx`
- Test: `tests/components/research-console.test.tsx`
- Test: `tests/components/evidence-panel.test.tsx`

**Interfaces:**
- Consumes: `atlasDataset`, selectors, `AtlasState`, and enum labels.
- Produces: `<ResearchConsole dataset={atlasDataset} initialState={state} />`, a semantic comparison table, accessible evidence disclosure, and URL-synchronized controls.

- [ ] **Step 1: Write failing Research Console interaction tests**

```tsx
expect(screen.getByRole("searchbox", { name: /search capabilities/i })).toBeVisible();
expect(screen.getByRole("table", { name: /anthropic and openai/i })).toBeVisible();
await user.type(search, "lifecycle hooks");
expect(screen.getByRole("row", { name: /lifecycle hooks/i })).toBeVisible();
await user.click(screen.getByRole("button", { name: /show evidence for lifecycle hooks/i }));
expect(screen.getByRole("link", { name: /official source/i })).toHaveAttribute("href", expect.stringMatching(/^https:\/\//));
```

Also test category filtering, combined status filtering, live result count, reset, zero results, and rejection of duplicate vendor selection.

- [ ] **Step 2: Run component tests and observe missing component failure**

Run: `npm test -- tests/components/research-console.test.tsx tests/components/evidence-panel.test.tsx`

Expected: FAIL because atlas components do not exist.

- [ ] **Step 3: Implement the server page and static chrome**

`src/app/page.tsx` validates/imports `atlasDataset`, parses `searchParams`, and renders `SiteHeader`, `AtlasIntro`, `ResearchConsole`, and `SiteFooter`. Metadata title is `AI Ecosystem Atlas — Compare AI ecosystems`; description contains `Evidence-backed comparisons across models, products, agents, APIs, and plans.`

- [ ] **Step 4: Implement the client state boundary**

`ResearchConsole` uses primitive state fields, `useDeferredValue` for the query, `useTransition` for nonurgent filter changes, and selector calls derived during render. URL writes use `router.replace` with the canonical serialized query and `scroll: false`. No effect mirrors derived rows into state.

- [ ] **Step 5: Implement accessible filters and navigation**

All controls have visible labels. The category rail uses buttons with `aria-pressed`; availability/status/freshness controls use fieldsets and checkboxes; vendor selectors exclude the opposite selected vendor; reset restores `defaultAtlasState`. The mobile filter sheet uses a native disclosure/dialog pattern with focus return.

- [ ] **Step 6: Implement the semantic table and evidence disclosure**

Render `table > caption + thead + tbody`, column headers with `scope="col"`, capability row headers with `scope="row"`, and a detail `<tr>` controlled by a button with `aria-expanded` and `aria-controls`. Evidence links include source title and publisher; all links use `target="_blank"` with `rel="noreferrer"`.

- [ ] **Step 7: Apply the accepted Research Console visual system**

Use CSS custom properties for canvas `#f5f2ec`, ink `#24211d`, accent `#f26b3a`, border `#d9d4ca`, Anthropic accent `#d97757`, and OpenAI accent `#168c6b`. Implement sticky header/capability cells, contained table overflow, visible focus rings, reduced motion, content visibility for table rows, and breakpoints from the specification.

- [ ] **Step 8: Verify the primary interface**

Run: `npm test -- tests/components && npm run lint && npm run typecheck && npm run build`

Expected: component interactions, accessibility assertions, lint, strict types, and build all pass.

- [ ] **Step 9: Commit the Research Console**

```bash
git add src/app src/components tests/components
git commit -m "feat: build the Research Console"
```

---

### Task 6: Add the focused vendor-comparison view

**Files:**
- Create: `src/components/atlas/vendor-comparison.tsx`
- Modify: `src/components/atlas/research-console.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/components/vendor-comparison.test.tsx`

**Interfaces:**
- Consumes: filtered `ComparisonRow[]`, selected `Vendor` pair, models, plans, categories, and `buildVendorSummary`.
- Produces: `<VendorComparison ... />` with category coverage, availability totals, model/plan lists, parity groups, different approaches, and vendor-specific capabilities.

- [ ] **Step 1: Write the failing vendor-view test**

```tsx
render(<VendorComparison {...fixtureProps} />);
expect(screen.getByRole("heading", { name: /anthropic and openai/i })).toBeVisible();
expect(screen.getByText(/category coverage/i)).toBeVisible();
expect(screen.getByText(/different approaches/i)).toBeVisible();
expect(screen.queryByText(/winner|score/i)).not.toBeInTheDocument();
```

Test that active category/search filters change the summary and that model/plan source links remain accessible.

- [ ] **Step 2: Run the test and observe missing view failure**

Run: `npm test -- tests/components/vendor-comparison.test.tsx`

Expected: FAIL because `VendorComparison` does not exist.

- [ ] **Step 3: Implement vendor summary sections**

Use semantic sections and definition lists. Coverage is expressed as factual counts (`available`, `limited`, `not documented`) rather than percentages that imply quality. Models and plans are compact source-linked lists. Comparison groups reuse assessment labels and summaries.

- [ ] **Step 4: Wire the view toggle without a second dataset**

`ResearchConsole` renders either `ComparisonTable` or `VendorComparison` from the same deferred/filter-derived rows. The `view` query parameter round-trips on reload.

- [ ] **Step 5: Verify and commit the vendor view**

Run: `npm test -- tests/components/vendor-comparison.test.tsx tests/components/research-console.test.tsx && npm run typecheck`

Expected: both views and URL switching pass.

```bash
git add src/components/atlas/vendor-comparison.tsx src/components/atlas/research-console.tsx src/app/globals.css tests/components/vendor-comparison.test.tsx
git commit -m "feat: add vendor comparison view"
```

---

### Task 7: Document the public project and update workflow

**Files:**
- Create: `README.md`
- Modify: `.gitignore`
- Modify: `package.json`

**Interfaces:**
- Consumes: final scripts, record types, taxonomy, actual repository structure, and verified screenshot path.
- Produces: a complete public README and metadata suitable for the GitHub repository.

- [ ] **Step 1: Write the polished README**

Include `Purpose`, `Features`, `Architecture`, `Data schema`, `Local development`, `Updating the atlas`, `Adding a vendor`, `Source methodology`, and `Roadmap` sections plus badges for Next.js, TypeScript, and checks; a screenshot; the 17 categories; the canonical data flow; a complete `VendorEntry` example; exact install/dev/check/build commands; the eight-step update workflow from the specification; the files to edit for a new vendor; methodology limitations; repository tree; and roadmap. State explicitly that `verifiedAt` is the evidence-check date, not necessarily the product release date, and that the project does not declare a winner.

- [ ] **Step 2: Add public repository metadata**

Add `description`, `keywords`, `homepage` only if a deployment URL exists, `private: false`, `engines.node: ">=22.0.0"`, and `packageManager: "npm@10.9.8"`. Do not add a license without a separate owner decision.

- [ ] **Step 3: Review the README and execute every documented command**

Read the finished README top to bottom and verify that every required section, the 17-category list, complete `VendorEntry` example, repository tree, update steps, methodology limitation, screenshot path, and roadmap are present and accurate. Run every documented local-development and verification command in the order shown, including `npm ci`, `npm run dev` startup, `npm run validate:data`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Check each Markdown link target and ensure the screenshot path resolves to the committed image after Task 8.

Expected: the prose is complete and internally consistent; every command exits successfully; every link is syntactically valid; the screenshot path is the exact final Task 8 path.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md .gitignore package.json package-lock.json
git commit -m "docs: explain the public atlas workflow"
```

---

### Task 8: Run browser fidelity QA, capture the screenshot, and publish GitHub

**Files:**
- Create: `e2e/atlas.spec.ts`
- Create: `public/ai-ecosystem-atlas.png`
- Modify: `README.md`
- Modify: any focused implementation file with a verified mismatch.

**Interfaces:**
- Consumes: completed app, accepted Research Console mockup, primary workflow, GitHub CLI authentication.
- Produces: passing Chromium coverage at three viewports, a visually inspected native-size screenshot, a clean final commit, and public `https://github.com/aserdargun/ai-ecosystem-atlas`.

- [ ] **Step 1: Write failing browser workflow tests**

```ts
test("searches, filters, expands evidence, switches views, and resets", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: /search capabilities/i }).fill("lifecycle hooks");
  await expect(page.getByRole("row", { name: /lifecycle hooks/i })).toBeVisible();
  await page.getByRole("button", { name: /show evidence for lifecycle hooks/i }).click();
  await expect(page.getByRole("link", { name: /official source/i }).first()).toHaveAttribute("href", /^https:\/\//);
  await page.getByRole("button", { name: /vendor comparison/i }).click();
  await expect(page.getByRole("heading", { name: /anthropic and openai/i })).toBeVisible();
  await page.getByRole("button", { name: /clear filters/i }).click();
});
```

Add projects or parameterized tests for 1440×900, 1024×768, and 390×844. Assert no page-level horizontal overflow; the table container may scroll horizontally.

- [ ] **Step 2: Run Playwright and observe any missing interaction or browser failure**

Run: `npx playwright install chromium && npm run test:e2e`

Expected before fixes: at least one workflow or responsive assertion fails if any browser-only behavior is incomplete.

- [ ] **Step 3: Repair only evidenced functional or responsive mismatches**

Use the failure trace, browser console, and screenshot to fix exact controls, labels, overflow, focus, sticky cells, or query-state behavior. Rerun the smallest failing Playwright test after each repair.

- [ ] **Step 4: Capture and inspect the accepted desktop design**

Capture `/` at 1440×900 to `public/ai-ecosystem-atlas.png`. Inspect the image at native size and compare at least these points with the accepted mockup: near-black masthead, warm canvas, persistent category rail, toolbar density, sticky table anatomy, coral active state, vendor column distinction, visible verification/source affordance, and next-section visibility.

- [ ] **Step 5: Run the complete clean verification suite**

Run:

```bash
npm ci
npm run validate:data
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
git diff --check
git status -sb
```

Expected: every command exits 0; only the intended screenshot/README/e2e changes are uncommitted before the final commit.

- [ ] **Step 6: Commit the verified release**

```bash
git add e2e/atlas.spec.ts public/ai-ecosystem-atlas.png README.md
git commit -m "test: verify the initial atlas release"
```

- [ ] **Step 7: Confirm GitHub scope and authentication**

Run:

```bash
gh --version
gh auth status
git status -sb
git log --oneline --decorate -10
```

Expected: GitHub CLI is authenticated as `aserdargun`, the tree is clean, and all commits belong to this new repository.

- [ ] **Step 8: Create and push the public repository**

Run:

```bash
gh repo create aserdargun/ai-ecosystem-atlas --public --source=. --remote=origin --push --description "A public, evidence-backed atlas for comparing AI product and developer ecosystems."
```

Expected: the command creates a public repository, sets `origin`, pushes `main`, and reports `https://github.com/aserdargun/ai-ecosystem-atlas`.

- [ ] **Step 9: Verify remote state**

Run:

```bash
gh repo view aserdargun/ai-ecosystem-atlas --json nameWithOwner,visibility,defaultBranchRef,url,description
git ls-remote --heads origin main
```

Expected: `visibility` is `PUBLIC`, the default branch is `main`, the URL matches the required repository, and remote `main` points to local `HEAD`.
