# Contributing

Read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating. This guide covers reporting problems, setting up your checkout, and submitting changes.

## Questions And Reports

Use [GitHub Discussions](https://github.com/devlsh/astar/discussions) for questions and support, and [Issues](https://github.com/devlsh/astar/issues) for bugs and feature requests. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

Search open and closed issues before opening a new one. If you find a duplicate, add useful details there. Otherwise, describe the expected and actual behavior, steps to reproduce it, and relevant environment details. Distinguish what you observed from what you think caused it.

## Local Development

### Requirements

- [Nix](https://nix.dev/)
- [devenv](https://devenv.sh/)
- [direnv](https://direnv.net/) _(Optional)_

The Nix environment selects Node and pnpm major package families from locked inputs. It does not verify exact versions. [package.json](package.json) declares the exact required versions in `devEngines`; applicable pnpm commands reject mismatches.

### Workflow

1. Enter the cloned repo. If you're using `direnv`, allow the `.envrc` for the repository:

   ```sh
   direnv allow .
   ```

   To revoke approval, run `direnv deny .` and leave the directory to unload its environment. For manual activation, omit or disable your host shell's direnv hook and use the explicit devenv commands below. Those commands alone do not disable an existing hook.

2. Confirm the current [dependency policy](#dependency-changes), then install dependencies with the frozen lockfile. This also installs Git hooks:

   ```sh
   devenv tasks run astar:install
   ```

3. Before changing source, read the relevant implementation, tests, public usage examples, and package exports. Run static checks before requesting review:

   ```sh
   devenv --no-tui shell -- pnpm check
   ```

With an activated environment, use `pnpm <script>`. Without direnv, use `devenv shell -- pnpm <script>` from the repository root.

## Dependency Changes

Before installing or updating dependencies, confirm the current release-age policy and eligible versions. The manifest and workspace configuration declare no release-age threshold. If the policy owner or version eligibility is unclear, ask the maintainer to identify the applicable policy and confirm eligibility before proceeding. Wait for an eligible version or choose another. Do not bypass the policy or add exclusions.

The frozen install uses the existing lockfile; it does not select new dependency versions. When selecting or updating versions, include related manifest, lockfile, script, and configuration changes together.

## Checks

You can find available scripts in [package.json](package.json). `pnpm check` runs root typechecking, linting, and formatting checks. It does not run tests, demo typechecking, or builds. Use `pnpm build` when you need generated package output.

To fix lint and formatting findings, run `pnpm lint:fix`, then `pnpm fmt`. Inspect the diff and fix any remaining findings before rerunning checks.

Run `pnpm test` for the Vitest suite. For behavior changes, add or update tests at the public consumer seam and describe what you verified; static checks alone do not prove runtime behavior.

For demo changes, run these additional checks from the repository root:

```sh
pnpm demo typecheck
pnpm demo build
```

For demo behavior changes, run `pnpm demo dev` and inspect the affected controls, terrain and endpoint edits, search options, resizing, and cleanup in the browser. See the [demo guide](demo/README.md) for its controls. Library checks do not replace demo checks.

## Benchmarks

The native Vitest benchmark measures the minified package export, not transformed source. Build current source before each benchmark session:

```sh
pnpm build
```

Run either portfolio with the direct Vitest conveniences:

```sh
pnpm bench:quick
pnpm bench:full
```

Quick has 12 workloads and 48 prebuilt inputs. Full has 27 workloads and 108 prebuilt inputs. Each workload has four deterministic rotations. Benchmarks measure performance only and do not validate path correctness.

Domain files in `bench/fixtures/` declare grid factories and search options. The shared portfolio creates fresh grids and endpoint copies before it prepares the four rotations. Stable workload IDs identify reference files. A changed workload needs a new ID and a new comparison series.

Run the quick cases with an adjacent target:

```sh
pnpm bench:quick -t 'Adjacent target'
```

Run `pnpm test` for the existing library correctness tests. These tests use the source public export and need no build.

The initial settings are provisional minimum floors, not deadlines:

- Quick: 250 ms warmup, at least 16 warmup iterations, 250 ms measurement, and at least 32 measured iterations.
- Full: 250 ms warmup, at least 4 warmup iterations, 250 ms measurement, and at least 32 measured iterations.

The process targets are approximately 10 seconds and 60 seconds. Slow callbacks can exceed these targets to reach the iteration floors. Full uses fewer samples to reduce benchmark compute cost, with less statistical precision. These settings do not guarantee a total runtime or change any timeout. Do not reduce existing workloads or change production code to meet these targets.

Each native result measures a batch of four searches. Native `hz` counts batches per second. Native p99 describes a batch, not a single search. The four rotations are inputs, not independent statistical samples. Allocation and normal GC remain inside search timings.

Divide mean latency by four for mean latency per search. Multiply native `hz` by four for searches per second.

Capture a local reference only when you intend to create or replace it. Then display the native comparison:

```sh
pnpm bench:quick --mode capture
pnpm bench:quick --mode compare
```

Use `bench:full` instead of `bench:quick` for a full reference.

To compare against a separate checkout, first build and capture the reference in that checkout:

```sh
pnpm build
pnpm bench:quick --mode capture
pnpm bench:full --mode capture
```

Then enter your candidate worktree. Build its current source and compare against the reference checkout:

```sh
pnpm build
BENCH_BASELINE=/path/to/baseline/repo pnpm bench:quick --mode compare
BENCH_BASELINE=/path/to/baseline/repo pnpm bench:full --mode compare
```

When full sampling settings change, capture a fresh local full reference before comparison, even when workload IDs stay unchanged.

Native reference files do not record sampling settings, so comparison cannot detect this mismatch. Quick references need no replacement for a full-only sampling change. CI captures a fresh base reference with the head harness for each paired run.

Check warmup sensitivity with the same unchanged build:

```sh
pnpm bench:quick --mode double-warmup
```

This mode doubles warmup time without changing measurement floors or reference files.

Use `bench:full` for the full control. Repeat ordinary runs manually on a quiet host. Inspect sample counts and spread across fresh processes.

## Pull Requests

Search existing issues and PRs before proposing duplicate work. Keep your change focused and update affected callers, tests, [README examples](README.md#usage), and contributor instructions together.

Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md) and:

- Target `main`. Use Conventional Commit titles/descriptions for release-relevant changes.
- Explain the problem, rationale, scope, and alternatives. Link related issues or PRs.
- Describe API, documentation, and release impact, including breaking changes. Point reviewers to areas needing attention.
- List the checks you ran and their results, regression coverage, and reasons for omitted tests or blocked checks.
- For larger changes, open a draft once one working part passes its checks and describe the remaining work. Request final review after local and required CI checks pass and blocking findings are resolved; summarize how you addressed advisory findings.
- If you use AI, write concise descriptions in your own words and disclose how you reviewed the code and reached its decisions.

Release dispatch and publication are separate maintainer operations, not part of submitting a PR.
