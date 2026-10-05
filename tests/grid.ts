import { type Grid } from '../src';

export function makeGrid(): Grid {
  return [
    [0, { elevation: 5 }, -1, 0, 0, -1, 0, { elevation: 2, isLegal: false, validAsDestination: true }],
    [0, 4, -1, 0, 0, -1, 0, 0],
    [0, 3, -1, 0, 0, -1, 0, { elevation: 2, isLegal: false, validAsDestination: true }],
    [0, 2, -1, 0, 0, 0, 0, 1],
    [0, 1, -1, { elevation: 0 }, 0, -1, 0, 0],
    [0, 0, -1, 0, 0, -1, 0, 0],
    [0, 0, 0, 0, 0, -1, 0, { elevation: 0, isLegal: false, validAsDestination: true }],
    [0, 0, -1, 0, 0, { elevation: 0, isLegal: false, validAsDestination: true }, 0, 2],
  ];
}
