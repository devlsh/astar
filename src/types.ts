import type * as heuristics from './heuristics';

export interface TileBuilder {
  elevation: number;
  isLegal?: boolean;
  validAsDestination?: boolean;
}

export type TileBuilderCache = Omit<TileBuilder, 'isLegal'> & Required<Pick<TileBuilder, 'isLegal'>>;

export type Tile = TileBuilder | number;
export type Grid = Tile[][];
export type Vector = [number, number];

export interface Score {
  g: number;
  h: number;
  f: number;
}

export type OpenTile = [Vector, Score, OpenTile | null];

export interface ScoreOptions {
  current: Vector;
  parent: OpenTile;
  goal: Vector;
  heuristic: keyof typeof heuristics;
}

export interface SearchOptions {
  from: Vector;
  to: Vector;
  grid: Grid;
  heuristic?: keyof typeof heuristics;
  diagonal?: boolean;
  cutCorners?: boolean;
  /**
   * When defing a grid with elevation, this is the max distance
   * that can be stepped up/down. Defaults to `1`.
   */
  stepHeight?: number;
}

/**
 * A Neighbor result consists of the neighbor cell itself (`0` index)
 * and, if a diagonal movement, the two cells around the origin cell
 * and the neighbor cell.
 *
 * Removes the need to calculate this later on if `cutCorners` is
 * disabled.
 */
export type Neighbor = [Vector, [Vector, Vector] | null];
