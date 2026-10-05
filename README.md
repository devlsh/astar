<p align="center">
  <h1 align="center">@devlsh/astar</h1>
  <p align="center">A* pathfinding for 2D grids with elevation support.</p>
</p>

<br />

<p align="center">
  <a href="https://www.npmjs.com/package/@devlsh/astar" rel="nofollow">
    <img src="https://img.shields.io/npm/dm/%40devlsh%2Fastar?style=flat-square" alt="NPM Downloads" />
  </a>
  <a href="https://github.com/devlsh/astar/stargazers" rel="nofollow">
    <img src="https://img.shields.io/github/stars/devlsh/astar?style=flat-square" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/devlsh/astar/actions/workflows/validate.yml" rel="nofollow">
    <img src="https://img.shields.io/github/actions/workflow/status/devlsh/astar/validate.yml?style=flat-square" alt="Build Status" />
  </a>
  <a href="https://github.com/devlsh/astar/blob/main/LICENSE" rel="nofollow">
    <img src="https://img.shields.io/github/license/devlsh/astar?style=flat-square" alt="Software License" />
  </a>
</p>

<br />

- [Interactive demo](https://astar.devlsh.com).
- A* pathfinding on 2D grids.
- Grids with numeric elevation values or configurable tile objects.
- Optional diagonal movement and corner-cutting prevention.
- Configurable maximum elevation change per move.
- Includes built-in Diagonal and Manhattan heuristics, fully customizable.
- Zero runtime dependencies.

<br />

## Installation

```bash
$ npm install @devlsh/astar
```

## Usage

Find a path from `[0, 0]` to `[3, 3]`.

```ts
import { search, type Grid } from '@devlsh/astar';

/**
 * Numbers >= 0 specify elevation.
 *
 * 0 = ground
 * -1 = blocked/no tile
 * >= 1 = elevated tile
 */
const grid: Grid = [
  [0, 0, 0, 0],
  [0, -1, -1, 1],
  [0, 0, 1, 1],
  [0, 0, 1, 2],
];

const path = search({
  grid,

  // Coordinates are `[x, y]` vectors.
  from: [0, 0],
  to: [3, 3],

  // Maximum elevation change per move.
  stepHeight: 1,

  diagonal: true,
  cutCorners: false,
});

/**
 * The path includes both endpoints.
 * If no path is found, the result is null.
 */
console.log(path);
```

## Contributing

Report bugs through [issues](https://github.com/devlsh/astar/issues) or ask questions in [Discussions](https://github.com/devlsh/astar/discussions). Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

For local development, pull requests, and other contributions, see the [Contributing Guidelines](CONTRIBUTING.md).

## License

`@devlsh/astar` is free and open-source software licensed under the [MIT License](LICENSE).

---

> [devlsh.com](https://devlsh.com) &nbsp;&middot;&nbsp;
> GitHub: [@devlsh](https://github.com/devlsh) &nbsp;&middot;&nbsp;
> X: [@itsdevlsh](https://x.com/itsdevlsh)
