import { type OpenTile, type Vector } from './types';

/**
 * Follows parent links and returns the retained vectors from the origin through the result.
 */
export function calculatePath(result: OpenTile) {
  let current: OpenTile | null = result;
  const path: Vector[] = [];

  while (current !== null) {
    path.push(current[0]);
    current = current[2];
  }

  path.reverse();

  return path;
}
