import { grid } from '../helpers';
import { type CaseDefinition } from './types';

export const cases: CaseDefinition[] = [
  {
    id: 'rooms.33.numeric.card-manhattan',
    name: 'Rooms with doors, opposite interior corners | 33×33 | numeric tiles | four-way | Manhattan heuristic',
    grid: () => rooms(33),
    options: {
      from: [1, 1],
      to: [31, 31],
      heuristic: 'manhattan',
    },
  },
  {
    id: 'rooms.65.numeric.card-manhattan',
    name: 'Rooms with doors, opposite interior corners | 65×65 | numeric tiles | four-way | Manhattan heuristic',
    grid: () => rooms(65),
    options: {
      from: [1, 1],
      to: [63, 63],
      heuristic: 'manhattan',
    },
  },
];

/**
 * Block the border and wall intersections. Each eight-cell wall segment has one
 * door at offset 1 or 7, alternating by wall and segment indexes.
 */
function rooms(size: number) {
  return grid(size).map((row, y) =>
    row.map((_, x) => {
      if (x === 0 || y === 0 || x === size - 1 || y === size - 1 || (x % 8 === 0 && y % 8 === 0)) {
        return -1;
      }

      if (x % 8 === 0) {
        return y % 8 === ((x / 8 + Math.floor(y / 8)) % 2 === 0 ? 1 : 7) ? 0 : -1;
      }

      if (y % 8 === 0) {
        return x % 8 === ((y / 8 + Math.floor(x / 8)) % 2 === 0 ? 1 : 7) ? 0 : -1;
      }

      return 0;
    }),
  );
}
