# Contributing

Read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Questions And Reports

Use [GitHub Discussions](https://github.com/devlsh/astar/discussions) for questions and support, and [Issues](https://github.com/devlsh/astar/issues) for bugs and feature requests. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

Search open and closed issues first. Add details to an existing report, or open a new one with reproduction steps, expected and actual behavior, and environment details.

## Local Development

Install [Nix](https://nix.dev/) and [devenv](https://devenv.sh/), then clone the repository.

From the repository root, install dependencies with the frozen lockfile and set up Git hooks:

```sh
devenv tasks run astar:install
```

Enter the development shell before running the pnpm commands below:

```sh
devenv shell
```

If you use [direnv](https://direnv.net/), run `direnv allow .` instead of entering the shell manually.

## Dependency Changes

Ask the maintainer to approve dependency versions before adding or updating them. Include the manifest, lockfile, and any related script or configuration changes in the same PR.

## Checks

Run root typechecking, linting, and formatting checks:

```sh
pnpm check
```

`pnpm check` does not run tests, coverage, demo typechecking, or builds.

Apply automatic lint and formatting fixes when needed:

```sh
pnpm fix:all
```

Inspect the diff, fix remaining findings, and rerun `pnpm check` until it passes. For documentation changes, check local links and anchors too.

Run `pnpm test` for the Vitest suite, or `pnpm test:coverage` for coverage reports. For behavior changes, add or update tests at the public consumer seam and describe the results. Static checks alone do not prove runtime behavior.

Use `pnpm build` when you need generated package output.

For demo changes, run these additional checks from the repository root:

```sh
pnpm demo typecheck
pnpm demo build
```

For demo behavior changes, run `pnpm demo dev` and inspect the affected behavior in the browser. The [demo guide](demo/README.md) describes its controls. Library checks do not replace demo checks.

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
pnpm bench:quick --reporter=default -t 'Adjacent target'
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
pnpm bench:quick --mode compare --reporter=default
```

Use `bench:full` instead of `bench:quick` for a full reference.

When full sampling settings change, capture a fresh local full reference before comparison, even when workload IDs stay unchanged.

Native reference files do not record sampling settings, so comparison cannot detect this mismatch. Quick references need no replacement for a full-only sampling change. CI captures a fresh base reference with the head harness for each paired run.

Check warmup sensitivity with the same unchanged build:

```sh
pnpm bench:quick --mode double-warmup --reporter=default
```

This mode doubles warmup time without changing measurement floors or reference files.

Use `bench:full` for the full control. Repeat ordinary runs manually on a quiet host. Inspect sample counts and spread across fresh processes.

## Pull Requests

Search existing issues and PRs first. Keep changes focused, and update affected tests and usage examples.

- Open a PR against `main` using the [PR template](.github/PULL_REQUEST_TEMPLATE.md). Use a Conventional Commit title for release-relevant changes.
- Explain the change, link related issues, and call out breaking changes or areas that need review.
- List checks run and their results. Explain omitted tests or blocked checks.
- Use a draft for unfinished work. Request final review after local and required CI checks pass and blocking findings are resolved.
- If you use AI, write the description in your own words and explain how you reviewed its code and decisions.
