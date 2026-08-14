# Deploying Aserdargun Azure Static Web Apps — Skill Design

**Status:** Approved by the user on 2026-08-14

**Installation target:** `~/.codex/skills/deploying-aserdargun-azure-static-web-apps`

**Related skill:** `publishing-aserdargun-azure-subdomains` remains the separate custom-domain and DNS workflow.

## 1. Purpose

Create a reusable personal Codex skill that publishes a repository-backed portfolio web application to Azure Static Web Apps with deterministic aserdargun naming, GitHub Actions deployment, no custom domain, and evidence-based post-release verification.

The skill must reproduce the complete deployment outcome rather than narrate one historical deployment. It must adapt to the current repository's package manager, validation scripts, build output, existing workflows, remote, and live Azure/GitHub state.

## 2. Chosen approach

Use an **orchestrator skill plus a small deterministic contract script**.

- `SKILL.md` owns discovery, authorization boundaries, live-state checks, workflow decisions, Azure/GitHub sequencing, verification, and handoff.
- `scripts/deployment_contract.py` derives and validates the mechanical deployment identifiers from a three-letter code or conforming repository name.
- `agents/openai.yaml` exposes the installed skill in Codex UI.

This is preferred over a playbook-only skill because naming and secret identifiers should not be rewritten manually each time. It is preferred over a monolithic deployment script because repository inspection, workflow reconciliation, external authorization, and failure handling require contextual judgment and visible checkpoints.

## 3. Trigger and scope

The skill should trigger when the user asks to publish an aserdargun portfolio repository to Azure Static Web Apps, asks to create matching `rg-*` and `swa-*` resources, or requests the same GitHub-backed deployment workflow for another three-letter portfolio app.

The request must explicitly authorize deployment or equivalent cloud publication. A request limited to local setup, GitHub delivery, workflow review, naming, or planning does not authorize Azure writes or a push to `main`.

The skill covers:

- repository and authentication preflight;
- deterministic Azure, workflow, and secret naming;
- local validation and static artifact detection;
- workflow reconciliation;
- Azure resource creation or safe reuse;
- deployment-token transfer to GitHub Actions;
- scoped commit and push when deployment is explicitly requested;
- GitHub Actions monitoring;
- Azure, HTTP, asset, browser, and production E2E verification;
- final Azure-generated production URL reporting.

The skill does not configure DNS or a custom domain. If the user later requests `<code>.aserdargun.com`, route that separate request to `publishing-aserdargun-azure-subdomains` after the generated Azure hostname is verified.

## 4. Inputs and derived contract

### Application code

Infer the code from the current repository basename only when it matches:

```text
^([a-z]{3})-aserdargun-com$
```

If the basename does not conform, ask the user for the three-letter code. Validate explicit input with `^[a-z]{3}$`. When the code is new, ambiguous, or conflicting, require `naming-aserdargun-apps`; never rename a repository implicitly.

### Deterministic names

For code `<code>`, derive:

| Purpose | Contract |
| --- | --- |
| Repository | `<code>-aserdargun-com` |
| Resource group | `rg-<code>-aserdargun-com` |
| Static Web App | `swa-<code>-aserdargun-com` |
| Workflow | `.github/workflows/deploy-swa-<code>-aserdargun-com.yml` |
| Actions secret | `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_<CODE>_ASERDARGUN_COM` |
| Concurrency group | `swa-<code>-aserdargun-com-production` |

The contract script accepts either `--repo-name` or `--code`, fails closed on invalid input, and emits JSON without credentials.

### Fixed defaults

| Setting | Default |
| --- | --- |
| Azure subscription | `aserdargun subscription` |
| Region | `westeurope` / West Europe |
| Static Web Apps plan | `Free` |
| Production branch | repository default branch, expected `main` |
| Custom domains | none |

Any user-requested change to subscription, region, SKU, branch, or domain is a visible scope change. Do not silently substitute a paid SKU or another subscription.

## 5. Repository and build discovery

Before writes, inspect applicable `AGENTS.md`, git status, branch, tracking branch, remote, default branch, workflows, README, lockfiles, manifest scripts, framework configuration, and generated artifact rules.

Select the static artifact only from repository evidence:

- Next.js static export: typically `out/`;
- Vite or comparable static bundler: typically `dist/`;
- pure static repository: repository root or a documented static directory.

Fail closed when the artifact path is ambiguous, a server runtime is required, or the existing application is not statically deployable. Do not hide incompatibility with an Oryx guess.

Use the locked package manager and repository-owned validation scripts. Run the complete local release contract, including browser tests when present, before Azure resource creation. Confirm the final artifact contains the main HTML and required assets.

## 6. Workflow design

Deploy a prebuilt artifact with `Azure/static-web-apps-deploy` and `skip_app_build: true`. The workflow must:

1. run on pushes to the production branch and support `workflow_dispatch`;
2. grant only `contents: read` unless repository evidence proves another permission is required;
3. install locked dependencies;
4. run available data validation, lint, type-check, unit/component tests, build, and artifact verification;
5. deploy only after all checks pass;
6. read the deployment token only from the derived Actions secret;
7. use an app location that points to the already-built artifact and an empty output location;
8. use official actions pinned to current immutable commit SHAs verified from the official GitHub repositories.

Inspect all existing workflows before editing. Reconcile or rename the single production workflow instead of leaving duplicate Azure workflows. Preserve unrelated CI. Remove unsupported inputs such as an action parameter rejected by the pinned action.

Create the Static Web App without source integration so Azure does not generate a competing workflow. GitHub Actions remains the explicit deployment path.

## 7. Azure and GitHub execution

### Preflight gates

Confirm in the same run:

- active GitHub account is `aserdargun` and the remote repository matches it;
- selected Azure account is enabled and named `aserdargun subscription`;
- local branch and remote default branch are resolved;
- the worktree has no unrelated changes;
- target resource group, Static Web App, workflow, secret name, branch, artifact, region, and SKU are displayed before mutation.

### Resource behavior

- If neither resource exists, create the resource group and Free Static Web App with the derived names.
- If compatible resources already exist, verify and reuse them idempotently.
- If a same-named resource has incompatible subscription, group, SKU, hostname mapping, or ownership, stop and report the mismatch.
- Never delete, replace, rename, or migrate an existing resource as an implicit fix.

Retrieve the deployment token without printing it and pipe it directly into `gh secret set`. Verify only the secret name and update timestamp.

Stage only the intended workflow and documentation changes. Commit and push the production branch only when the user's request explicitly authorizes deployment. Monitor the resulting GitHub Actions run to terminal success or failure.

## 8. Custom-domain boundary

The deployment is complete on the Azure-generated `*.azurestaticapps.net` hostname.

- Do not open Azure custom-domain flows.
- Do not create TXT, CNAME, A, AAAA, ALIAS, forwarding, or IHS/e-destek records.
- Verify `az staticwebapp hostname list` returns no custom-domain entries.
- Do not alter apex, `www`, mail, nameserver, or unrelated DNS records.

## 9. Failure handling

- Authentication mismatch: stop before writes and identify the required account or subscription.
- Dirty worktree: preserve unrelated changes and request direction when they overlap the deployment files.
- Local validation failure: stop before Azure creation; diagnose only within the user's requested scope.
- Ambiguous artifact: ask for the deployment output rather than guessing.
- Duplicate workflow: identify the authoritative workflow and reconcile it before pushing.
- Resource conflict: report the live incompatible properties; do not create a near-duplicate name.
- Secret or deployment failure: inspect the failing Actions step and current resource state; never expose or paste the token.
- Submitted but nonterminal cloud state: report pending, not complete.
- Live test failure: keep the generated URL and failed evidence visible; do not claim successful publication.

## 10. Verification contract

Completion requires fresh evidence for every row:

| Surface | Required evidence |
| --- | --- |
| Local | validation, tests, build, artifact verification, and diff check pass |
| Git | intended commit is on the production branch; local and remote SHAs match; worktree is clean |
| GitHub | one active production workflow; latest run and deploy step succeed; no unresolved annotations |
| Azure resources | exact group/app names, West Europe, Free SKU, provisioning succeeded |
| Azure environment | default environment is `Ready`, expected source branch, recent update timestamp |
| Domain boundary | custom-domain list is empty |
| HTTP | generated hostname and representative assets return HTTP 200 with appropriate content types |
| Browser | correct URL/title, meaningful content, no framework overlay, clean relevant console, primary interaction works |
| Responsive | desktop and mobile checks show no page-level overflow or blocking layout regression |
| Production E2E | repository suite passes against the generated hostname when supported |

Use observable polling for GitHub and Azure state. A submitted operation, workflow queue entry, or successful build without the deploy step is not completion.

## 11. Skill package

```text
~/.codex/skills/deploying-aserdargun-azure-static-web-apps/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── scripts/
    ├── deployment_contract.py
    └── test_deployment_contract.py
```

Do not add a README, changelog, installation guide, or copied deployment transcript. Keep `SKILL.md` under 500 lines and use imperative instructions.

## 12. Testing strategy

### Script TDD

Write tests before the contract script for:

- valid repository inference (`aia-aserdargun-com`);
- valid explicit code;
- invalid length, uppercase, separators, and nonconforming repository names;
- exact resource, workflow, secret, and concurrency outputs;
- no credential fields in output.

### Skill RED-GREEN-REFACTOR

Before creating `SKILL.md`, forward-test a baseline deployment-planning prompt without the new skill and capture failures such as guessing the code, using old resource names, choosing the wrong subscription, creating source integration or duplicate workflows, printing the deployment token, skipping post-release checks, or drifting into custom-domain work.

After writing the minimal skill, repeat equivalent fresh-context scenarios with the installed skill. Include:

- a conforming Next.js static-export repository;
- a nonconforming repository requiring a code question;
- an existing compatible Azure resource reuse case;
- an incompatible resource conflict;
- a request that explicitly excludes custom domains;
- a request limited to GitHub that must not create Azure resources.

Forward tests must not modify live Azure, GitHub, or DNS. Give subagents read-only fixtures or hypothetical command outputs and require an execution plan or dry-run decision.

Run the system skill validator and verify `agents/openai.yaml` matches the final skill.

## 13. Definition of done

The skill is complete when:

1. the deterministic contract script passes its test-first coverage;
2. baseline skill scenarios exhibit the targeted failures;
3. the installed skill corrects those failures in fresh forward tests;
4. the skill package passes Codex `quick_validate.py`;
5. `agents/openai.yaml` is generated from the final skill metadata;
6. the personal skill is discoverable under `~/.codex/skills`;
7. no live cloud, GitHub, or DNS state is changed during skill validation;
8. the application repository remains free of skill runtime artifacts and credentials.
