import { grid } from '../helpers';
import { type CaseDefinition } from './types';

export const cheap: CaseDefinition[] = [
  {
    id: 'cheap.8.numeric.default',
    name: 'Adjacent target | 8×8 | numeric tiles | four-way | default heuristic',
    quick: true,
    grid: () => grid(8),
    options: {
      from: [3, 3],
      to: [4, 3],
    },
  },
  {
    id: 'cheap.8.object-minimal.default',
    name: 'Adjacent target | 8×8 | objects (elevation only) | four-way | default heuristic',
    quick: true,
    grid: () => grid(8).map((row) => row.map(() => ({ elevation: 0 }))),
    options: {
      from: [3, 3],
      to: [4, 3],
    },
  },
];

export const representation: CaseDefinition[] = [
  {
    id: 'open.32.object-full.card-default',
    name: 'Open grid, corner to corner | 32×32 | full tile objects | four-way | default heuristic',
    grid: () => fullTiles(32),
    options: {
      from: [0, 0],
      to: [31, 31],
    },
  },
  {
    id: 'open.32.mixed.card-default',
    name: 'Open grid, corner to corner | 32×32 | numeric tiles and full tile objects | four-way | default heuristic',
    quick: true,
    grid: () => fullTiles(32, true),
    options: {
      from: [0, 0],
      to: [31, 31],
    },
  },
  {
    id: 'destination.8.object-full.default',
    name: 'Adjacent target | 8×8 | full tile objects | four-way | default heuristic | invalid tile allowed as destination',
    grid: () => {
      const cells = fullTiles(8);
      cells[3][4] = {
        elevation: 0,
        isLegal: false,
        validAsDestination: true,
      };

      return cells;
    },
    options: {
      from: [3, 3],
      to: [4, 3],
    },
  },
];

function fullTiles(size: number, mixed = false) {
  return grid(size).map((row, y) =>
    row.map((_, x) =>
      mixed && (x + y) % 2 === 0
        ? 0
        : {
            elevation: 0,
            isLegal: true,
            validAsDestination: false,
          },
    ),
  );
}
