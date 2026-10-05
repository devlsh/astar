import { type Vector } from './types';

export const manhattan: Heuristic = (from, to) => {
  return Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]);
};

export const diagonal: Heuristic = (from, to) => {
  const d1 = Math.abs(to[0] - from[0]);
  const d2 = Math.abs(to[1] - from[1]);
  const D2 = Math.sqrt(2);
  const D = 1;

  return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
};

export const heuristics = {
  diagonal,
  manhattan,
} as const satisfies Record<string, Heuristic>;

export type BuiltinHeuristic = keyof typeof heuristics;

export type Heuristic = (from: Vector, to: Vector) => number;
