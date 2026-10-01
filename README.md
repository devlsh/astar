<div align="center">
  <a href="https://www.npmjs.com/package/@devlsh/astar" target="_blank">
    <img src="https://img.shields.io/npm/v/@devlsh/astar?style=flat-square" alt="NPM" />
  </a>
  <img src="https://img.shields.io/npm/l/@devlsh/astar?style=flat-square" alt="GPL-3.0-only" />
  <h3>Synchronous A* pathfinding for TypeScript.</h3>
</div>

`@devlsh/astar` is an synchronous A* pathfinding implementation in TypeScript.

- Supports diagonal or manhattan heuristics
- Optionally supports 3-dimensional grids with elevation
- Highly configurable (corner cutting, diagonal movement, etc.)
- First-class TypeScript
- Fully tested
- It's not awfully performant, but it works!

## Installation

```bash
npm install @devlsh/astar
```

## Usage

```typescript
import { search, type Grid } from '@devlsh/astar';

/**
 * The first step is to have a Grid.
 *
 * -1 = un-walkable, like a wall or water.
 *  0 = walkable, optionally any integer above 0 for elevation support
 */
const grid: Grid = [
  [ 0,  5, -1,  0,  0, -1,  0,  0],
  [ 0,  4, -1,  0,  0, -1,  0,  0],
  [ 0,  3, -1,  0,  0, -1,  0,  0],
  [ 0,  2, -1,  0,  0,  0,  0,  0],
  [ 0,  1, -1,  0,  0, -1,  0,  0],
  [ 0,  0, -1,  0,  0, -1,  0,  0],
  [ 0,  0,  0,  0,  0, -1,  0,  0],
  [ 0,  0, -1,  0,  0, -1,  0,  0],
];

/**
 * Once you have a Grid, you can find an efficient tile-based path
 * from one vector to another.
 */
const path = search({
  cutCorners: false,
  diagonal: true,
  from: [0, 0],
  to: [7, 6],
  grid,
});

// Path is either an array of vectors or null (could not find a path)
console.log(path);
```

The library is immutable/side-effect free, and the grid reference won't be changed when searched.
