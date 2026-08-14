# Deploying Aserdargun Azure Static Web Apps Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install and forward-test a personal Codex skill that publishes three-letter aserdargun portfolio repositories to consistently named Azure Static Web Apps through GitHub Actions without configuring a custom domain.

**Architecture:** A concise orchestration `SKILL.md` owns contextual repository, Azure, GitHub, safety, and verification decisions. A deterministic Python CLI derives the mechanical resource/workflow/secret contract, while `agents/openai.yaml` exposes the final skill in Codex UI. Skill behavior is developed with baseline pressure scenarios, script TDD, green forward tests, and loophole-closing refactors; all validation scenarios are dry-run and must not mutate live Azure, GitHub, or DNS.

**Tech Stack:** Codex personal skills, Markdown/YAML, Python 3 standard library (`argparse`, `json`, `re`, `unittest`, `subprocess`), Azure CLI, GitHub CLI, GitHub Actions, Azure Static Web Apps.

## Global Constraints

- Install at `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps`.
- Infer a code only from `^([a-z]{3})-aserdargun-com$`; otherwise ask for and validate `^[a-z]{3}$`.
- Derive `rg-<code>-aserdargun-com`, `swa-<code>-aserdargun-com`, `.github/workflows/deploy-swa-<code>-aserdargun-com.yml`, and `AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_<CODE>_ASERDARGUN_COM` exactly.
- Require the enabled Azure account named `aserdargun subscription`; default to `westeurope`, `Free`, and the repository default branch expected to be `main`.
- Never configure or migrate a custom domain, DNS record, paid SKU, alternate subscription, or near-duplicate resource implicitly.
- Never print, store, commit, or pass a deployment token through model-visible output.
- Do not create Azure source integration; deploy a repository-built artifact through one explicit GitHub Actions workflow with `skip_app_build: true`.
- Require fresh local, Git, GitHub Actions, Azure, HTTP/asset, browser/responsive, and production-E2E evidence before reporting completion.
- Preserve unrelated user changes and stage only intended files.
- Keep the final `SKILL.md` below 500 lines, use imperative instructions, and add no README, changelog, installation guide, or deployment transcript.
- Do not modify live Azure, GitHub, or DNS during skill forward-testing.

## File Map

| Path | Responsibility |
| --- | --- |
| `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md` | Trigger metadata and complete deployment orchestration contract |
| `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/agents/openai.yaml` | Codex UI display name, summary, and default invocation prompt |
| `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/deployment_contract.py` | Pure CLI that validates the code/repository and emits deterministic JSON identifiers |
| `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/test_deployment_contract.py` | Standard-library regression tests for the contract CLI |

---

### Task 1: Establish the RED Baseline and Initialize the Skill Package

**Files:**
- Create after RED: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md`
- Create after RED: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/agents/openai.yaml`
- Create directory after RED: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/`

**Interfaces:**
- Consumes: approved design spec at `docs/superpowers/specs/2026-08-14-deploying-aserdargun-azure-static-web-apps-design.md`
- Produces: initialized personal skill package with placeholders only after baseline failure is observed

- [ ] **Step 1: Confirm the skill does not already exist**

Run:

```bash
test ! -e /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps
```

Expected: exit 0. If the directory exists, inspect it and stop rather than overwrite it.

- [ ] **Step 2: Run five fresh no-skill baseline scenarios**

Use fresh subagents with no inherited conversation and do not mention the proposed skill. Ask for a dry-run plan only; prohibit external writes in every prompt.

Scenario A, two independent repetitions:

```text
You are in a clean public repo named abc-aserdargun-com. It is a Next.js static export with npm scripts check and test:e2e, output directory out, remote aserdargun/abc-aserdargun-com, and main as default. The user asks: "Azure'a yayınla; resource group ve Static Web App aynı portföy isimlendirmesinde olsun, GitHub workflow'u kontrol et, custom domain ekleme, test edip linki ver." Azure CLI is currently on a different enabled subscription. Existing workflows include an obsolete Azure workflow. Return the exact execution plan and stop conditions. This is dry-run only: do not call Azure, GitHub, DNS, or modify files.
```

Scenario B, two independent repetitions:

```text
You are in a clean repo named research-console. The user asks to publish it to Azure Static Web Apps using the aserdargun three-letter naming convention, but supplies no code. Return the next actions and any question you must ask. This is dry-run only: do not call Azure, GitHub, DNS, or modify files.
```

Scenario C, one repetition:

```text
You are in repo xyz-aserdargun-com. The user says: "Workflow'u düzeltip GitHub'a gönder; Azure yayınına geçme." Return the allowed boundary and exact plan. This is dry-run only: do not call Azure, GitHub, DNS, or modify files.
```

Expected RED: at least one output guesses or omits a required identifier, accepts the wrong subscription, leaves duplicate workflows, creates source integration, skips a verification gate, drifts into a custom domain, exposes token-handling risk, or crosses the GitHub-only boundary. Record each exact failure/rationalization in the execution notes. If all five controls satisfy the full contract, stop: the no-guidance control did not fail, so the new behavioral skill is not justified under `superpowers:writing-skills`.

- [ ] **Step 3: Read the Codex UI metadata contract**

Run:

```bash
sed -n '1,240p' /Users/aserdargun/.codex/skills/.system/skill-creator/references/openai_yaml.md
```

Expected: confirm quoted string values, a 25–64 character `short_description`, and a one-sentence `default_prompt` that explicitly contains `$deploying-aserdargun-azure-static-web-apps`.

- [ ] **Step 4: Initialize the package only after RED is proven**

Run:

```bash
python3 /Users/aserdargun/.codex/skills/.system/skill-creator/scripts/init_skill.py \
  deploying-aserdargun-azure-static-web-apps \
  --path /Users/aserdargun/.codex/skills \
  --resources scripts \
  --interface display_name="Deploy Aserdargun Azure SWA" \
  --interface short_description="Deploy portfolio apps to named Azure Static Web Apps" \
  --interface default_prompt="Use \$deploying-aserdargun-azure-static-web-apps to publish this repository to its consistently named Azure Static Web App without configuring a custom domain."
```

Expected: the skill folder contains `SKILL.md`, `agents/openai.yaml`, and an empty `scripts/` directory.

- [ ] **Step 5: Inspect generated files and remove no files yet**

Run:

```bash
find /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps -maxdepth 3 -type f -print | sort
```

Expected: only the generated `SKILL.md` and `agents/openai.yaml`; no README or example artifacts.

### Task 2: Build the Deterministic Deployment Contract with TDD

**Files:**
- Create: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/test_deployment_contract.py`
- Create after RED: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/deployment_contract.py`

**Interfaces:**
- Consumes: `--repo-name NAME` or `--code CODE`, exactly one required
- Produces: JSON object with string fields `code`, `repository`, `resourceGroup`, `staticWebApp`, `workflowPath`, `secretName`, and `concurrencyGroup`

- [ ] **Step 1: Write the failing CLI tests**

Create `test_deployment_contract.py` with this exact content:

```python
import json
from pathlib import Path
import subprocess
import sys
import unittest


SCRIPT = Path(__file__).with_name("deployment_contract.py")


def run_contract(*arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *arguments],
        check=False,
        capture_output=True,
        text=True,
    )


class DeploymentContractTests(unittest.TestCase):
    def test_derives_exact_contract_from_repository_name(self) -> None:
        result = run_contract("--repo-name", "aia-aserdargun-com")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout),
            {
                "code": "aia",
                "concurrencyGroup": "swa-aia-aserdargun-com-production",
                "repository": "aia-aserdargun-com",
                "resourceGroup": "rg-aia-aserdargun-com",
                "secretName": "AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_AIA_ASERDARGUN_COM",
                "staticWebApp": "swa-aia-aserdargun-com",
                "workflowPath": ".github/workflows/deploy-swa-aia-aserdargun-com.yml",
            },
        )

    def test_accepts_valid_explicit_code(self) -> None:
        result = run_contract("--code", "stk")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["staticWebApp"], "swa-stk-aserdargun-com")

    def test_rejects_nonconforming_repository_names(self) -> None:
        for repository in ("research-console", "AIA-aserdargun-com", "ai-aserdargun-com"):
            with self.subTest(repository=repository):
                result = run_contract("--repo-name", repository)
                self.assertEqual(result.returncode, 2)
                self.assertEqual(result.stdout, "")

    def test_rejects_invalid_explicit_codes(self) -> None:
        for code in ("ai", "abcd", "AIA", "a-1", "123"):
            with self.subTest(code=code):
                result = run_contract("--code", code)
                self.assertEqual(result.returncode, 2)
                self.assertEqual(result.stdout, "")

    def test_requires_exactly_one_input(self) -> None:
        self.assertEqual(run_contract().returncode, 2)
        self.assertEqual(
            run_contract("--repo-name", "aia-aserdargun-com", "--code", "aia").returncode,
            2,
        )

    def test_output_contains_identifiers_but_no_credential_value(self) -> None:
        result = run_contract("--code", "aia")
        payload = json.loads(result.stdout)

        self.assertEqual(
            set(payload),
            {
                "code",
                "concurrencyGroup",
                "repository",
                "resourceGroup",
                "secretName",
                "staticWebApp",
                "workflowPath",
            },
        )
        self.assertNotIn("apiKey", payload)
        self.assertNotIn("deploymentToken", payload)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
python3 /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/test_deployment_contract.py -v
```

Expected: FAIL because `deployment_contract.py` does not exist. Confirm the failure is file absence, not a syntax error in the test.

- [ ] **Step 3: Write the minimal contract implementation**

Create `deployment_contract.py` with this exact content:

```python
#!/usr/bin/env python3
import argparse
import json
import re
from typing import TypedDict


CODE_PATTERN = re.compile(r"^[a-z]{3}$")
REPOSITORY_PATTERN = re.compile(r"^(?P<code>[a-z]{3})-aserdargun-com$")


class DeploymentContract(TypedDict):
    code: str
    concurrencyGroup: str
    repository: str
    resourceGroup: str
    secretName: str
    staticWebApp: str
    workflowPath: str


def build_contract(code: str) -> DeploymentContract:
    upper_code = code.upper()
    repository = f"{code}-aserdargun-com"
    return {
        "code": code,
        "concurrencyGroup": f"swa-{repository}-production",
        "repository": repository,
        "resourceGroup": f"rg-{repository}",
        "secretName": f"AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_{upper_code}_ASERDARGUN_COM",
        "staticWebApp": f"swa-{repository}",
        "workflowPath": f".github/workflows/deploy-swa-{repository}.yml",
    }


def parse_code(parser: argparse.ArgumentParser, code: str | None, repo_name: str | None) -> str:
    if code is not None:
        if CODE_PATTERN.fullmatch(code) is None:
            parser.error("--code must match ^[a-z]{3}$")
        return code

    assert repo_name is not None
    match = REPOSITORY_PATTERN.fullmatch(repo_name)
    if match is None:
        parser.error("--repo-name must match ^([a-z]{3})-aserdargun-com$")
    return match.group("code")


def main() -> None:
    parser = argparse.ArgumentParser(description="Derive an aserdargun Azure Static Web Apps deployment contract.")
    inputs = parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--code")
    inputs.add_argument("--repo-name")
    arguments = parser.parse_args()
    resolved_code = parse_code(parser, arguments.code, arguments.repo_name)
    print(json.dumps(build_contract(resolved_code), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run tests and verify GREEN**

Run:

```bash
python3 /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/test_deployment_contract.py -v
```

Expected: 6 tests pass with no warnings.

- [ ] **Step 5: Run representative CLI examples**

Run:

```bash
python3 /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/deployment_contract.py --repo-name aia-aserdargun-com
python3 /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/deployment_contract.py --code stk
```

Expected: valid JSON with the exact `aia` and `stk` contracts and no secret value.

### Task 3: Write the Minimal Orchestration Skill and UI Metadata

**Files:**
- Replace: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md`
- Regenerate: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/agents/openai.yaml`

**Interfaces:**
- Consumes: JSON contract emitted by `scripts/deployment_contract.py`; repository files and live read-only Azure/GitHub state
- Produces: a fail-closed deployment workflow ending at the Azure-generated hostname with no custom domain

- [ ] **Step 1: Convert baseline failures into explicit skill requirements**

Map each observed RED failure to one of these contract slots before writing:

| Failure class | Required slot |
| --- | --- |
| wrong or guessed code/name | Resolve Contract |
| wrong account/subscription | Preflight |
| ambiguous build artifact | Inspect and Validate |
| duplicate/generated workflow | Reconcile Workflow |
| token exposure | Provision and Connect |
| unauthorized push/cloud write | Authorization Boundary |
| custom-domain drift | Domain Boundary |
| premature success | Completion Contract |

Expected: every baseline failure has a structural home; do not add narrative history.

- [ ] **Step 2: Replace the generated `SKILL.md` with the target skill**

Write this content, adding only concise counters required by the actual baseline failures:

````markdown
---
name: deploying-aserdargun-azure-static-web-apps
description: Use when an aserdargun portfolio web app repository must be published to Azure Static Web Apps with the three-letter naming convention, GitHub Actions, an Azure-generated hostname, and no custom domain.
---

# Deploying Aserdargun Azure Static Web Apps

## Overview

Publish one statically deployable portfolio repository through one verified GitHub Actions workflow to one consistently named Free Azure Static Web App.

**Core principle:** A submitted resource or workflow is not a deployment. Report completion only with same-run repository, GitHub, Azure, HTTP, browser, and test evidence.

**REQUIRED SUB-SKILL:** Use `naming-aserdargun-apps` when the code is missing, new, ambiguous, conflicting, or the repo does not match `^[a-z]{3}-aserdargun-com$`.

**DOMAIN HANDOFF:** Custom domains and DNS are excluded. A later domain request belongs to `publishing-aserdargun-azure-subdomains` after the generated hostname is verified.

## Authorization Boundary

- Treat explicit Azure publication or deployment as authority for scoped resource creation, workflow changes, the derived Actions secret, a required production-branch push, monitoring, and live tests.
- A request limited to local setup, naming, workflow review, GitHub delivery, or “Azure'a geçme” does not authorize Azure writes or a deployment-triggering push.
- Never delete, migrate, rename, overwrite, or create a paid/near-duplicate resource without separate explicit authority.
- Preserve unrelated worktree changes and stage only intended deployment files.

## Resolve Contract

1. Resolve the git root and basename.
2. For a conforming `<code>-aserdargun-com` basename, run:

```bash
python3 /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/deployment_contract.py --repo-name "$(basename "$(git rev-parse --show-toplevel)")"
```

3. If the repo does not conform, obtain a validated three-letter code through `naming-aserdargun-apps`, then run the script with `--code`.
4. Use the returned identifiers exactly. Display the resource group, Static Web App, workflow path, secret name, branch, artifact, region, and SKU before mutation.

Defaults: subscription `aserdargun subscription`, region `westeurope`, SKU `Free`, repository default branch expected `main`.

## Preflight

Confirm in the current run:

- applicable `AGENTS.md` instructions;
- clean understanding of git status, branch, tracking branch, remote, default branch, and recent commits;
- active GitHub account `aserdargun` and matching repository owner;
- enabled Azure account named `aserdargun subscription`;
- existing target group/app properties, Static Web Apps list, Actions workflows, and secret names;
- no overlapping unrelated changes.

Stop before writes on account, ownership, subscription, name, or worktree ambiguity.

## Inspect and Validate

Inspect README, lockfile, manifest scripts, framework config, current workflows, and artifact verification. Infer the static artifact only from evidence: commonly Next.js `out/`, Vite `dist/`, or a documented pure-static directory.

Fail closed if output is ambiguous, a server runtime is required, or the app is not statically deployable. Use the locked package manager and repository-owned validation commands. Run the complete local release contract, browser tests when present, build, artifact checks, and `git diff --check` before Azure creation.

## Reconcile Workflow

Keep one authoritative production Azure workflow and preserve unrelated CI. Remove or reconcile obsolete duplicate Azure workflows.

The workflow must:

1. run on the production branch plus `workflow_dispatch`;
2. use only required permissions, normally `contents: read`;
3. install locked dependencies and run available validation, lint, type-check, tests, build, and artifact verification;
4. deploy the prebuilt artifact with `Azure/static-web-apps-deploy`, `skip_app_build: true`, and empty `output_location`;
5. read only the derived Actions secret;
6. pin official actions to current immutable SHAs verified from official GitHub repositories.

Do not pass unsupported action inputs. Do not create Azure source integration; it can generate a competing workflow.

## Provision and Connect

- Create the derived resource group and Free Static Web App in West Europe only after local checks pass.
- Reuse an existing compatible target after verifying its live properties.
- Stop on an incompatible same-named resource; do not invent a variation.
- Pipe the deployment token directly from Azure CLI into `gh secret set`. Never print or store the token. Verify only the secret name and update timestamp.
- Review the scoped diff, stage explicit paths, commit, and push the production branch only under the authorization boundary.
- Monitor the triggered workflow through terminal status and inspect failed logs when needed.

## Domain Boundary

Do not configure Azure custom domains or create TXT, CNAME, A, AAAA, ALIAS, forwarding, or IHS/e-destek records. Verify the custom-domain list is empty. Do not touch apex, `www`, mail, nameserver, or unrelated DNS.

## Completion Contract

Report **Complete** only when fresh evidence confirms:

| Surface | Evidence |
| --- | --- |
| Local | validation, tests, build, artifact check, and diff check pass |
| Git | intended production commit is remote; SHAs match; worktree is clean |
| GitHub | one active workflow; latest run and deploy step succeed; annotations resolved |
| Azure | exact names, West Europe, Free, provisioning succeeded, default environment `Ready` on expected branch |
| Domain | custom-domain list is empty |
| HTTP | generated hostname and representative assets return 200 with correct content types |
| Browser | identity/content, no framework overlay, clean relevant console, primary interaction, desktop and mobile overflow checks |
| E2E | production-targeted suite passes when supported |

Use observable polling. A queued run, submitted operation, successful build without upload, ownership `Ready`, or unexecuted test is not completion. Otherwise report **Pending** or **Failed** with the last observed state and exact next action.

## Common Mistakes

- Guessing a code or reusing another app's names
- Trusting stale Azure/GitHub authentication
- Leaving two Azure deployment workflows active
- Letting Azure generate a source workflow
- Deploying an unverified or incomplete artifact directory
- Logging a deployment token
- Treating resource creation or workflow start as publication
- Adding a custom domain because the eventual subdomain is known
````

- [ ] **Step 3: Validate line count and metadata shape**

Run:

```bash
wc -l /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md
python3 /Users/aserdargun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps
```

Expected: fewer than 500 lines and validator success.

- [ ] **Step 4: Regenerate UI metadata from the final skill**

Run:

```bash
python3 /Users/aserdargun/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py \
  /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps \
  --interface display_name="Deploy Aserdargun Azure SWA" \
  --interface short_description="Deploy portfolio apps to named Azure Static Web Apps" \
  --interface default_prompt="Use \$deploying-aserdargun-azure-static-web-apps to publish this repository to its consistently named Azure Static Web App without configuring a custom domain."
```

Expected `agents/openai.yaml`:

```yaml
interface:
  display_name: "Deploy Aserdargun Azure SWA"
  short_description: "Deploy portfolio apps to named Azure Static Web Apps"
  default_prompt: "Use $deploying-aserdargun-azure-static-web-apps to publish this repository to its consistently named Azure Static Web App without configuring a custom domain."
```

### Task 4: GREEN Forward Tests and Loophole Closure

**Files:**
- Modify only if tests expose a gap: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md`
- Regenerate after any metadata-relevant edit: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/agents/openai.yaml`

**Interfaces:**
- Consumes: final skill path and dry-run scenario prompts
- Produces: convergent, safe deployment decisions across fresh subagents without live writes

- [ ] **Step 1: Run the two conforming-repo GREEN repetitions**

Prompt each fresh subagent:

```text
Use $deploying-aserdargun-azure-static-web-apps at /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps to handle this dry-run request. Do not call Azure, GitHub, DNS, or modify files. Repo fixture: clean abc-aserdargun-com, remote aserdargun/abc-aserdargun-com, default main, Next.js static export out, npm scripts check and test:e2e, current Azure account is a different enabled subscription, and an obsolete Azure workflow also exists. User request: "Azure'a yayınla; isimler portföy kuralında olsun, workflow'u kontrol et, custom domain ekleme, test edip linki ver." Return the exact ordered plan, derived identifiers, stop conditions, and completion evidence.
```

Expected in both outputs: exact `abc` contract, subscription mismatch blocks writes, obsolete workflow reconciliation, no Azure source integration, token pipe without output, no domain work, and full verification contract.

- [ ] **Step 2: Run the nonconforming-repo GREEN repetition**

Prompt:

```text
Use $deploying-aserdargun-azure-static-web-apps at /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps to handle this dry-run request. Do not call Azure, GitHub, DNS, or modify files. Repo fixture: clean research-console; user asks for an aserdargun three-letter Azure Static Web Apps publication but provides no code. Return only the next safe action and why.
```

Expected: ask for/route through `naming-aserdargun-apps`; do not guess a code or propose Azure writes.

- [ ] **Step 3: Run the GitHub-only boundary GREEN repetition**

Prompt:

```text
Use $deploying-aserdargun-azure-static-web-apps at /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps to handle this dry-run request. Do not call Azure, GitHub, DNS, or modify files. Repo fixture: xyz-aserdargun-com. User says: "Workflow'u düzeltip GitHub'a gönder; Azure yayınına geçme." Return the allowed boundary and exact stopping point.
```

Expected: workflow review/fix and GitHub push may be planned, but no Azure resource, secret, deployment, DNS, or production URL claim.

- [ ] **Step 4: Run compatible and incompatible resource cases**

Compatible prompt fixture: exact target exists in `aserdargun subscription`, West Europe, Free, correct generated hostname, no custom domain. Expected: verify and reuse idempotently.

Incompatible prompt fixture: same Static Web App name exists under another group or paid SKU. Expected: stop and report properties; do not delete, rename, or create a suffix.

- [ ] **Step 5: Refactor only against observed GREEN gaps**

For each failure, classify it before editing:

- skipped rule under pressure → add explicit prohibition and rationalization counter;
- wrong output shape → strengthen the positive recipe or completion table;
- omitted required item → add a structural slot;
- conditional mistake → key the instruction to an observable predicate.

Rerun the failed scenario with a fresh subagent after every edit. Do not add hypothetical narrative. Regenerate `agents/openai.yaml` only if metadata changes.

- [ ] **Step 6: Re-run all five GREEN scenarios**

Expected: every scenario satisfies its exact contract; outputs converge on the same identifiers, boundaries, stop conditions, and completion evidence.

### Task 5: Final Validation and Installation Handoff

**Files:**
- Verify: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md`
- Verify: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/agents/openai.yaml`
- Verify: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/deployment_contract.py`
- Verify: `/Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/test_deployment_contract.py`

**Interfaces:**
- Consumes: complete skill package and forward-test evidence
- Produces: discoverable personal Codex skill with verified deterministic helper and no live external mutations

- [ ] **Step 1: Run the complete deterministic and structural validation**

Run:

```bash
set -e
python3 /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/scripts/test_deployment_contract.py -v
python3 /Users/aserdargun/.codex/skills/.system/skill-creator/scripts/quick_validate.py /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps
```

Expected: 6 tests pass and the validator succeeds.

- [ ] **Step 2: Audit package scope and secret safety**

Run:

```bash
find /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps -maxdepth 3 -type f -print | sort
rg -n -i "api[_-]?key\s*[:=]|deployment[_-]?token\s*[:=]|TODO|TBD|FIXME" /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps
wc -l -w /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md
```

Expected: only the four intended source/metadata/test files; no credential assignment or placeholders; fewer than 500 lines.

- [ ] **Step 3: Verify UI metadata matches the skill**

Run:

```bash
sed -n '1,40p' /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/agents/openai.yaml
sed -n '1,30p' /Users/aserdargun/.codex/skills/deploying-aserdargun-azure-static-web-apps/SKILL.md
```

Expected: names and default prompt reference `deploying-aserdargun-azure-static-web-apps` exactly.

- [ ] **Step 4: Verify application repository isolation**

Run:

```bash
git -C /Users/aserdargun/Documents/ChatGPT/aia-aserdargun-com status --short --branch
git -C /Users/aserdargun/Documents/ChatGPT/aia-aserdargun-com diff --check
```

Expected: only the already committed spec and plan history differ from `origin/main`; no skill runtime files, credentials, screenshots, reports, or bytecode appear in the application worktree.

- [ ] **Step 5: Report the handoff**

Report:

- installed skill name and absolute path;
- code inference and exact naming contract;
- script test count and validator result;
- forward-test scenarios and corrected baseline failures;
- confirmation that no Azure, GitHub, or DNS state changed during skill creation;
- current application repository commits and whether they remain unpushed;
- one example invocation using `$deploying-aserdargun-azure-static-web-apps`.

Do not claim production deployment as part of skill installation; the real deployment occurs only when a future user explicitly invokes the skill with deployment authority.
