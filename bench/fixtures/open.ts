import { chebyshev, grid, zero } from '../helpers';
import { type CaseDefinition } from './types';

export const cases: CaseDefinition[] = [
  open({
    id: 'open.32.numeric.card-default',
    name: 'Open grid, corner to corner | 32×32 | numeric tiles | four-way | default heuristic',
    size: 32,
    quick: true,
  }),
  open({
    id: 'open.64.numeric.card-default',
    name: 'Open grid, corner to corner | 64×64 | numeric tiles | four-way | default heuristic',
    size: 64,
  }),
  open({
    id: 'open.32.numeric.card-manhattan',
    name: 'Open grid, corner to corner | 32×32 | numeric tiles | four-way | Manhattan heuristic',
    size: 32,
    quick: true,
    options: {
      heuristic: 'manhattan',
    },
  }),
  open({
    id: 'open.64.numeric.card-manhattan',
    name: 'Open grid, corner to corner | 64×64 | numeric tiles | four-way | Manhattan heuristic',
    size: 64,
    options: {
      heuristic: 'manhattan',
    },
  }),
  open({
    id: 'open.32.numeric.diag-default',
    name: 'Open grid, corner to corner | 32×32 | numeric tiles | diagonal moves | default heuristic',
    size: 32,
    options: {
      diagonal: true,
    },
  }),
  open({
    id: 'open.32.numeric.diag-chebyshev',
    name: 'Open grid, corner to corner | 32×32 | numeric tiles | diagonal moves | Chebyshev heuristic',
    size: 32,
    quick: true,
    options: {
      diagonal: true,
      heuristic: chebyshev,
    },
  }),
  open({
    id: 'open.32.numeric.card-zero',
    name: 'Open grid, corner to corner | 32×32 | numeric tiles | four-way | custom zero heuristic',
    size: 32,
    options: {
      heuristic: zero,
    },
  }),
];

interface Options extends Pick<CaseDefinition, 'id' | 'name' | 'quick'> {
  size: number;
  options?: Omit<CaseDefinition['options'], 'from' | 'to'>;
}

function open({ id, name, size, quick, options = {} }: Options): CaseDefinition {
  return {
    id,
    name,
    quick,
    grid: () => grid(size),
    options: {
      ...options,
      from: [0, 0],
      to: [size - 1, size - 1],
    },
  };
}
