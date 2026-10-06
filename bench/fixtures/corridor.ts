import { grid } from '../helpers';
import { type CaseDefinition } from './types';

export const cases: CaseDefinition[] = [
  {
    id: 'corridor.128.numeric.default',
    name: 'Straight corridor, end to end | 128×1 | numeric tiles | four-way | default heuristic',
    quick: true,
    grid: () => grid(128, 1),
    options: {
      from: [0, 0],
      to: [127, 0],
    },
  },
  {
    id: 'corridor.1024.numeric.default',
    name: 'Straight corridor, end to end | 1024×1 | numeric tiles | four-way | default heuristic',
    grid: () => grid(1024, 1),
    options: {
      from: [0, 0],
      to: [1023, 0],
    },
  },
];
