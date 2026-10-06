import { rotate } from '../helpers';
import { type SearchOptions } from '../../src/types';
import { cases as corridor } from './corridor';
import { cases as maze } from './maze';
import { randomCases, disconnected, corners } from './obstacles';
import { cases as open } from './open';
import { cases as rooms } from './rooms';
import { cases as terrain } from './terrain';
import { cheap, representation } from './tiles';
import { type Suite, type Workload } from './types';

/**
 * Stable portfolio order. A changed workload requires a new ID and a new series.
 */
const cases = [
  ...cheap,
  ...open,
  ...corridor,
  ...maze,
  ...rooms,
  ...randomCases,
  ...disconnected,
  ...corners,
  ...terrain,
  ...representation,
];

export function select(suite: Suite) {
  return cases
    .values()
    .filter((entry) => suite === 'full' || entry.quick)
    .map(({ id }) => ({ id }))
    .toArray();
}

/**
 * Build fresh inputs outside timing. Numeric obstacles use the package's -1 sentinel.
 */
export function fixtures(): Workload[] {
  return cases.map(({ id, name, grid, options }) => {
    const queries: SearchOptions[] = [
      {
        ...options,
        grid: grid(),
        from: [...options.from],
        to: [...options.to],
      },
    ];

    for (let rotation = 1; rotation < 4; rotation++) {
      queries.push(rotate(queries[rotation - 1]));
    }

    return {
      id,
      name,
      queries,
    };
  });
}

export { type Suite, type Workload } from './types';
