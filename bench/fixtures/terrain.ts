import { chebyshev, grid } from '../helpers';
import { type CaseDefinition } from './types';

export const cases: CaseDefinition[] = [
  boundary({
    id: 'terrain.33.numeric.card-step1',
    name: 'Elevation boundary with one ramp | 33×33 | numeric tiles | four-way | Manhattan heuristic | elevation limit 1',
    quick: true,
    options: {
      heuristic: 'manhattan',
      stepHeight: 1,
    },
  }),
  boundary({
    id: 'terrain.33.numeric.card-step2',
    name: 'Elevation boundary with one ramp | 33×33 | numeric tiles | four-way | Manhattan heuristic | elevation limit 2',
    options: {
      heuristic: 'manhattan',
      stepHeight: 2,
    },
  }),
  boundary({
    id: 'terrain.33.numeric.diag-step1-strict',
    name: 'Elevation boundary with one ramp | 33×33 | numeric tiles | diagonal moves | Chebyshev heuristic | elevation limit 1 | corner cutting blocked',
    options: {
      diagonal: true,
      heuristic: chebyshev,
      cutCorners: false,
      stepHeight: 1,
    },
  }),
];

/**
 * The elevation boundary has one ramp at [16,31], away from the direct route.
 */
function terrain() {
  const cells: number[][] = grid(33).map((row) => row.map((_, x) => (x < 16 ? 0 : 2)));
  cells[31][16] = 1;

  return cells;
}

interface Options extends Pick<CaseDefinition, 'id' | 'name' | 'quick'> {
  options: Omit<CaseDefinition['options'], 'from' | 'to'>;
}

function boundary({ id, name, quick, options }: Options): CaseDefinition {
  return {
    id,
    name,
    quick,
    grid: terrain,
    options: {
      ...options,
      from: [1, 1],
      to: [31, 1],
    },
  };
}
