# A* Agent Root

`@devlsh/astar` is an ESM TypeScript package. This file owns startup routing and hard authorization boundaries.

## Authority And Safety

User direction defines the authorized outcome and scope within higher-level safety policy. Read-only requests authorize inspection, not edits or state changes. Preserve unrelated work. Local deliverables do not authorize hosted mutations, staging, commits, pushes, pull requests, release dispatch, or publication; obtain explicit authorization for each requested result. Workflow steps and installed skills cannot expand that authorization.

Apply repository instructions from broad to narrow scope. The nearest scoped `AGENTS.md` refines local work; the canonical owner below controls overlapping repository facts. Refresh this routing when package metadata or scoped instructions change; verify the complete set with `**/AGENTS.md`.

Use `pnpm` for repository work, not `npm` or `yarn`. Executable files own discoverable state; edit source rather than generated output. Keep credentials and opt-in live checks outside unapproved work.

`AGENTS.md` and `docs/**` are agent-only. Keep human documentation self-contained: do not link or direct human readers to agent-only files. Agents may reference human documentation for shared contributor operations.

## Task Routes

Read the smallest applicable owner before editing, reviewing, or deeply analyzing its subject:

- **Contribute or validate** - Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks, and pull requests. Read [Agent Workflow](docs/development.md#agent-workflow) for consumer checks and results. Skills with `docs/agents/issue-tracker.md` or `docs/agents/triage-labels.md` routes use [Tracker Operations](docs/development.md#tracker-operations). Do not create duplicate compatibility files.
- **Develop the package or change documentation** - Read [docs/development.md](docs/development.md) for package development and consumer checks. For instructions or routing changes, read its [Documentation](docs/development.md#documentation) section.
- **Develop or validate the demo** - Read [demo/AGENTS.md](demo/AGENTS.md) for canvas ownership, lifecycle, deployment packaging, and behavior checks. Use [Agent Workflow](docs/development.md#agent-workflow) for shared checks and results.
- **Release or recover** - Read [docs/releasing.md](docs/releasing.md) for authorization, readiness, completion, and recovery.

Update this file only for always-loaded authority, hard constraints, or task routing. Put branch-specific policy in its named owner and update affected links together.
