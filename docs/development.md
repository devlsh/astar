# Development

Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for setup, dependency changes, checks, and pull requests. For release or recovery work, read [Releasing](releasing.md).

Before editing, inspect [package.json](../package.json), the affected implementation and tests, and their configuration. Follow the patterns in nearby code and the configured lint and formatting rules.

## Documentation

When public behavior or scope changes, update affected usage examples in [README.md](../README.md) and the [demo guide](../demo/README.md). For instructions or routing changes, update affected links and descriptions together.

## Agent Workflow

Select checks from [CONTRIBUTING](../CONTRIBUTING.md#checks) and [package.json](../package.json) for every affected consumer. Include behavior checks for these cases:

- For pathfinding changes, exercise affected contracts through [src/index.ts](../src/index.ts) and [tests/search.test.ts](../tests/search.test.ts). Include grid validation, cardinal/diagonal movement, corner cutting, elevation limits, built-in/custom heuristics, illegal destinations, and null paths as affected.
- For demo changes, add the [scoped checks](../demo/AGENTS.md#checks). Library checks do not replace demo behavior and lifecycle checks.
- For benchmark changes, use [CONTRIBUTING benchmarks](../CONTRIBUTING.md#benchmarks). Build current source before benchmarks. Benchmarks do not validate path correctness.
- For entrypoint, output, or built consumer changes, run `pnpm build` and verify affected package imports, exports, and types.

Scope automatic fixes and formatting to the authorized files. Report changed files, check results, and omitted or blocked checks with their reasons.

### Tracker Operations

For tracker work, resolve the exact hosted repository and follow [Questions And Reports](../CONTRIBUTING.md#questions-and-reports). Check current hosted labels before applying them.

### Benchmark CI

The PR-only [benchmark.yml](../.github/workflows/benchmark.yml) owns permissions, toolchain setup, producer outputs, benchmark commands, result paths, and the paired head harness. Validation remains separate. The [capture action](../.github/actions/benchmark-capture/action.yml) owns fixed frozen installation, builds, and base `dist` transfer into the head harness. Only capture and comparison commands are customizable. It checks out the base into `benchmark-base`. Each revision uses its own frozen lockfile under the head-selected toolchain.

The head harness captures the event base and compares the event head on one runner. Capture uses the native default reporter. Comparison uses the native default and GitHub Actions reporters. The compare job shows the native table, failure annotations, and test summary. The capture action collects immediate JSON files from caller-selected paths into artifact directories `base` and `head`. Successful comparison produces an attempt-specific artifact with native results and measurement SHAs, one-day retention, and no measurement history.

[bench.config.ts](../bench.config.ts) resolves `BENCH_BASELINE` as a checkout root with `.vitest/benchmarks` beneath it. [CONTRIBUTING benchmarks](../CONTRIBUTING.md#benchmarks) owns local capture and comparison procedures. Reserve `.scratch/` for local development, never CI.

The benchmark job has read-only permissions. The report job has comment-write permission and supports same-repository PRs only. Fork PR reports are unsupported. Same-repository branch authors are trusted repository collaborators who control the workflow and reporter. The [report action](../.github/actions/benchmark-report/action.yml) downloads the exact producer artifact ID from the current run. It invokes [benchmark-report.mjs](../.github/scripts/benchmark-report.mjs) from the exact event head SHA without benchmark execution, dependency installation, or caches.

Reports require successful benchmarks and non-empty artifact/base/head outputs. Failed-report-only reruns skip the report when those outputs are missing. Output retention for that rerun mode is not guaranteed. A full rerun produces a fresh artifact ID.

The publisher requires non-empty native JSON sets with equal counts and the same safe workload IDs. Normalized means must be finite and positive. Measurement SHAs must match producer outputs. Before publication, the publisher confirms that the PR remains open with the measured base/head. Invalid, missing, ambiguous, detected stale, or superseded results leave the old comment unchanged. GitHub comment writes have no atomic compare-and-swap, so a PR update can race the final check and write.

The publisher writes one table to its job summary and one bot-authored sticky comment. Rows show workload IDs, normalized mean latency, and signed `(head/base - 1) * 100` change. The report action defaults to `operations-per-sample: "1"` and `unit: "ms/operation"`. The workflow sets `operations-per-sample: "4"` and `unit: ms/search` to divide native millisecond means by four. The divisor must be finite and positive. The unit is a display label, not a time conversion.

Positive change means slower. Results are advisory, not a performance gate or a statistical significance claim. Local workflows do not prove hosted protection, required checks, or OIDC readiness. The workflow, composite actions, and publisher own their executable contracts. Refresh this projection when those owners change.
