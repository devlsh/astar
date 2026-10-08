import { directions, neighbors, vectorId } from './grid';
import { calculatePath } from './path';
import { asc, score } from './scoring';
import { type CellState, type OpenTile, type SearchOptions, type TileBuilderCache, type Vector } from './types';

export function search(options: SearchOptions) {
  const heuristic = options.heuristic ?? 'diagonal';
  const cutCorners = options.cutCorners ?? true;
  const stepHeight = options.stepHeight ?? 1;
  const diagonal = options.diagonal ?? false;

  // Store the found path and open/closed lists.
  const { from } = options;
  const start: Vector = [from[0], from[1]];
  const { to } = options;
  const destination: Vector = [to[0], to[1]];
  let path: Vector[] | null = null;
  let open: OpenTile[] = [];
  let head = 0;

  // Custom heuristics can mutate retained vectors, so their membership must remain a live scan.
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- SearchOptions permits builtin names and mutable custom callbacks.
  const indexed = typeof heuristic !== 'function';
  let finite = true;

  // Calculate grid limits.
  if (!Array.isArray(options.grid)) {
    throw new Error('Non-array Grid provided');
  }

  if (options.grid.length === 0 || !Array.isArray(options.grid[0])) {
    throw new Error('2 dimensional Grid array required');
  }

  const cells = new Map<number | string, CellState>();
  const maxX = options.grid[0].length;
  const maxY = options.grid.length;
  const numeric = Number.isSafeInteger(maxX * maxY);

  /**
   * In-grid integer coordinates have collision-free numeric keys. Other coordinates retain string identity.
   * Records are local to this search and exist only for cells that it visits or reads.
   */
  function cellId(vector: Vector) {
    const x = vector[0];
    const y = vector[1];

    return numeric && Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < maxX && y < maxY
      ? y * maxX + x
      : vectorId(x, y);
  }

  function state(id: number | string) {
    let value = cells.get(id);

    if (!value) {
      value = {};
      cells.set(id, value);
    }

    return value;
  }

  state(cellId(start)).closed = true;

  const end = cellId(destination);

  // Helper function to determine the make-up of a Tile object, cached in-memory.
  function tile(vector: Vector): TileBuilderCache {
    const cell = state(cellId(vector));

    if (cell.tile) {
      return cell.tile;
    }

    const rawValue = options.grid[vector[1]]?.[vector[0]];

    if (rawValue === undefined) {
      throw new Error('Grid value is undefined');
    }

    let value: TileBuilderCache;

    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Tile explicitly supports numeric elevations and TileBuilder objects.
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

    cell.tile = value;

    return value;
  }

  // Helper function to determine legality of a Vector.
  function canUse(cell: Vector, origin: Vector) {
    return (
      // Make sure this tile is walkable.
      !isIllegal(cell, origin) &&
      // Don't use closed cells.
      !cells.get(cellId(cell))?.closed
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
      (!(
        origin[0] === options.from[0] &&
        origin[1] === options.from[1] &&
        !tile(options.from).isLegal &&
        !tile(options.from).validAsDestination
      ) &&
        // ...make sure the elevation difference is allowed.
        (tile(cell).elevation - tile(origin).elevation > step || tile(cell).elevation - tile(origin).elevation < -step))
    );
  }

  /**
   * Expands neighbors in grid direction order, then restores stable score order.
   * Score decreases retain the preceding frontier order for ties, rather than discovery order.
   */
  function traverse(from: OpenTile) {
    // The root can have accessor coordinates. Custom callbacks can retain and mutate any vector.
    const prepared = !indexed || from[2] === null ? neighbors(from[0], diagonal).tiles : null;
    const x = prepared ? 0 : from[0][0];
    const y = prepared ? 0 : from[0][1];
    const total = diagonal ? 8 : 4;
    const added: OpenTile[] = [];
    let decreased = false;

    for (let i = 0; i < total; i++) {
      const [dx, dy] = directions[i];
      const cell: Vector = prepared ? prepared[i][0] : [x + dx, y + dy];
      const name = cellId(cell);

      // If the tile is usable, push it to the list.
      if (canUse(cell, from[0])) {
        if (i >= 4 && !cutCorners) {
          const corners = prepared ? prepared[i][1] : null;

          if (
            isIllegal(corners ? corners[0] : [x, y + dy], from[0], 0) ||
            isIllegal(corners ? corners[1] : [x + dx, y], from[0], 0)
          ) {
            continue;
          }
        }

        const existing = indexed ? cells.get(name)?.open : open.find((item) => cellId(item[0]) === name);

        const currentScore = score({
          current: cell,
          parent: from,
          goal: options.to,
          heuristic,
        });

        // If it is already in the open list, but this path results in a better score.
        if (existing && currentScore.f < existing[1].f) {
          if (indexed) {
            existing[1] = currentScore;
            existing[2] = from;
            decreased = true;
          } else {
            const existingName = cellId(existing[0]);

            open = open.map((existingTile) => {
              if (cellId(existingTile[0]) === existingName) {
                existingTile[1] = currentScore;
                existingTile[2] = from;
              }

              return existingTile;
            });
          }
        } else if (!existing) {
          const entry: OpenTile = [cell, currentScore, from];

          if (indexed) {
            state(name).open = entry;
            added.push(entry);
          } else {
            open.push(entry);
          }
        }

        finite &&= Number.isFinite(currentScore.f);
      }
    }

    if (!indexed || decreased || !finite) {
      // Stable sorting uses the preceding frontier order, not discovery order, after a decrease.
      open = [...open.slice(head), ...added].toSorted((a, b) => asc(a[1].f, b[1].f));
      head = 0;
    } else {
      for (const entry of added) {
        let high = open.length;
        let low = head;

        while (low < high) {
          const middle = Math.floor((low + high) / 2);

          if (entry[1].f < open[middle][1].f) {
            high = middle;
          } else {
            low = middle + 1;
          }
        }

        open.splice(low, 0, entry);
      }

      if (head > 0 && head >= open.length / 2) {
        open = open.slice(head);
        head = 0;
      }
    }
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
  while (open.length > head) {
    const bestScore = indexed ? open[head++] : open.shift();

    if (bestScore) {
      const [vector] = bestScore;
      const name = cellId(vector);

      // Add this to the closed list.
      const cell = state(name);
      cell.closed = true;
      cell.open = undefined;

      // Check if we're at the end.
      if (name === end) {
        path = calculatePath(bestScore);
        open = [];
        head = 0;

        continue;
      }

      // Otherwise traverse the neighbors.
      traverse(bestScore);
    }
  }

  return path;
}

export type { Grid, SearchOptions, Tile, TileBuilder, Vector } from './types';
