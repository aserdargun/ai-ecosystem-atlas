# AI Ecosystem Atlas — Azure Static Web Apps Deployment Design

**Status:** Written specification approved by the user on 2026-08-12

**Repository:** `aserdargun/ai-ecosystem-atlas`

**Application:** AI Ecosystem Atlas

**Production hostname:** `ai.aserdargun.com`

## 1. Purpose

Publish AI Ecosystem Atlas as a publicly accessible, automatically updated website on Azure Static Web Apps without introducing a paid application runtime, database, CMS, authentication system, or server mutation path. The site will use the existing public GitHub repository as its source of truth and the user's externally managed IHS DNS zone for `aserdargun.com`.

The deployment must preserve the current evidence-backed Research Console, shareable query-string state, source links, responsive comparison table, accessibility behavior, and repository-based content update workflow.

## 2. Chosen approach

Use a **static Next.js export deployed to Azure Static Web Apps Free**.

This is preferred over Azure's hybrid Next.js model because AI Ecosystem Atlas has no API routes, server actions, authentication, database, or other runtime requirement. It is preferred over Azure Storage Static Website plus CDN or Front Door because Static Web Apps provides a simpler GitHub deployment workflow, generated Azure hostname, custom-domain integration, and managed TLS certificate.

### Excluded approaches

- **Hybrid Next.js on Static Web Apps:** unnecessary preview/runtime complexity for a read-only application.
- **Azure App Service:** introduces an always-running application host that the product does not need.
- **Azure Storage Static Website plus Front Door/CDN:** adds more resources and certificate/routing configuration than the current scope requires.
- **Moving authoritative DNS to Azure DNS:** not required. IHS remains the DNS provider for `aserdargun.com`.

## 3. Azure resource design

Use the already authenticated Azure subscription with these fixed values:

| Setting | Value |
| --- | --- |
| Subscription | `Azure subscription 1` |
| Subscription ID | `b927b920-b1a7-40f4-b553-f23efa03850a` |
| Resource group | `rg-ai-ecosystem-atlas` |
| Resource-group region | `westeurope` |
| Static Web App name | `swa-ai-ecosystem-atlas` |
| Static Web Apps plan | `Free` |
| Source repository | `https://github.com/aserdargun/ai-ecosystem-atlas` |
| Deployment branch | `main` |
| App location | `/` |
| Output location | `out` |

No Standard, Dedicated, App Service, Front Door, CDN, database, storage account, Log Analytics workspace, or paid DNS resource will be created as part of this release.

If Azure rejects the selected Static Web Apps region, the nearest officially supported European Static Web Apps region may be used while the resource group remains in West Europe. Any such substitution must be reported before deployment continues.

## 4. Application changes for static export

### Next.js build output

Configure `next.config.ts` with `output: "export"` while preserving `agentRules: false`. A successful production build must generate the deployable `out/` directory.

The deployed site must not depend on `next start`, a Node.js server, managed functions, or an Azure API backend.

### Query-string state

The current server page reads `searchParams`. Static HTML export cannot generate a distinct server response for arbitrary query strings, so URL initialization will move to the focused `ResearchConsole` client boundary.

The server-rendered/static document will contain the default Anthropic/OpenAI Explorer state. After hydration, `ResearchConsole` will parse `window.location.search` once using the existing validated `parseUrlState` function and update its state without rewriting a valid incoming URL. Subsequent search, filter, vendor, swap, and view interactions will continue to use the existing canonical serializer and client-side history replacement.

This preserves links such as:

```text
https://ai.aserdargun.com/?q=lifecycle+hooks
https://ai.aserdargun.com/?category=coding-agents
https://ai.aserdargun.com/?left=openai&right=anthropic
https://ai.aserdargun.com/?view=vendors
```

Unknown or invalid query values will continue to fall back to defaults. Query strings remain capped by the existing 120-character search limit.

### Static-host configuration

Add only the Static Web Apps configuration required for the exported application. The current release has one path (`/`) and query-string state, so it does not need a broad client-side route fallback. If a configuration file is needed for headers or future routes, it must live in a location copied into `out/` and be verified in the built artifact.

## 5. Continuous deployment

Connect the Azure Static Web App to the public GitHub repository and the `main` branch. Azure's supported Static Web Apps GitHub Actions workflow will build and deploy the application.

The workflow must:

1. Check out the selected commit.
2. Install the locked npm dependencies.
3. Validate the canonical dataset.
4. Run lint and strict TypeScript checking.
5. Run unit and component tests.
6. Build the static export into `out/`.
7. Deploy only after all preceding checks pass.

Browser tests remain part of local/release verification. They do not need to run inside every Azure deployment if doing so would require downloading a browser on every content-only update; the committed e2e suite remains independently runnable with `npm run test:e2e`.

The Azure deployment token or other generated credential must be stored only as a GitHub Actions secret. It must never be printed, committed, copied into application code, or added to documentation.

Pull-request preview environments are not required for this initial deployment. The production environment tracks `main` only.

## 6. DNS and custom-domain design

IHS remains authoritative for `aserdargun.com`. Only records dedicated to the `ai` subdomain may be added or changed.

### Ownership validation

After the Static Web App exists, request custom-domain validation for `ai.aserdargun.com`. Use Azure's DNS TXT-token validation flow when offered.

The expected IHS validation record is:

| Type | Host/name in IHS | Value |
| --- | --- | --- |
| `TXT` | `_dnsauth.ai` | Azure-generated validation token |

Some IHS forms may expect the fully qualified host `_dnsauth.ai.aserdargun.com`; the saved DNS result must be checked publicly before Azure validation continues. Use the provider's default TTL or 300 seconds when a value is required.

### Traffic routing

After ownership is validated, add:

| Type | Host/name in IHS | Target |
| --- | --- | --- |
| `CNAME` | `ai` | Azure-generated `*.azurestaticapps.net` hostname, without `https://` |

Do not create an `A`, `AAAA`, `ALIAS`, `ANAME`, wildcard, URL-forwarding, or apex-domain record. Do not modify `@`, `www`, MX, SPF, DKIM, DMARC, mail, nameserver, or any unrelated DNS record.

### TLS

Azure Static Web Apps will provision and renew the managed certificate for `ai.aserdargun.com`. Completion requires `https://ai.aserdargun.com` to present a valid certificate for that hostname and HTTP traffic to reach the secure site.

The validation TXT record may remain unless Azure explicitly documents that it is no longer needed. Retaining it avoids an unnecessary destructive DNS action and can support later certificate/domain validation behavior.

## 7. Authentication and browser interaction

Azure resource creation should use the already authenticated Azure CLI session. GitHub operations should use the already authenticated `aserdargun` GitHub session.

IHS DNS management requires the user's authenticated IHS account in a browser. Existing browser authentication may be used, but passwords, session storage, cookies, recovery codes, and secrets must not be inspected or exposed. If the IHS panel requires authentication or multi-factor confirmation, the user will be asked to complete that step in the selected browser before automation continues.

Before saving DNS changes, resolve and display the exact record type, host, value, and affected zone. The change must be limited to `_dnsauth.ai` and `ai`.

## 8. Verification

### Before Azure deployment

- `npm ci`
- `npm run validate:data`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- Confirm `out/index.html` and required assets exist.
- Confirm no Node.js runtime or server function is required.

### Azure default hostname

- GitHub Actions deployment succeeds.
- The generated `*.azurestaticapps.net` URL returns HTTP 200.
- The page title and AI Ecosystem Atlas identity are correct.
- Search, category filtering, evidence expansion, vendor comparison, swap, and reset work.
- A query-string URL reload restores its intended state.
- No relevant browser-console errors or page-level horizontal overflow occur.

### DNS and custom domain

- Public DNS resolves `_dnsauth.ai.aserdargun.com` to the Azure token.
- Azure marks domain validation successful.
- Public DNS resolves `ai.aserdargun.com` through the Azure Static Web Apps hostname.
- `https://ai.aserdargun.com` returns HTTP 200 with a valid hostname certificate.
- The final custom hostname passes the same core desktop and mobile workflow smoke test.

### Repository and remote state

- Deployment configuration and application changes are committed to a feature branch.
- Checks pass before merging or updating `main`.
- The deployed GitHub commit is recorded in the handoff.
- The worktree contains no generated credentials, Azure tokens, deployment output, or unrelated DNS artifacts.

## 9. Failure handling and rollback

- If static export fails, stop before Azure resource creation and fix the application locally.
- If GitHub authorization fails, do not create alternate repositories or credentials; restore the intended `aserdargun/ai-ecosystem-atlas` connection.
- If Azure resource creation fails after the resource group is created, inspect the exact resource state before retrying. Do not create multiple similarly named paid resources.
- If TXT validation is pending, leave the correctly scoped TXT record in place and retry after DNS propagation; do not change unrelated DNS.
- If the CNAME causes a routing problem, remove or correct only the `ai` CNAME. The existing apex site and email configuration must remain untouched.
- If the latest deployment is defective, use GitHub history to restore the last verified application commit and rerun the production workflow.
- Deleting the Azure resource group, Static Web App, custom domain, GitHub secret, or DNS record is destructive and requires separate explicit authorization.

## 10. Cost boundary

The deployment is designed to remain within Azure Static Web Apps Free. Azure subscription state and resource SKU will be checked after creation. No budget or billing alert is required for the initial release because no paid resource is authorized, but the handoff must state that Azure Free-plan limits still apply and that a future SKU upgrade must be separately approved.

IHS domain registration and DNS hosting are existing user-owned services and are not changed beyond the two scoped DNS records.

## 11. Security and privacy

- The site remains public and read-only.
- No analytics, tracking pixel, authentication, cookies, form submission, or personal-data collection is introduced.
- No Azure/GitHub/IHS credential enters the client bundle or Git history.
- Official external links continue to use safe new-tab attributes.
- DNS changes are limited to the dedicated subdomain.
- GitHub Actions dependencies should use official actions and pinned major versions or immutable references consistent with Azure's supported generated workflow.

## 12. Definition of done

The Azure deployment is complete when:

1. The application builds as a static export and all existing validation, unit/component, browser, type, lint, and build checks pass.
2. Azure contains one Free Static Web App named `swa-ai-ecosystem-atlas` in `rg-ai-ecosystem-atlas`.
3. The application automatically deploys from `aserdargun/ai-ecosystem-atlas` `main` through GitHub Actions.
4. The Azure default hostname serves the verified application.
5. IHS publicly serves the exact `_dnsauth.ai` TXT and `ai` CNAME records required for the custom hostname.
6. Azure reports `ai.aserdargun.com` as a valid custom domain with managed TLS.
7. `https://ai.aserdargun.com` passes desktop and mobile smoke verification, including a query-string reload.
8. Existing `aserdargun.com` apex, web, mail, and unrelated DNS records remain unchanged.
9. The final repository contains no secrets or generated deployment output and documents the production URL and deployment workflow.
