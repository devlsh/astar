import { Container, Graphics } from 'pixi.js';
import { search, type Vector } from '../../src';
import { board, colors, type Settings } from './config';

/**
 * Owns numeric terrain and its Pixi subtree. Edits preserve distinct, legal endpoints.
 * Call refresh after edits or search changes. Destroy after viewport and ticker removal.
 */
export function createMap(settings: Settings) {
  const world = new Container();
  const tiles = new Graphics();
  const route = new Graphics();
  const markers = new Graphics();
  let grid: number[][] = [];
  let from: Vector = [2, 8];
  let to: Vector = [21, 8];

  world.eventMode = 'none';
  world.addChild(tiles, route, markers);

  function clear() {
    grid = Array.from({ length: board.rows }, () => Array.from({ length: board.columns }, () => 0));
  }

  function reset() {
    clear();
    from = [2, 8];
    to = [21, 8];

    for (let y = 1; y < 14; y++) {
      if (y !== 5) {
        grid[y][8] = -1;
      }
    }

    for (let y = 3; y < board.rows; y++) {
      if (y !== 11) {
        grid[y][15] = -1;
      }
    }

    for (let y = 6; y < 10; y++) {
      for (let x = 10; x < 14; x++) {
        grid[y][x] = 1;
      }
    }
  }

  function edit([x, y]: Vector) {
    if (x < 0 || y < 0 || x >= board.columns || y >= board.rows) {
      return;
    }

    const atStart = x === from[0] && y === from[1];
    const atEnd = x === to[0] && y === to[1];

    if (settings.tool === 'Start') {
      if (!atEnd && grid[y][x] !== -1) {
        from = [x, y];
      }
    } else if (settings.tool === 'End') {
      if (!atStart && grid[y][x] !== -1) {
        to = [x, y];
      }
    } else if (settings.tool === 'Obstacle') {
      if (!atStart && !atEnd) {
        grid[y][x] = -1;
      }
    } else {
      grid[y][x] = settings.tool === 'Erase' ? 0 : settings.elevation;
    }
  }

  /**
   * Replaces both search feedback and route geometry, including a null result.
   * Call once per dirty frame after input and viewport fit.
   */
  function refresh() {
    const path = search({
      from,
      to,
      grid,
      heuristic: settings.heuristic,
      diagonal: settings.diagonal,
      cutCorners: settings.cutCorners,
      stepHeight: settings.stepHeight,
    });

    if (path === null) {
      settings.status = 'No route';
    } else {
      const moves = path.length - 1;
      settings.status = `Route: ${moves} ${moves === 1 ? 'move' : 'moves'}`;
    }

    tiles.clear();
    route.clear();
    markers.clear();

    for (let y = 0; y < board.rows; y++) {
      for (let x = 0; x < board.columns; x++) {
        const elevation = grid[y][x];
        const color = elevation === -1 ? colors.obstacle : colors.terrain[elevation];

        tiles.rect(x + 0.035, y + 0.035, 0.93, 0.93).fill(color);

        for (let level = 0; level < elevation; level++) {
          tiles.rect(x + 0.18, y + 0.72 - level * 0.15, 0.64, 0.035).fill(colors.marker);
        }
      }
    }

    if (path !== null) {
      route.moveTo(path[0][0] + 0.5, path[0][1] + 0.5);

      for (const [x, y] of path.slice(1)) {
        route.lineTo(x + 0.5, y + 0.5);
      }

      route.stroke({
        color: colors.path,
        width: 0.14,
        cap: 'round',
        join: 'round',
      });
    }

    markers
      .circle(from[0] + 0.5, from[1] + 0.5, 0.3)
      .fill(colors.start)
      .stroke({
        color: colors.marker,
        width: 0.06,
      });
    markers
      .poly([
        to[0] + 0.5,
        to[1] + 0.14,
        to[0] + 0.86,
        to[1] + 0.5,
        to[0] + 0.5,
        to[1] + 0.86,
        to[0] + 0.14,
        to[1] + 0.5,
      ])
      .fill(colors.end)
      .stroke({
        color: colors.marker,
        width: 0.06,
      });
  }

  function destroy() {
    if (!world.destroyed) {
      world.destroy({
        children: true,
        context: true,
      });
    }
  }

  reset();

  return {
    world,
    edit,
    reset,
    clear,
    refresh,
    destroy,
  };
}
