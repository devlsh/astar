import { type BuiltinHeuristic, type Heuristic, heuristics } from './heuristics';
import { type ScoreOptions } from './types';

/**
 * Uses a custom callback unchanged or selects the named built-in heuristic.
 */
function resolveHeuristic(input: BuiltinHeuristic | Heuristic): Heuristic {
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- The declared union supports builtin names and custom heuristic functions.
  return typeof input === 'function' ? input : heuristics[input];
}

/**
 * Adds one movement step to the parent cost and evaluates the heuristic against the live goal.
 */
export function score(options: ScoreOptions) {
  const g = options.parent[1].g + 1;
  const h = resolveHeuristic(options.heuristic)(options.current, options.goal);

  return {
    g,
    h,
    f: g + h,
  };
}

/**
 * Compares ascending scores and treats unordered values, including NaN, as ties.
 */
export function asc(a: number, b: number) {
  if (a > b) {
    return 1;
  }

  if (a < b) {
    return -1;
  }

  return 0;
}
