import { type BuiltinHeuristic } from '../../src/heuristics';

export const board = {
  columns: 24,
  rows: 16,
} as const;

export const colors = {
  background: 0xd4b5f1,
  terrain: [0xe8d9f5, 0xc6a3df, 0xa37ac1, 0x8053a0],
  obstacle: 0x382744,
  path: 0xffda70,
  start: 0x85e0bc,
  end: 0xff968e,
  marker: 0x382744,
} as const;

export interface Settings {
  tool: 'Obstacle' | 'Erase' | 'Elevation' | 'Start' | 'End';
  elevation: number;
  diagonal: boolean;
  cutCorners: boolean;
  stepHeight: number;
  heuristic: BuiltinHeuristic;
  status: string;
}

export const defaults: Settings = {
  tool: 'Obstacle',
  elevation: 0,
  diagonal: true,
  cutCorners: false,
  stepHeight: 1,
  heuristic: 'diagonal',
  status: 'Find a route',
};
