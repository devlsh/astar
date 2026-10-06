import { type Vector } from '../../src/types';
import { grid, random, shuffle } from '../helpers';
import { type CaseDefinition } from './types';

export const cases: CaseDefinition[] = [
  {
    id: 'maze.33.numeric.card-manhattan',
    name: 'Maze, opposite interior corners | 33×33 | numeric tiles | four-way | Manhattan heuristic',
    quick: true,
    grid: () => maze(33),
    options: {
      from: [1, 1],
      to: [31, 31],
      heuristic: 'manhattan',
    },
  },
  {
    id: 'maze.65.numeric.card-manhattan',
    name: 'Maze, opposite interior corners | 65×65 | numeric tiles | four-way | Manhattan heuristic',
    grid: () => maze(65),
    options: {
      from: [1, 1],
      to: [63, 63],
      heuristic: 'manhattan',
    },
  },
];

/**
 * Iterative DFS shuffles north, east, south, west once on entry to each cell.
 */
function maze(size: number) {
  const cells = grid(size, size, -1);
  const next = random(0xa57a0002);

  const directions = (): Vector[] =>
    shuffle(
      [
        [0, -2],
        [2, 0],
        [0, 2],
        [-2, 0],
      ],
      next,
    );

  const stack = [
    {
      x: 1,
      y: 1,
      directions: directions(),
    },
  ];

  cells[1][1] = 0;

  for (let cell = stack.at(-1); cell; cell = stack.at(-1)) {
    const direction = cell.directions.shift();

    if (!direction) {
      stack.pop();
      continue;
    }

    const [dx, dy] = direction;
    const x = cell.x + dx;
    const y = cell.y + dy;

    if (x <= 0 || y <= 0 || x >= size - 1 || y >= size - 1 || cells[y][x] === 0) {
      continue;
    }

    cells[y][x] = 0;
    cells[cell.y + dy / 2][cell.x + dx / 2] = 0;
    stack.push({
      x,
      y,
      directions: directions(),
    });
  }

  return cells;
}
