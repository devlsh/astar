import * as heuristics from './heuristics';
import type { Neighbor, OpenTile, Score, ScoreOptions, SearchOptions, TileBuilderCache, Vector } from './types';

export function search(options: SearchOptions) {
  const heuristic = options.heuristic ?? 'diagonal';
  const cutCorners = options.cutCorners ?? true;
  const stepHeight = options.stepHeight ?? 1;
  const diagonal = options.diagonal ?? false;

  // Store the found path and open/closed lists.
  const closed: string[] = [vectorId(options.from)];
  const end = vectorId(options.to);
  let path: Vector[] | null = null;
  let open: OpenTile[] = [];

  // Calculate grid limits.
  if (!Array.isArray(options.grid)) {
    throw new Error('non-array grid provided');
  }

  if (!options.grid.length || !Array.isArray(options.grid[0])) {
    throw new Error('2 dimensional grid array required');
  }

  const maxX = options.grid[0].length;
  const maxY = options.grid.length;

  // Helper function to determine the make-up of a Tile object, cached in-memory.
  const tileCache: Record<string, TileBuilderCache> = {};

  function tile(vector: Vector): TileBuilderCache {
    const id = vectorId(vector);

    if (tileCache[id]) {
      return tileCache[id];
    }

    const rawValue = options.grid[vector[1]]?.[vector[0]];

    if (rawValue === undefined) {
      throw new Error('Grid value is undefined');
    }

    let value: TileBuilderCache;

    if (typeof rawValue === 'number') {
      value = {
        elevation: Math.max(0, rawValue),
        isLegal: rawValue !== -1,
      };
    } else {
      value = {
        ...rawValue,
        isLegal: rawValue.isLegal ?? rawValue.elevation !== -1,
      };
    }

    tileCache[id] = value;

    return value;
  }

  // Helper function to determine legality of a Vector.
  function canUse([cell, neighbors]: Neighbor, origin: Vector) {
    return (
      // Make sure this tile is walkable.
      !isIllegal(cell, origin) &&
      // Don't use closed cells.
      closed.indexOf(vectorId(cell)) === -1 &&
      // Check the neighboring cells, if diagonal movement.
      // There are no neighbors to check.
      (neighbors === null ||
        // If we can cut corners, otherwise if the corners are legal.
        cutCorners ||
        (!isIllegal(neighbors[0], origin, 0) && !isIllegal(neighbors[1], origin, 0)))
    );
  }

  // Helper function to determine if the given Vector is walkable.
  function isIllegal(cell: Vector, origin: Vector, step = stepHeight) {
    return (
      // Make sure it is within the grid.
      cell[0] < 0 ||
      cell[1] < 0 ||
      cell[0] >= maxX ||
      cell[1] >= maxY ||
      // Make sure it isn't un-walkable.
      // First, check the elevation is allowed/whether it is marked as legal.
      (!tile(cell).isLegal &&
        // If this is an illegal tile, make sure it's not detination if that's allowed.
        (tile(cell).validAsDestination !== true || cell[0] !== options.to[0] || cell[1] !== options.to[1])) ||
      // This is either the starting (illegal) tile, or...
      (!(origin[0] === options.from[0] && origin[1] === options.from[1] && !tile(options.from).isLegal && !tile(options.from).validAsDestination) &&
        // ...make sure the elevation difference is allowed.
        (tile(cell).elevation - tile(origin).elevation > step || tile(cell).elevation - tile(origin).elevation < -step))
    );
  }

  // Calculates the neighbors and their scores.
  function traverse(from: OpenTile) {
    const { tiles, total } = neighbors(from[0], diagonal);

    for (let i = 0; i < total; i++) {
      const neighbor = tiles[i];

      if (!neighbor) {
        continue;
      }

      const name = vectorId(neighbor[0]);

      // If the tile is usable, push it to the list.
      if (canUse(neighbor, from[0])) {
        const existing = open.find((item) => vectorId(item[0]) === name);
        const currentScore = score({
          current: neighbor[0],
          parent: from,
          goal: options.to,
          heuristic,
        });

        // If it is already in the open list, but this path results in a better score.
        if (existing && currentScore.f < existing[1].f) {
          const existingName = vectorId(existing[0]);

          open = open.map((existingTile) => {
            if (vectorId(existingTile[0]) === existingName) {
              existingTile[1] = currentScore;
              existingTile[2] = from;
            }

            return existingTile;
          });
        } else if (!existing) {
          open.push([neighbor[0], currentScore, from]);
        }
      }
    }

    // Sort the new open list by F values.
    open = open.sort((a, b) => asc(a[1].f, b[1].f));
  }

  // And start traversing from the starting position.
  traverse([
    options.from,
    {
      g: 0,
      h: 0,
      f: 0,
    },
    null,
  ]);

  // Traverse the open list until it is empty.
  while (open.length > 0) {
    const bestScore = open.shift();

    if (bestScore) {
      const [vector] = bestScore;
      const name = vectorId(vector);

      // Add this to the closed list.
      closed.push(name);

      // Check if we're at the end.
      if (name === end) {
        path = calculatePath(bestScore);
        open = [];
        continue;
      }

      // Otherwise traverse the neighbors.
      traverse(bestScore);
    }
  }

  return path;
}

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

export function neighbors(vector: Vector, diagonals = false) {
  const tiles: Neighbor[] = [];

  tiles.push([[vector[0] - 1, vector[1]], null]);
  tiles.push([[vector[0] + 1, vector[1]], null]);
  tiles.push([[vector[0], vector[1] - 1], null]);
  tiles.push([[vector[0], vector[1] + 1], null]);

  if (diagonals) {
    tiles.push([
      [vector[0] - 1, vector[1] - 1],
      [
        [vector[0], vector[1] - 1],
        [vector[0] - 1, vector[1]],
      ],
    ]);
    tiles.push([
      [vector[0] + 1, vector[1] + 1],
      [
        [vector[0], vector[1] + 1],
        [vector[0] + 1, vector[1]],
      ],
    ]);
    tiles.push([
      [vector[0] + 1, vector[1] - 1],
      [
        [vector[0], vector[1] - 1],
        [vector[0] + 1, vector[1]],
      ],
    ]);
    tiles.push([
      [vector[0] - 1, vector[1] + 1],
      [
        [vector[0], vector[1] + 1],
        [vector[0] - 1, vector[1]],
      ],
    ]);
  }

  return { tiles, total: tiles.length };
}

export function score(options: ScoreOptions) {
  const g = options.parent[1].g + 1;
  const h = heuristics[options.heuristic](options.current, options.goal);

  return { g, h, f: g + h } as Score;
}

export function vectorId(vector: Vector) {
  return `${vector[0]},${vector[1]}`;
}

export function asc(a: number, b: number) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }

  return 0;
}

export * from './types';
