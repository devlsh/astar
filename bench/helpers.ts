import { type Grid, type SearchOptions, type Vector } from '../src/types';

/**
 * xorshift32 with unsigned output. Seeds and shuffle order define the corpus.
 */
export function random(seed: number) {
  let state = seed;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;

    return (state >>> 0) / 0x1_0000_0000;
  };
}

export function shuffle<T>(items: T[], next: () => number) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

export function grid(width: number, height = width, elevation = 0): Grid {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => elevation));
}

/**
 * Rotate rectangular maps clockwise, including corridor endpoints.
 */
export function rotate(query: SearchOptions): SearchOptions {
  const height = query.grid.length;
  const width = query.grid[0].length;

  const cells = Array.from({ length: width }, (_, y) =>
    Array.from({ length: height }, (_, x) => query.grid[height - 1 - x][y]),
  );

  const point = ([x, y]: Vector): Vector => [height - 1 - y, x];

  return {
    ...query,
    grid: cells,
    from: point(query.from),
    to: point(query.to),
  };
}

export const chebyshev = (from: Vector, to: Vector) => Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));

export const zero = () => 0;
