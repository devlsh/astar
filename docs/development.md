# Development

Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for setup, dependency changes, checks, and pull requests. For release or recovery work, read [Releasing](releasing.md).

Before editing, inspect [package.json](../package.json), the affected implementation and tests, and their configuration. Follow the patterns in nearby code and the configured lint and formatting rules.

## Documentation

When public behavior or scope changes, update affected usage examples in [README.md](../README.md) and the [demo guide](../demo/README.md). For instructions or routing changes, update affected links and descriptions together.

## Agent Workflow

Select checks from [CONTRIBUTING](../CONTRIBUTING.md#checks) and [package.json](../package.json) for every affected consumer. Include behavior checks for these cases:

- For pathfinding changes, exercise affected contracts through [src/index.ts](../src/index.ts) and [tests/astar.test.ts](../tests/astar.test.ts). Include grid validation, cardinal/diagonal movement, corner cutting, elevation limits, built-in/custom heuristics, illegal destinations, and null paths as affected.
- For demo changes, add the [scoped checks](../demo/AGENTS.md#checks). Library checks do not replace demo behavior and lifecycle checks.
- For benchmark changes, use [CONTRIBUTING benchmarks](../CONTRIBUTING.md#benchmarks). Build current source before benchmarks. Benchmarks do not validate path correctness.
- For entrypoint, output, or built consumer changes, run `pnpm build` and verify affected package imports, exports, and types.

Scope automatic fixes and formatting to the authorized files. Report changed files, check results, and omitted or blocked checks with their reasons.

### Tracker Operations

For tracker work, resolve the exact hosted repository and follow [Questions And Reports](../CONTRIBUTING.md#questions-and-reports). Check current hosted labels before applying them.
