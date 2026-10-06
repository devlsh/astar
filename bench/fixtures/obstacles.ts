import { type Vector } from '../../src/types';
import { chebyshev, grid, random, shuffle } from '../helpers';
import { type CaseDefinition } from './types';

export const randomCases: CaseDefinition[] = [
  {
    id: 'random.32.p20.numeric.card-manhattan',
    name: 'Random obstacles, about 20%, corner to corner | 32×32 | numeric tiles | four-way | Manhattan heuristic',
    grid: () => obstacles(204),
    options: {
      from: [0, 0],
      to: [31, 31],
      heuristic: 'manhattan',
    },
  },
  {
    id: 'random.32.p35.numeric.card-manhattan',
    name: 'Random obstacles, about 35%, corner to corner | 32×32 | numeric tiles | four-way | Manhattan heuristic',
    quick: true,
    grid: () => obstacles(358),
    options: {
      from: [0, 0],
      to: [31, 31],
      heuristic: 'manhattan',
    },
  },
];

export const disconnected: CaseDefinition[] = [
  {
    id: 'disconnected.32.numeric.card-default',
    name: 'Solid divider, no route | 32×32 | numeric tiles | four-way | default heuristic',
    quick: true,
    grid: () => divided(32),
    options: {
      from: [0, 0],
      to: [31, 31],
    },
  },
  {
    id: 'disconnected.64.numeric.card-default',
    name: 'Solid divider, no route | 64×64 | numeric tiles | four-way | default heuristic',
    grid: () => divided(64),
    options: {
      from: [0, 0],
      to: [63, 63],
    },
  },
];

export const corners: CaseDefinition[] = [
  {
    id: 'corners.33.numeric.diag-chebyshev-cut',
    name: 'Corner obstacles, corner to corner | 33×33 | numeric tiles | diagonal moves | Chebyshev heuristic | corner cutting allowed',
    grid: cornerGrid,
    options: {
      from: [0, 0],
      to: [32, 32],
      diagonal: true,
      heuristic: chebyshev,
      cutCorners: true,
    },
  },
  {
    id: 'corners.33.numeric.diag-chebyshev-strict',
    name: 'Corner obstacles, corner to corner | 33×33 | numeric tiles | diagonal moves | Chebyshev heuristic | corner cutting blocked',
    quick: true,
    grid: cornerGrid,
    options: {
      from: [0, 0],
      to: [32, 32],
      diagonal: true,
      heuristic: chebyshev,
      cutCorners: false,
    },
  },
];

/**
 * Seeded obstacle prefixes are nested. The top row and right column stay open.
 */
function obstacles(count: number) {
  const cells = grid(32);
  const coordinates: Vector[] = [];

  for (let y = 1; y < 32; y++) {
    for (let x = 0; x < 31; x++) {
      coordinates.push([x, y]);
    }
  }

  shuffle(coordinates, random(0xa57a0001));

  for (const [x, y] of coordinates.slice(0, count)) {
    cells[y][x] = -1;
  }

  return cells;
}

function divided(size: number) {
  const cells = grid(size);

  for (const row of cells) {
    row[Math.floor(size / 2)] = -1;
  }

  return cells;
}

function cornerGrid() {
  return grid(33).map((row, y) => row.map((_, x) => (x % 4 === 1 && y % 4 === 0 ? -1 : 0)));
}
