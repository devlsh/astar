# Development

## Change Workflow

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md) for setup, dependency approval, standard checks, benchmarks, and PR procedure.
2. Identify each affected consumer using the source map below. Inspect its implementation, tests, configuration, and public usage before editing.
3. Apply the relevant validation requirements below, in addition to the standard checks. Scope automatic fixes and formatting to authorized files.
4. Report changed behavior, checks actually run and their results, and omitted or blocked checks with reasons. Distinguish local evidence from hosted or installed-consumer evidence.

## Source And Consumer Map

| Change                           | Source and contract to inspect                                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pathfinding or public types      | [src/index.ts](../src/index.ts), [src/heuristics.ts](../src/heuristics.ts), [src/types.ts](../src/types.ts), [tests](../tests), and [README.md](../README.md#usage)         |
| Build or package contents        | [tsdown.config.ts](../tsdown.config.ts), [tsconfig.build.json](../tsconfig.build.json), and exports/files/lifecycle scripts in [package.json](../package.json)              |
| Demo or browser consumption      | [demo/AGENTS.md](../demo/AGENTS.md), [demo source](../demo/src), [Vite configuration](../demo/vite.config.ts), and the [demo guide](../demo/README.md)                      |
| Benchmark workloads or reporting | [bench](../bench), [bench.config.ts](../bench.config.ts), and [CONTRIBUTING benchmarks](../CONTRIBUTING.md#benchmarks)                                                      |
| Tooling or workflow integration  | Root lint/formatter configuration, [pnpm-workspace.yaml](../pnpm-workspace.yaml), [lefthook.yml](../lefthook.yml), and callers in [.github/workflows](../.github/workflows) |

- `dist` is generated. Library tests and the demo consume source; benchmarks consume the minified package export. Build current source before benchmarks.
- The library ships one ESM entry with declarations and no runtime dependencies. Package exports and build configuration own the output layout.
- The demo has separate browser and Vite typechecks. Root typechecking does not cover them.

## Validation Requirements

Select focused checks from [package.json](../package.json) during development. Complete the [standard checks](../CONTRIBUTING.md#checks) before closeout. Add evidence for each affected consumer:

| Affected surface                     | Required evidence                                                                                                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pathfinding behavior                 | Exercise affected contracts through the public source export and [tests/astar.test.ts](../tests/astar.test.ts): grid validation, cardinal/diagonal movement, corner cutting, elevation limits, built-in/custom heuristics, illegal destinations, and null paths as affected. |
| Module exports or build output       | Build, then verify affected imports, exports, and declarations from a packed, installed consumer. Source-local checks do not prove the published module layout.                                                                                                              |
| Demo or shared compiler/toolchain    | Run demo typechecking and build. For browser behavior or lifecycle changes, follow the [scoped checks](../demo/AGENTS.md#checks); library checks do not replace them.                                                                                                        |
| Benchmark workloads or configuration | Follow the benchmark procedure in CONTRIBUTING. Benchmarks measure performance, not path correctness.                                                                                                                                                                        |
| Shared action or workflow            | Check inputs, outputs, and caller compatibility. Package checks do not execute GitHub Actions; report hosted execution as unverified unless an authorized run covers the change.                                                                                             |

The formatter excludes `.github`; a passing format check is not evidence for those files. Inspect each check's configured scope before using its result as evidence.

## Documentation Ownership

- Keep always-loaded authorization, repository defaults, and task routes in [AGENTS.md](../AGENTS.md). Put branch-specific instructions in their task owner.
- Keep shared contributor procedures in CONTRIBUTING, demo ownership and lifecycle in [demo/AGENTS.md](../demo/AGENTS.md), and release operations in [Releasing](releasing.md). Link to the owner instead of copying its procedure.
- Keep public behavior and examples in the root README and [demo guide](../demo/README.md). Update affected examples when public behavior or scope changes.
- When instructions change, update affected routes and remove obsolete guidance in the same change. Verify local paths and anchors, and compare documented commands and claims with their executable owners.
- Check incoming links from human documentation against the audience boundary in [AGENTS.md](../AGENTS.md#repository-defaults).

## Tracker Operations

- Resolve the exact hosted repository from package.json and the requested object before acting.
- Follow [Questions And Reports](../CONTRIBUTING.md#questions-and-reports) for support, issue search, and private security reports.
- Read current hosted labels before applying them. Configuration files and old reports do not establish current hosted state.
