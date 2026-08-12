# AI Ecosystem Atlas Azure Static Web Apps Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing AI Ecosystem Atlas repository as a continuously deployed Azure Static Web Apps Free site at `https://ai.aserdargun.com` without adding an application runtime, paid Azure service, or unrelated DNS change.

**Architecture:** Convert the one-route Next.js App Router application to a static export in `out/`, move arbitrary query-string initialization into the existing `ResearchConsole` client boundary, and keep the repository's canonical data architecture unchanged. A pinned GitHub Actions workflow validates and builds `main`, then uploads the already-built static artifact to one Azure Static Web App; IHS continues to host the DNS zone and receives only the Azure validation TXT record and `ai` CNAME.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 5.9.3, Vitest 4.1.10, Playwright 1.62.1, GitHub Actions, Azure CLI 2.89.0, Azure Static Web Apps Free, IHS DNS.

## Global Constraints

- Azure subscription: `Azure subscription 1` (`b927b920-b1a7-40f4-b553-f23efa03850a`).
- Azure resource group: `rg-ai-ecosystem-atlas` in `westeurope`.
- Azure Static Web App: `swa-ai-ecosystem-atlas` in `westeurope`, SKU `Free`.
- GitHub source: public repository `https://github.com/aserdargun/ai-ecosystem-atlas`, production branch `main`.
- Static source/build locations: repository app location `/`, Next.js output `out/`; the prebuilt deployment action receives `app_location: out`, `output_location: ""`, and `skip_app_build: true`.
- Production hostname: `ai.aserdargun.com`; IHS remains authoritative for `aserdargun.com`.
- DNS changes are limited to TXT `_dnsauth.ai` and CNAME `ai`; do not change `@`, `www`, MX, SPF, DKIM, DMARC, nameservers, wildcard records, or any unrelated record.
- No Standard or Dedicated SKU, App Service, Front Door, CDN, storage account, database, Azure DNS zone, Log Analytics workspace, API route, server action, managed function, CMS, authentication, analytics, or tracking is authorized.
- The deployment token exists only as GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN`; never print it, store it in a file, commit it, or expose it to the client bundle.
- Keep the existing 17 categories, canonical data records, verified source URLs, `verifiedAt` fields, semantic comparison table, mobile behavior, and accessibility behavior unchanged.
- Valid incoming query strings are read after hydration without an automatic URL rewrite; unknown query values fall back through the existing `parseUrlState` validation and searches remain capped at 120 characters.
- Existing browser authentication may be used for IHS, but never inspect or expose passwords, cookies, session storage, recovery codes, or MFA secrets.
- Deleting an Azure resource, custom domain, GitHub secret, TXT record, or CNAME is destructive and requires separate explicit user authorization.

---

## File map

### Static application boundary

- Modify `src/app/page.tsx`: make the root page independent of request-time `searchParams` and render the default static shell.
- Modify `src/components/atlas/research-console.tsx`: initialize validated URL state from `window.location.search` once after hydration.
- Modify `next.config.ts`: enable Next.js `output: "export"` while retaining `agentRules: false`.
- Modify `tests/app/page.test.tsx`: assert the synchronous static page contract.
- Modify `tests/components/research-console.test.tsx`: assert client URL hydration, vendor order, and view restoration without an automatic rewrite.
- Modify `e2e/atlas.spec.ts`: cover a direct query URL on the rendered application.
- Modify `playwright.config.ts`: allow the same committed suite to target an explicitly supplied production base URL.

### Static artifact contract

- Create `scripts/verify-static-export.ts`: fail unless `out/index.html` and non-empty `out/_next/static` exist.
- Modify `package.json`: add `verify:static` and include it after `build` in `check`.
- Modify `.gitignore`: ignore generated `out/` deployment content.

### Continuous deployment and documentation

- Create `.github/workflows/deploy-azure-static-web-apps.yml`: validate, build, verify, and deploy `main` with immutable action references.
- Modify `README.md`: publish the production URL, static architecture, deployment workflow, secret name, Azure resource map, and safe update path.

### External state, not repository files

- Create Azure resource group `rg-ai-ecosystem-atlas` and Static Web App `swa-ai-ecosystem-atlas`.
- Create GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN` by piping the Azure token directly into GitHub CLI.
- Add IHS TXT `_dnsauth.ai` and CNAME `ai` only after showing their exact resolved values.
- Set the GitHub repository homepage to `https://ai.aserdargun.com` only after the custom hostname is live.

### Primary implementation references

- Approved design: [`docs/superpowers/specs/2026-08-12-azure-static-web-apps-deployment-design.md`](../specs/2026-08-12-azure-static-web-apps-deployment-design.md)
- Next.js static export: <https://nextjs.org/docs/app/guides/static-exports>
- Azure Static Web Apps Next.js deployment models: <https://learn.microsoft.com/en-us/azure/static-web-apps/nextjs>
- Azure prebuilt-artifact workflow configuration: <https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration>
- Azure external custom-domain setup: <https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-external>
- Azure Static Web Apps hostname CLI: <https://learn.microsoft.com/en-us/cli/azure/staticwebapp/hostname?view=azure-cli-latest>

---

### Task 1: Make query-state hydration compatible with a static Next.js export

**Files:**
- Modify: `tests/app/page.test.tsx`
- Modify: `tests/components/research-console.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/atlas/research-console.tsx`

**Interfaces:**
- Consumes: `parseUrlState(searchParams: Pick<URLSearchParams, "get">, dataset: AtlasDataset): AtlasState`, `defaultAtlasState`, and the existing canonical `serializeUrlState` flow.
- Produces: `Page(): React.JSX.Element` with no request props and `ResearchConsole({ dataset }: { dataset: AtlasDataset }): React.JSX.Element` whose first client effect adopts validated browser URL state.

- [ ] **Step 1: Write failing static-page and client-hydration tests**

Update the page test to render a prop-free synchronous page:

```tsx
it("identifies the statically renderable public application", () => {
  render(<Page />);
  expect(
    screen.getByRole("link", { name: "AI Ecosystem Atlas home" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Compare the ecosystems." }),
  ).toBeInTheDocument();
});
```

In the Research Console test, import `waitFor`, remove the now-unused `defaultAtlasState` import, reset the browser URL for test isolation, remove the `initialState` helper argument, and add the direct-query test:

```tsx
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

beforeEach(() => {
  replace.mockClear();
  window.history.replaceState({}, "", "/");
});

function renderConsole() {
  return render(<ResearchConsole dataset={atlasDataset} />);
}

it("hydrates validated state from the browser query without rewriting it", async () => {
  window.history.replaceState(
    {},
    "",
    "/?q=terminal+cli&category=coding-agents&left=openai&right=anthropic&view=vendors",
  );

  renderConsole();

  await waitFor(() => {
    expect(screen.getByRole("combobox", { name: /left vendor/i })).toHaveValue(
      "openai",
    );
  });
  expect(screen.getByRole("combobox", { name: /right vendor/i })).toHaveValue(
    "anthropic",
  );
  expect(screen.getByRole("searchbox", { name: /search capabilities/i })).toHaveValue(
    "terminal cli",
  );
  expect(
    screen.getByRole("heading", { name: /openai and anthropic vendor comparison/i }),
  ).toBeVisible();
  expect(replace).not.toHaveBeenCalled();
});
```

Convert the two tests that currently pass custom `initialState` objects to set exact browser URLs before `renderConsole()`:

```tsx
it("renders a reversed pair from browser URL state", async () => {
  window.history.replaceState({}, "", "/?left=openai&right=anthropic");
  renderConsole();

  await waitFor(() => {
    expect(screen.getByRole("combobox", { name: /left vendor/i })).toHaveValue(
      "openai",
    );
  });
  expect(screen.getByRole("combobox", { name: /right vendor/i })).toHaveValue(
    "anthropic",
  );
  expect(
    screen.getByRole("table", { name: /openai and anthropic/i }),
  ).toBeVisible();
});

it("restores the vendor comparison from browser URL state", async () => {
  window.history.replaceState({}, "", "/?view=vendors");
  renderConsole();

  expect(
    await screen.findByRole("heading", {
      name: /anthropic and openai vendor comparison/i,
    }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Vendor comparison" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
```

- [ ] **Step 2: Run the focused tests and observe the static-boundary failure**

Run:

```bash
npm test -- tests/app/page.test.tsx tests/components/research-console.test.tsx
```

Expected: FAIL because `Page` still accepts request-time `searchParams`, `ResearchConsole` still requires `initialState`, and a browser query does not own initialization inside the client boundary.

- [ ] **Step 3: Implement the prop-free page and one-time validated browser hydration**

Replace `src/app/page.tsx` with:

```tsx
import { AtlasIntro } from "@/components/atlas/atlas-intro";
import { ResearchConsole } from "@/components/atlas/research-console";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { atlasDataset } from "@/data/index";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <AtlasIntro dataset={atlasDataset} />
        <ResearchConsole dataset={atlasDataset} />
      </main>
      <SiteFooter />
    </>
  );
}
```

In `src/components/atlas/research-console.tsx`, add `useEffect`, import `parseUrlState`, remove the `initialState` prop, and initialize with a defensive copy of `defaultAtlasState`:

```tsx
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
```

```tsx
import {
  defaultAtlasState,
  parseUrlState,
  serializeUrlState,
  type AtlasState,
} from "@/lib/url-state";
```

```tsx
export function ResearchConsole({ dataset }: { dataset: AtlasDataset }) {
  const router = useRouter();
  const [state, setState] = useState(() => copyAtlasState(defaultAtlasState));
  const latestState = useRef(state);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const browserState = parseUrlState(
      new URLSearchParams(window.location.search),
      dataset,
    );
    latestState.current = browserState;
    setState(browserState);
  }, [dataset]);
```

The effect must not call `writeUrl`; incoming valid or invalid query strings are read, not silently canonicalized on first load. Keep all existing user-triggered `router.replace` behavior unchanged.

- [ ] **Step 4: Run the focused tests and type checker**

Run:

```bash
npm test -- tests/app/page.test.tsx tests/components/research-console.test.tsx
npm run typecheck
```

Expected: all focused tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit the static query-state boundary**

```bash
git add src/app/page.tsx src/components/atlas/research-console.tsx tests/app/page.test.tsx tests/components/research-console.test.tsx
git commit -m "refactor: hydrate atlas state from the browser URL"
```

---

### Task 2: Produce and verify the deployable `out/` artifact

**Files:**
- Create: `scripts/verify-static-export.ts`
- Modify: `next.config.ts`
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `e2e/atlas.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Consumes: the prop-free static root from Task 1 and existing `npm run build`/Playwright commands.
- Produces: `out/index.html`, non-empty `out/_next/static`, `npm run verify:static`, and an optional `PLAYWRIGHT_BASE_URL` input for running the committed browser suite against Azure.

- [ ] **Step 1: Add the artifact verifier before enabling export**

Create `scripts/verify-static-export.ts`:

```ts
import { constants } from "node:fs";
import { access, readdir } from "node:fs/promises";

async function requireReadablePath(path: string): Promise<void> {
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(`Static export is missing required path: ${path}`);
  }
}

await requireReadablePath("out/index.html");
await requireReadablePath("out/_next/static");

const staticEntries = await readdir("out/_next/static");
if (staticEntries.length === 0) {
  throw new Error("Static export contains no Next.js static assets.");
}

console.log(
  `Static export verified: out/index.html and ${staticEntries.length} asset group(s).`,
);
```

Add the script to `package.json` and make it the final part of `check`:

```json
"verify:static": "tsx scripts/verify-static-export.ts",
"check": "npm run validate:data && npm run lint && npm run typecheck && npm test && npm run build && npm run verify:static"
```

- [ ] **Step 2: Remove stale artifacts and prove the verifier fails closed**

Resolve the exact generated directory before removing it:

```bash
pwd
test "$(pwd)" = "/Users/aserdargun/Documents/Codex/2026-08-11/referenced-chatgpt-conversation-this-is-an/.worktrees/agent-initial-atlas"
test ! -L out
rm -rf -- out
npm run verify:static
```

Expected: the final command exits non-zero with `Static export is missing required path: out/index.html`.

- [ ] **Step 3: Enable static export and keep generated content out of Git**

Update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  output: "export",
};

export default nextConfig;
```

Add this line to `.gitignore` next to `.next/`:

```gitignore
out/
```

- [ ] **Step 4: Build and verify the static artifact**

Run:

```bash
npm run build
npm run verify:static
test -f out/index.html
test -d out/_next/static
find out -type f | sed -n '1,40p'
```

Expected: Next reports a successful static build, the verifier exits 0, and the artifact listing includes `out/index.html` plus hashed files below `out/_next/static`.

- [ ] **Step 5: Add a browser regression for direct query hydration**

Append to `e2e/atlas.spec.ts`:

```ts
test("direct query URL restores filters, vendor order, and view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    "/?q=terminal+cli&category=coding-agents&left=openai&right=anthropic&view=vendors",
  );

  await expect(
    page.getByRole("searchbox", { name: /search capabilities/i }),
  ).toHaveValue("terminal cli");
  await expect(page.getByRole("combobox", { name: /left vendor/i })).toHaveValue(
    "openai",
  );
  await expect(page.getByRole("combobox", { name: /right vendor/i })).toHaveValue(
    "anthropic",
  );
  await expect(
    page.getByRole("heading", { name: /openai and anthropic vendor comparison/i }),
  ).toBeVisible();
  await expect(page).toHaveURL(
    /q=terminal\+cli&category=coding-agents&left=openai&right=anthropic&view=vendors/,
  );
});
```

- [ ] **Step 6: Allow Playwright to target a deployed URL without starting localhost**

Replace `playwright.config.ts` with:

```ts
import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const localBaseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: externalBaseURL ?? localBaseURL,
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1",
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
      },
});
```

- [ ] **Step 7: Run all local checks and browser tests**

Run:

```bash
npm run check
npm run test:e2e
git status --short
git diff --check
```

Expected: validation, lint, typecheck, all Vitest tests, static build, artifact verification, and all Playwright tests PASS; `out/` does not appear in `git status`.

- [ ] **Step 8: Commit the static artifact contract**

```bash
git add .gitignore e2e/atlas.spec.ts next.config.ts package.json playwright.config.ts scripts/verify-static-export.ts
git commit -m "feat: export the atlas as a static site"
```

---

### Task 3: Add the pinned `main` deployment workflow

**Files:**
- Create: `.github/workflows/deploy-azure-static-web-apps.yml`

**Interfaces:**
- Consumes: `npm ci`, `npm run validate:data`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:static`, and GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
- Produces: one production-only workflow that uploads `out/` using the Azure deployment token after every validation step succeeds.

- [ ] **Step 1: Prove no deployment workflow exists yet**

Run:

```bash
test ! -e .github/workflows/deploy-azure-static-web-apps.yml
gh api repos/aserdargun/ai-ecosystem-atlas/actions/workflows --jq '.total_count'
```

Expected: the file absence check exits 0 and GitHub reports `0` workflows before this implementation is pushed.

- [ ] **Step 2: Create the exact production workflow with immutable action SHAs**

Create `.github/workflows/deploy-azure-static-web-apps.yml`:

```yaml
name: Deploy AI Ecosystem Atlas to Azure

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ai-ecosystem-atlas-production
  cancel-in-progress: true

jobs:
  build-and-deploy:
    name: Validate, build, and deploy
    runs-on: ubuntu-latest
    timeout-minutes: 30
    env:
      CI: true
      NEXT_TELEMETRY_DISABLED: 1
    steps:
      - name: Check out repository
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4

      - name: Set up Node.js
        uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: 22
          cache: npm

      - name: Install locked dependencies
        run: npm ci

      - name: Validate canonical data
        run: npm run validate:data

      - name: Lint
        run: npm run lint

      - name: Type-check
        run: npm run typecheck

      - name: Run unit and component tests
        run: npm test

      - name: Build static export
        run: npm run build

      - name: Verify static export
        run: npm run verify:static

      - name: Deploy prebuilt artifact to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@1a947af9992250f3bc2e68ad0754c0b0c11566c9 # v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: upload
          app_location: out
          output_location: ""
          skip_app_build: true
          production_branch: main
```

Do not add `pull_request` triggers, PR close jobs, preview environments, APIs, `repo_token`, or secret echo/debug steps.

- [ ] **Step 3: Parse the YAML and inspect the security-sensitive inputs**

Run:

```bash
ruby -e 'require "yaml"; YAML.parse_file(".github/workflows/deploy-azure-static-web-apps.yml"); puts "workflow yaml valid"'
rg -n "permissions:|contents: read|azure_static_web_apps_api_token|app_location: out|output_location:|skip_app_build: true|production_branch: main" .github/workflows/deploy-azure-static-web-apps.yml
rg -n "pull_request|repo_token|echo.*AZURE|Standard|Dedicated" .github/workflows/deploy-azure-static-web-apps.yml && exit 1 || true
git diff --check
```

Expected: YAML parsing succeeds; all required least-privilege and prebuilt-artifact inputs are present; the forbidden-pattern scan prints nothing.

- [ ] **Step 4: Run the exact workflow checks locally before committing**

```bash
npm ci
npm run validate:data
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:static
```

Expected: every command exits 0.

- [ ] **Step 5: Commit continuous deployment configuration**

```bash
git add .github/workflows/deploy-azure-static-web-apps.yml
git commit -m "ci: deploy the static atlas to Azure"
```

---

### Task 4: Document production architecture and the safe update workflow

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: the static artifact and workflow contracts from Tasks 2 and 3.
- Produces: public contributor documentation that names the production URL, Azure resources, branch trigger, local release commands, secret boundary, and DNS ownership boundary without exposing generated credentials.

- [ ] **Step 1: Update the architecture language for a statically exported page**

Replace the README sentence that starts `The server page imports` with:

```markdown
The statically exported page imports and validates the repository-managed dataset once. Static page content is generated at build time, while one focused `ResearchConsole` client boundary owns search, filter controls, vendor selection, row disclosure, view switching, and URL synchronization. On first hydration that client boundary validates `window.location.search`; later interactions use the canonical serializer and client-side history replacement. Pure selector functions build immutable comparison rows and summaries, and the client does not fetch or mutate data.
```

Replace `server-rendered page shell` in the architecture diagram with `statically generated page shell`.

- [ ] **Step 2: Add an exact Deployment section after Local development**

Add:

```markdown
## Deployment

Production is published at [https://ai.aserdargun.com](https://ai.aserdargun.com) on Azure Static Web Apps Free.

The `main` branch is the production source. [`.github/workflows/deploy-azure-static-web-apps.yml`](.github/workflows/deploy-azure-static-web-apps.yml) installs locked dependencies, validates canonical data, runs lint, strict TypeScript checks, and unit/component tests, builds the static Next.js export, verifies `out/index.html` and Next.js assets, and only then uploads the prebuilt `out/` directory to Azure.

| Deployment setting | Value |
| --- | --- |
| Azure resource group | `rg-ai-ecosystem-atlas` |
| Azure Static Web App | `swa-ai-ecosystem-atlas` |
| Azure region | `West Europe` |
| Azure plan | `Free` |
| Production branch | `main` |
| Build output | `out/` |
| Custom hostname | `ai.aserdargun.com` |

The workflow reads the Azure deployment token only from the repository Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. The secret value must never be placed in source, documentation, issue text, build logs, or the client bundle.

IHS remains authoritative for `aserdargun.com`. The production mapping uses the Azure validation TXT record at `_dnsauth.ai.aserdargun.com` and an `ai.aserdargun.com` CNAME targeting the generated Azure Static Web Apps hostname. Apex, `www`, mail, nameserver, and unrelated DNS records are outside this application's deployment scope.

To publish an application or data update:

1. Make and review the canonical source change on a feature branch.
2. Run `npm run check` and `npm run test:e2e` locally.
3. Update `main` only after the checks pass.
4. Confirm the `Deploy AI Ecosystem Atlas to Azure` workflow succeeds.
5. Smoke-test the affected behavior at `https://ai.aserdargun.com`.

`npm run test:e2e` uses localhost by default. To run the same suite against production without starting a local server:

```bash
PLAYWRIGHT_BASE_URL=https://ai.aserdargun.com npm run test:e2e
```
```

- [ ] **Step 3: Update the repository tree and local command list**

Add `.github/workflows/deploy-azure-static-web-apps.yml` and `scripts/verify-static-export.ts` to the README repository tree. Add `npm run verify:static` immediately after `npm run build` in the individual release command block, and state that `npm run check` includes the static artifact verification.

- [ ] **Step 4: Review every deployment claim against the actual files**

Run:

```bash
rg -n "https://ai.aserdargun.com|rg-ai-ecosystem-atlas|swa-ai-ecosystem-atlas|AZURE_STATIC_WEB_APPS_API_TOKEN|npm run verify:static|PLAYWRIGHT_BASE_URL" README.md
test -f .github/workflows/deploy-azure-static-web-apps.yml
test -f scripts/verify-static-export.ts
npm run check
npm run test:e2e
git diff --check
```

Expected: every named item resolves to an implemented file or command and the complete local suite passes.

- [ ] **Step 5: Commit production documentation**

```bash
git add README.md
git commit -m "docs: document the Azure production deployment"
```

---

### Task 5: Create the Free Azure resources and transfer the deployment token securely

**Files:**
- External state only: Azure subscription and GitHub repository Actions secrets.

**Interfaces:**
- Consumes: authenticated Azure CLI subscription `b927b920-b1a7-40f4-b553-f23efa03850a`, authenticated GitHub CLI account `aserdargun`, and workflow secret name `AZURE_STATIC_WEB_APPS_API_TOKEN`.
- Produces: one Free Static Web App with a generated `*.azurestaticapps.net` hostname and one write-only GitHub Actions repository secret.

- [ ] **Step 1: Reconfirm identity, registration, supported region, and name availability**

Run read-only checks:

```bash
az account show --query '{name:name,id:id,tenantId:tenantId,user:user.name,state:state}' --output table
az provider show --namespace Microsoft.Web --query registrationState --output tsv
az provider show --namespace Microsoft.Web --query "resourceTypes[?resourceType=='staticSites'].locations | [0]" --output json
az group exists --name rg-ai-ecosystem-atlas
az staticwebapp list --query "[?name=='swa-ai-ecosystem-atlas'].{name:name,resourceGroup:resourceGroup,sku:sku.name,defaultHostname:defaultHostname}" --output json
gh auth status
gh repo view aserdargun/ai-ecosystem-atlas --json nameWithOwner,visibility,defaultBranchRef,url
```

Expected: the selected subscription is enabled, `Microsoft.Web` is `Registered`, `West Europe` is listed for `staticSites`, the resource group does not yet exist, no same-named Static Web App exists, GitHub is authenticated as `aserdargun`, the repository is public, and its default branch is `main`. If a same-named resource appears, stop and inspect it rather than creating a duplicate.

- [ ] **Step 2: Select the approved subscription and create the scoped resource group**

```bash
az account set --subscription b927b920-b1a7-40f4-b553-f23efa03850a
az group create \
  --name rg-ai-ecosystem-atlas \
  --location westeurope \
  --tags project=ai-ecosystem-atlas environment=production \
  --output table
```

Expected: one resource group named `rg-ai-ecosystem-atlas` reports `Succeeded` in `westeurope`.

- [ ] **Step 3: Create exactly one detached Free Static Web App**

Create the hosting resource without asking Azure CLI to commit an autogenerated workflow; the reviewed repository workflow will connect through the deployment token in Step 4:

```bash
az staticwebapp create \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --location westeurope \
  --sku Free \
  --tags project=ai-ecosystem-atlas environment=production \
  --output table
```

Verify:

```bash
az staticwebapp show \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --query '{name:name,resourceGroup:resourceGroup,location:location,sku:sku.name,defaultHostname:defaultHostname}' \
  --output table
az resource list \
  --resource-group rg-ai-ecosystem-atlas \
  --query '[].{name:name,type:type,sku:sku.name,location:location}' \
  --output table
```

Expected: the resource group contains exactly one `Microsoft.Web/staticSites` resource named `swa-ai-ecosystem-atlas`, SKU `Free`, with a non-empty Azure hostname. Stop if any paid or unrelated resource appears.

- [ ] **Step 4: Pipe the deployment token directly into the repository secret**

Use a pipe so the token is not assigned to a shell variable or printed:

```bash
az staticwebapp secrets list \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --query properties.apiKey \
  --output tsv \
  | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN \
      --repo aserdargun/ai-ecosystem-atlas \
      --app actions
```

Verify only metadata, never the value:

```bash
gh secret list --repo aserdargun/ai-ecosystem-atlas --app actions
```

Expected: `AZURE_STATIC_WEB_APPS_API_TOKEN` appears with an update timestamp; no token value appears in terminal output, a file, Git status, or shell history.

---

### Task 6: Publish reviewed commits to `main` and verify the Azure default hostname

**Files:**
- External state: Git remote branches, GitHub Actions run, deployed Azure content.

**Interfaces:**
- Consumes: the committed feature branch from Tasks 1–4, the Azure resource and Actions secret from Task 5, and `PLAYWRIGHT_BASE_URL` support from Task 2.
- Produces: remote `main` at the reviewed commit, one successful production workflow run, and a browser-verified Azure default hostname.

- [ ] **Step 1: Run the complete clean release suite**

```bash
npm ci
npm run validate:data
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:static
npm run test:e2e
git diff --check
git status --short --branch
```

Expected: all commands exit 0 and the worktree is clean. Do not update either remote branch if any check fails.

- [ ] **Step 2: Review the exact release range and confirm it fast-forwards `main`**

```bash
git fetch origin --prune
git merge-base --is-ancestor origin/main HEAD
git log --oneline --decorate origin/main..HEAD
git diff --stat origin/main...HEAD
git diff --name-status origin/main...HEAD
git status --short --branch
```

Expected: the ancestor command exits 0; the range contains only the approved Azure design/plan, static-export implementation, deployment workflow, and documentation commits; no generated `out/`, token, environment file, or unrelated file is present.

- [ ] **Step 3: Push the feature branch as a recoverable remote checkpoint**

```bash
git push origin HEAD:agent/initial-atlas
git ls-remote --heads origin agent/initial-atlas
```

Expected: the remote feature branch points at local `HEAD`.

- [ ] **Step 4: Fast-forward public `main` and trigger production deployment**

```bash
git push origin HEAD:main
git ls-remote --heads origin main
gh workflow view deploy-azure-static-web-apps.yml --repo aserdargun/ai-ecosystem-atlas
gh run list \
  --repo aserdargun/ai-ecosystem-atlas \
  --workflow deploy-azure-static-web-apps.yml \
  --branch main \
  --limit 3 \
  --json databaseId,headSha,status,conclusion,url
```

Expected: `main` points at the reviewed `HEAD`, GitHub recognizes the YAML, and a run for that exact SHA is queued or in progress.

- [ ] **Step 5: Wait for the exact workflow run and inspect failures before retrying**

```bash
atlas_run_id=$(gh run list \
  --repo aserdargun/ai-ecosystem-atlas \
  --workflow deploy-azure-static-web-apps.yml \
  --branch main \
  --limit 1 \
  --json databaseId \
  --jq '.[0].databaseId')
test -n "$atlas_run_id"
gh run watch "$atlas_run_id" \
  --repo aserdargun/ai-ecosystem-atlas \
  --exit-status
gh run view "$atlas_run_id" \
  --repo aserdargun/ai-ecosystem-atlas \
  --json headSha,status,conclusion,url,jobs
```

Expected: conclusion `success` for the released SHA. If it fails, use `gh run view "$atlas_run_id" --log-failed`, fix the evidenced cause on the feature branch, rerun the full release suite, commit, and repeat the fast-forward sequence; never bypass failed validation with a manual artifact upload.

- [ ] **Step 6: Verify the generated Azure hostname and query-state workflow**

```bash
atlas_default_hostname=$(az staticwebapp show \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --query defaultHostname \
  --output tsv)
test -n "$atlas_default_hostname"
curl --fail --silent --show-error --location \
  --output /dev/null \
  --write-out '%{http_code}\n' \
  "https://$atlas_default_hostname/"
PLAYWRIGHT_BASE_URL="https://$atlas_default_hostname" npm run test:e2e
```

Expected: curl prints `200` and all committed Playwright tests pass against the Azure-generated hostname, including direct query hydration, search, evidence expansion, vendor comparison, swap/reset behavior, responsive widths, keyboard focus, and overflow checks.

---

### Task 7: Validate and route `ai.aserdargun.com` through IHS DNS

**Files:**
- External state: Azure custom-domain resource and two records in the existing IHS `aserdargun.com` DNS zone.

**Interfaces:**
- Consumes: Azure default hostname from Task 6, Azure TXT validation token, authenticated IHS DNS panel, and public DNS resolvers.
- Produces: validated custom hostname `ai.aserdargun.com`, public TXT `_dnsauth.ai.aserdargun.com`, public CNAME `ai.aserdargun.com`, and Azure-managed TLS.

- [ ] **Step 1: Prove the two target names do not conflict with existing DNS**

Run read-only checks:

```bash
dig +short TXT _dnsauth.ai.aserdargun.com
dig +short CNAME ai.aserdargun.com
dig +short A ai.aserdargun.com
dig +short AAAA ai.aserdargun.com
dig +short NS aserdargun.com
dig +short MX aserdargun.com
```

Expected: `_dnsauth.ai` and `ai` return no pre-existing TXT/CNAME/A/AAAA record, while the zone's current nameserver and mail answers are recorded for the final unchanged-state check. If an `ai` or `_dnsauth.ai` answer already exists, stop and report its exact public value instead of overwriting it.

- [ ] **Step 2: Start Azure TXT-token validation and fetch the public token**

```bash
az staticwebapp hostname set \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --hostname ai.aserdargun.com \
  --validation-method dns-txt-token \
  --no-wait
az staticwebapp hostname show \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --hostname ai.aserdargun.com \
  --query '{hostname:name,status:status,validationToken:validationToken}' \
  --output table
```

Expected: Azure returns a non-empty `validationToken`. The token is not an account credential; it is intended to become the public TXT value, but it must still be copied only to the exact DNS record.

- [ ] **Step 3: Add only the TXT record in the authenticated IHS panel**

Use the `browser:control-in-app-browser` skill during execution. Open the IHS domain-management panel, select `aserdargun.com`, open DNS records, and prepare:

```text
Type: TXT
Host/name: _dnsauth.ai
Value: the exact validationToken returned by Azure in Step 2
TTL: provider default, or 300 seconds if IHS requires a number
```

If IHS displays the zone suffix separately, enter `_dnsauth.ai`; if its form requires a fully qualified name, enter `_dnsauth.ai.aserdargun.com`. Before saving, display the form's exact type, host, value, TTL, and zone. If the panel requires login or MFA, pause only for the user to complete that authentication; never inspect credentials or session data. Save one TXT record and take a post-save screenshot/list view showing that record.

- [ ] **Step 4: Wait for public TXT propagation and complete Azure validation**

Run:

```bash
dig +short TXT _dnsauth.ai.aserdargun.com
dig @1.1.1.1 +short TXT _dnsauth.ai.aserdargun.com
dig @8.8.8.8 +short TXT _dnsauth.ai.aserdargun.com
az staticwebapp hostname set \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --hostname ai.aserdargun.com \
  --validation-method dns-txt-token
az staticwebapp hostname show \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --hostname ai.aserdargun.com \
  --query '{hostname:name,status:status}' \
  --output table
```

Expected: all public resolvers return the Azure token and Azure accepts the hostname. If propagation is incomplete, leave the exact TXT record in place and retry after the provider TTL; do not add alternate validation records.

- [ ] **Step 5: Resolve and display the exact Azure CNAME target**

```bash
az staticwebapp show \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --query '{name:name,sku:sku.name,defaultHostname:defaultHostname}' \
  --output table
```

Expected: the target is the generated `*.azurestaticapps.net` hostname from Task 6, with no scheme, slash, path, port, or query string.

- [ ] **Step 6: Add only the `ai` CNAME in IHS**

In the same `aserdargun.com` DNS record view, prepare:

```text
Type: CNAME
Host/name: ai
Target/value: the exact Azure defaultHostname from Step 5
TTL: provider default, or 300 seconds if IHS requires a number
```

If IHS displays the zone suffix separately, enter `ai`; if it requires a fully qualified name, enter `ai.aserdargun.com`. Enter the target without `https://`. Before saving, display the exact type, host, target, TTL, and zone. Save one CNAME and take a post-save screenshot/list view showing both scoped records. Do not modify or delete the TXT record.

- [ ] **Step 7: Verify public routing and Azure-managed TLS**

Run:

```bash
dig +short CNAME ai.aserdargun.com
dig @1.1.1.1 +short CNAME ai.aserdargun.com
dig @8.8.8.8 +short CNAME ai.aserdargun.com
curl --fail --silent --show-error --location \
  --output /dev/null \
  --write-out '%{http_code} %{url_effective}\n' \
  https://ai.aserdargun.com/
openssl s_client \
  -connect ai.aserdargun.com:443 \
  -servername ai.aserdargun.com \
  </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
az staticwebapp hostname list \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --output table
```

Expected: the public CNAME resolves to the Azure hostname, curl reports HTTP `200` at the HTTPS custom URL, the certificate SAN contains `ai.aserdargun.com`, and Azure lists the custom hostname as ready. Certificate issuance may lag DNS; retain both correct records and retry rather than changing unrelated DNS.

---

### Task 8: Run final production QA and publish the verified project homepage

**Files:**
- External state: live custom hostname and GitHub repository metadata.

**Interfaces:**
- Consumes: live `https://ai.aserdargun.com`, the released Git SHA, the Azure resources, and recorded DNS preflight answers.
- Produces: final browser evidence, unchanged unrelated DNS, GitHub homepage metadata, and a deployment handoff with no exposed secret.

- [ ] **Step 1: Run the full browser suite against the custom hostname**

```bash
PLAYWRIGHT_BASE_URL=https://ai.aserdargun.com npm run test:e2e
```

Expected: all desktop, tablet, mobile, query-state, keyboard, evidence, vendor, and overflow tests pass against the custom hostname with no localhost server.

- [ ] **Step 2: Inspect production in a real browser at desktop and mobile widths**

Use the in-app browser to open:

```text
https://ai.aserdargun.com/
https://ai.aserdargun.com/?q=lifecycle+hooks
https://ai.aserdargun.com/?category=coding-agents
https://ai.aserdargun.com/?left=openai&right=anthropic
https://ai.aserdargun.com/?view=vendors
```

At 1440×900 and 390×844, verify the AI Ecosystem Atlas identity, 66-capability default count, search result, category result, vendor order, vendor view, evidence expansion, official HTTPS source, visible keyboard focus, table-only horizontal scrolling, and zero relevant console errors. Capture final desktop and mobile screenshots for handoff without committing them unless the user explicitly requests repository artifacts.

- [ ] **Step 3: Confirm cost, resource scope, remote SHA, workflow, and DNS boundaries**

```bash
az resource list \
  --resource-group rg-ai-ecosystem-atlas \
  --query '[].{name:name,type:type,sku:sku.name,location:location}' \
  --output table
az staticwebapp show \
  --name swa-ai-ecosystem-atlas \
  --resource-group rg-ai-ecosystem-atlas \
  --query '{name:name,sku:sku.name,defaultHostname:defaultHostname}' \
  --output table
gh run list \
  --repo aserdargun/ai-ecosystem-atlas \
  --workflow deploy-azure-static-web-apps.yml \
  --branch main \
  --limit 1 \
  --json headSha,status,conclusion,url
git rev-parse HEAD
git ls-remote --heads origin main
dig +short TXT _dnsauth.ai.aserdargun.com
dig +short CNAME ai.aserdargun.com
dig +short NS aserdargun.com
dig +short MX aserdargun.com
git status --short --branch
```

Expected: one Free Static Web App exists, the latest run succeeded for the exact local/remote `main` SHA, only the two scoped DNS answers were added, nameserver and mail answers match the preflight record, and the worktree is clean.

- [ ] **Step 4: Set the public GitHub repository homepage after production is healthy**

```bash
gh repo edit aserdargun/ai-ecosystem-atlas \
  --homepage https://ai.aserdargun.com
gh repo view aserdargun/ai-ecosystem-atlas \
  --json nameWithOwner,visibility,defaultBranchRef,homepageUrl,url
```

Expected: the repository remains public, default branch remains `main`, and `homepageUrl` is `https://ai.aserdargun.com`.

- [ ] **Step 5: Produce the final handoff without secret material**

The handoff must report:

```text
Production URL: https://ai.aserdargun.com
Azure default URL: the verified swa-ai-ecosystem-atlas defaultHostname
Azure resource group: rg-ai-ecosystem-atlas
Azure Static Web App: swa-ai-ecosystem-atlas
Azure SKU: Free
GitHub repository: https://github.com/aserdargun/ai-ecosystem-atlas
Production branch: main
Deployed commit: the exact verified main SHA
Workflow run: the exact successful GitHub Actions URL
DNS TXT: _dnsauth.ai.aserdargun.com present
DNS CNAME: ai.aserdargun.com targets the Azure default hostname
TLS: valid certificate containing ai.aserdargun.com
Checks: local suite, Azure-host suite, and custom-domain suite all passed
Cost boundary: no paid Azure resource was created; Azure Free-plan limits apply
```

Do not include the Azure deployment token, secret payloads, browser session data, cookies, or IHS credentials.

---

## Final acceptance checklist

- [ ] Static `out/` build succeeds and is ignored by Git.
- [ ] Client hydration restores validated query state without rewriting the incoming URL.
- [ ] Validation, lint, typecheck, Vitest, Playwright, build, and artifact verification pass.
- [ ] The pinned GitHub workflow deploys only after checks pass on `main`.
- [ ] Azure contains one `Free` Static Web App in the approved resource group and region.
- [ ] The Azure deployment token exists only as GitHub Actions secret metadata.
- [ ] The generated Azure hostname serves the exact released commit.
- [ ] IHS contains only the approved `_dnsauth.ai` TXT and `ai` CNAME additions.
- [ ] `https://ai.aserdargun.com` returns HTTP 200 with valid managed TLS.
- [ ] Desktop and mobile production smoke tests pass with zero relevant console errors.
- [ ] Apex, `www`, mail, nameserver, wildcard, and unrelated DNS records remain unchanged.
- [ ] GitHub remains public, `main` remains default, and the homepage points to production.
- [ ] Final handoff records URLs, resource scope, workflow run, SHA, verification, and Free-plan boundary without secrets.
