# A* Demo

For demo work, apply [shared development standards](../docs/development.md) and [agent workflow](../docs/development.md#agent-workflow).

## Owners

- [index.html](index.html) and [src/style.css](src/style.css) own the fullscreen canvas host. Preserve the canvas and floating lil-gui composition.
- [src/index.ts](src/index.ts) owns startup and the HMR AbortController. [src/init.ts](src/init.ts) owns asynchronous initialization, the ticker callback, and idempotent disposal.
- [src/config.ts](src/config.ts) owns fixed grid dimensions, terrain colors, and settings. Keep the CSS background consistent with the renderer background.
- [src/map.ts](src/map.ts) owns terrain edits, distinct legal endpoints, real library search, path feedback, and its Pixi subtree. It consumes [library source](../src/index.ts), not generated output.
- [src/controls.ts](src/controls.ts) owns settings input, numeric elevation bounds, actions, status, and GUI cleanup.
- [src/viewport.ts](src/viewport.ts) owns world fit, client-to-cell mapping, and pointer listeners. Resize fits the world without changing the grid.
- [wrangler.jsonc](wrangler.jsonc) owns static assets and the custom domain. [../.github/workflows/demo.yml](../.github/workflows/demo.yml) separates credential-free validation from main-only deployment through the `production` environment. Local files do not prove hosted environment protection or authorize live operations.

Refresh these pointers when executable ownership changes.

## Lifecycle

After Pixi initialization resolves, check abort before canvas attachment. Fit the viewport before input mapping and frame updates. Coalesce edits and search changes into the next frame. A null search result must clear the previous route.

Remove ticker and viewport listeners before GUI and scene disposal. Destroy the application only after initialization resolves. Each mounted demo owns one canvas and GUI. Release each owner once, including HMR replacement.

## Checks

Use the shared environment and dependency recovery in [agent workflow](../docs/development.md#environment-and-dependencies). [Root scripts](../package.json) forward demo commands to [the demo manifest](package.json). From the repository root, the manifests define:

- `pnpm demo dev` starts Vite for real-interface checks.
- `pnpm demo typecheck` checks browser source and Vite configuration without emitting files.
- `pnpm demo build` builds the demo with Vite.
- `pnpm demo wrangler deploy --dry-run` validates native deployment packaging without deploying. Run it after `pnpm demo build` exactly as shown, without environment wrappers or additional environment variables. Build and dry-run are packaging checks, not runtime HTTP tests. Local checks do not verify custom-domain ownership, DNS, secrets, or environment protection.

Select these checks cumulatively with [shared validation](../docs/development.md#validation-selection) within caller authorization. For behavior changes, inspect the running interface for pointer painting, legal endpoint moves, elevation and search options, no-route feedback, clear/reset actions, resizing, renderer initialization, and HMR cleanup as affected. Completion requires the affected controls and lifecycle to behave as described, with each executed check and any gap reported. If startup or checks fail, resolve the failure at its executable owner or report the blocker; static checks alone do not prove canvas behavior. Do not bypass authentication failures with live operations.

Demo checks are separate from library typechecking, tests, and packaging. When changing the library API consumed here, verify both owning seams.
