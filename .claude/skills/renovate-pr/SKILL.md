---
name: renovate-pr
description: 'Fix failing Renovate dependency-upgrade pull requests with minimal, evidence-based changes. Use for CI failures in Renovate PRs, dependency compatibility breaks, lockfile drift, peer mismatch, or tooling version issues.'
argument-hint: 'GitHub PR number or URL (preferred). Example: 12345'
user-invocable: true
---

# Fix Renovate Failures

## Outcome

Get a Renovate dependency-upgrade PR back to green CI with the smallest correct change and clear verification evidence.

## Inputs

- Primary input: PR number or PR URL.
- If no input is provided:
  1. Use GitHub MCP tools to find Renovate-authored PRs updated in last 14 days with failing checks.
  2. Prefer the PR whose head branch best matches the current branch.
  3. If multiple candidates remain, ask the user to choose one PR before continuing.

## User Prompting Rules

- If multiple failing Renovate PRs are found, present a short numbered list with:
  - PR number and title
  - Last update time
  - Failing check count or failed workflow names
- Ask a direct follow-up: "Which PR should I fix? Reply with the number."
- Do not continue with code changes until the user selects a single PR.

## Tooling Requirement

- Use GitHub MCP tools for all GitHub data retrieval and updates.
- Do not use raw git remote commands or manual browser scraping for PR/check metadata when MCP can provide it.

## MCP Tool Sequence

1. Resolve target PR:

- If input includes PR number, use it directly.
- If input includes PR URL, parse owner/repo/number.
- If input is missing, use `mcp_github_search_pull_requests` with a query scoped to Renovate PRs and recent updates.

2. Inspect failing checks:

- Use `mcp_github_get_copilot_job_status` when a Copilot job id/PR status context exists.
- Use PR/status-check tools available in the GitHub MCP toolset to identify failing workflows and jobs.

3. Review PR context and comments:

- Use GitHub MCP issue/PR read tools to inspect PR body, changed files summary, and existing discussion context.

4. Report or follow up on PR:

- If asked to post updates, use `mcp_github_add_issue_comment` on the PR number.

## Procedure

1. Inspect PR scope:

- Which dependencies changed
- Which lockfiles changed
- Which checks are failing

2. Read failing job logs end-to-end and identify the first real error (not cascading follow-ups).

3. Classify one primary failure type:

- installOrLockfile
- typeOrBuild
- tests
- lintOrFormat
- peerOrCompanionMismatch
- runtimeOrCompatibility

4. Reproduce with CI parity where feasible:

- Use `npm ci` over `npm install`
- Run the exact failing command from CI
- Match CI Node/tooling versions

5. Apply the smallest fix that addresses the root cause:

- Minimal compatibility code change for upgraded version
- Toolchain alignment (Node/version mismatch)
- Minimal lockfile regeneration per repo policy
- Narrow dependency constraint pin/override when justified
- Downgrade or revert specific upgraded dependency to last known good

6. Update Renovate config only if evidence shows it prevents recurrence:

- Keep changes narrowly scoped
- Prefer targeted `packageRules`

7. Verify:

- Re-run failing command(s) locally when possible
- Ensure lockfile + install behavior is consistent with CI policy

8. Summarize:

- Failing checks
- Root cause
- Fix and rationale
- Files changed
- Verification performed

## Decision Points

- If logs indicate flaky infra (timeouts, registry failures): re-run once before making code changes.
- If fix scope trends big (>10 files or >300 LOC) or cross-layer complex: stop and propose phased plan.
- If stuck after 2-3 attempts: stop and report attempts, best hypothesis, and next 1-2 actions.

## Quality Criteria

- Root cause is tied to concrete log evidence.
- Change scope is minimal and directly relevant.
- Verification targets the exact failing checks.
- No secrets or PII are exposed from CI logs.

## Dependency Patterns

- For ecosystem packages with peers/companions, align versions together when required.
- For missing peer/optional dependencies, add in the workspace package that directly depends on the parent package (not monorepo root unless root is the direct consumer).
