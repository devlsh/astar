import { type Neighbor, type Vector } from './types';

export const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
] as const;

/**
 * Returns cardinal neighbors first, then optional diagonals with their two corner cells.
 */
export function neighbors(vector: Vector, diagonals = false) {
  const tiles: Neighbor[] = [];

  tiles.push(
    [[vector[0] - 1, vector[1]], null],
    [[vector[0] + 1, vector[1]], null],
    [[vector[0], vector[1] - 1], null],
    [[vector[0], vector[1] + 1], null],
  );

  if (diagonals) {
    tiles.push(
      [
        [vector[0] - 1, vector[1] - 1],
        [
          [vector[0], vector[1] - 1],
          [vector[0] - 1, vector[1]],
        ],
      ],
      [
        [vector[0] + 1, vector[1] + 1],
        [
          [vector[0], vector[1] + 1],
          [vector[0] + 1, vector[1]],
        ],
      ],
      [
        [vector[0] + 1, vector[1] - 1],
        [
          [vector[0], vector[1] - 1],
          [vector[0] + 1, vector[1]],
        ],
      ],
      [
        [vector[0] - 1, vector[1] + 1],
        [
          [vector[0], vector[1] + 1],
          [vector[0] - 1, vector[1]],
        ],
      ],
    );
  }

  return {
    tiles,
    total: tiles.length,
  };
}

/**
 * Retains comma-separated identity for coordinates outside the numeric grid-key domain.
 */
export function vectorId(x: number, y: number) {
  return `${x},${y}`;
}
