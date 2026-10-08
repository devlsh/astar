import { search, type Grid, type Vector } from '../src';
import { makeGrid } from './grid';

describe('search', () => {
  describe('input validation', () => {
    test.concurrent('should enforce array grid input', () => {
      expect(() => {
        return search({
          from: [0, 0],
          to: [0, 7],
          // @ts-expect-error
          grid: null,
        });
      }).toThrow();
    });

    test.concurrent('should enforce 2 dimensional array grid input', () => {
      expect(() => {
        return search({
          from: [0, 0],
          to: [0, 7],
          grid: [],
        });
      }).toThrow();
    });
  });

  test.concurrent('should select a route using a custom heuristic', () => {
    const path = search({
      from: [0, 0],
      to: [2, 0],
      grid: [
        [0, 0, 0],
        [0, 0, 0],
      ],
      heuristic: (current, goal) => {
        expect(goal).toStrictEqual([2, 0]);

        return current[1] === goal[1] && current[0] !== goal[0] ? 100 : 0;
      },
    });

    expect(path).toStrictEqual([
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 0],
    ]);
  });

  test.concurrent('should use a shorter route discovered after a detour', () => {
    const path = search({
      from: [0, 0],
      to: [4, 0],
      grid: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, -1, -1],
      ],
      // Zero estimates favor the lower detour before the direct route reaches [2, 0].
      // Both rows underestimate or equal the remaining distance to the goal.
      heuristic: (current, goal) => (current[1] === 0 ? goal[0] - current[0] : 0),
    });

    expect(path).toStrictEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ]);
  });

  describe('search compatibility', () => {
    test.concurrent('retains frontier order on equal scores', () => {
      expect(
        search({
          grid: [
            [0, 0, 0, 0],
            [0, -1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          from: [0, 0],
          to: [3, 3],
        }),
      ).toStrictEqual([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 2],
        [3, 3],
      ]);
    });

    test.concurrent('retains the preceding frontier order after score decreases', () => {
      let seed = 248;

      const grid = Array.from({ length: 12 }, () =>
        Array.from({ length: 12 }, () => {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;

          return seed / 0x1_0000_0000 < 0.3 ? -1 : 0;
        }),
      );

      grid[0][0] = 0;
      grid[11][11] = 0;

      expect(
        search({
          grid,
          from: [0, 0],
          to: [11, 11],
          diagonal: true,
          cutCorners: false,
          heuristic: 'manhattan',
        }),
      ).toStrictEqual([
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [4, 5],
        [5, 6],
        [6, 5],
        [7, 4],
        [8, 4],
        [9, 4],
        [10, 4],
        [11, 4],
        [11, 5],
        [11, 6],
        [11, 7],
        [11, 8],
        [11, 9],
        [11, 10],
        [11, 11],
      ]);
    });

    test.concurrent('takes fresh snapshots in each search on mixed mutable grids', () => {
      const grid: Grid = [
        [0, { elevation: 0 }, 0],
        [0, 0, 0],
      ];

      expect(
        search({
          grid,
          from: [0, 0],
          to: [2, 0],
        }),
      ).toStrictEqual([
        [0, 0],
        [1, 0],
        [2, 0],
      ]);

      grid[0][1] = {
        elevation: 0,
        isLegal: false,
      };

      expect(
        search({
          grid,
          from: [0, 0],
          to: [2, 0],
        }),
      ).toStrictEqual([
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 0],
      ]);

      grid[1][1] = -1;

      expect(
        search({
          grid,
          from: [0, 0],
          to: [2, 0],
        }),
      ).toBeNull();
    });

    test.concurrent('keeps lazy tile reads and reports reachable ragged cells', () => {
      expect(() =>
        search({
          grid: [[0, 0], []],
          from: [0, 0],
          to: [1, 0],
        }),
      ).toThrow('Grid value is undefined');

      expect(
        search({
          grid: [
            [0, 0, -1],
            [0, 0],
          ],
          from: [0, 0],
          to: [1, 0],
        }),
      ).toStrictEqual([
        [0, 0],
        [1, 0],
      ]);
    });

    test.concurrent('captures endpoint identity before grid access without extra coordinate reads', () => {
      const from: Vector = [0, 0];
      const to: Vector = [2, 0];

      const reads: string[] = [];
      let initialReads: string[] | undefined;
      let targetX = 2;

      Object.defineProperties(from, {
        0: {
          get: () => {
            reads.push('from.x');

            return 0;
          },
        },
        1: {
          get: () => {
            reads.push('from.y');

            return 0;
          },
        },
      });

      Object.defineProperties(to, {
        0: {
          get: () => {
            reads.push('to.x');

            return targetX;
          },
        },
        1: {
          get: () => {
            reads.push('to.y');

            return 0;
          },
        },
      });

      const path = search({
        get from() {
          reads.push('from');

          return from;
        },
        get to() {
          reads.push('to');

          return to;
        },
        get grid() {
          initialReads ??= [...reads];
          targetX = 1;

          return [[0, 0, 0]];
        },
      });

      expect(initialReads).toStrictEqual(['from', 'from.x', 'from.y', 'to', 'to.x', 'to.y']);
      expect(path).toStrictEqual([
        [0, 0],
        [1, 0],
        [2, 0],
      ]);
    });

    test.concurrent('keeps callback vectors independent and supports reentrant searches', () => {
      const retained: Vector[] = [];
      let nested = false;

      const path = search({
        grid: [
          [0, 0, 0],
          [0, 0, 0],
        ],
        from: [0, 0],
        to: [2, 0],
        heuristic: (current) => {
          retained.push(current);

          if (!nested) {
            nested = true;
            expect(
              search({
                grid: [[0, 0]],
                from: [0, 0],
                to: [1, 0],
              }),
            ).toStrictEqual([
              [0, 0],
              [1, 0],
            ]);
          }

          return 0;
        },
      });

      expect(path).toStrictEqual([
        [0, 0],
        [1, 0],
        [2, 0],
      ]);
      expect(new Set(retained).size).toBe(retained.length);
      expect(retained[0]).toStrictEqual([1, 0]);
      expect(retained[1]).toStrictEqual([0, 1]);
    });

    test.concurrent('prepares neighbors before callbacks can change the origin', () => {
      const from: Vector = [0, 0];
      const seen: Vector[] = [];

      const path = search({
        grid: [
          [0, 0, 0],
          [0, 0, 0],
        ],
        from,
        to: [2, 0],
        heuristic: (current) => {
          seen.push([...current]);
          from[0] = 1;

          return 0;
        },
      });

      expect(path).toStrictEqual([
        [1, 0],
        [1, 0],
        [2, 0],
      ]);
      expect(seen.slice(0, 2)).toStrictEqual([
        [1, 0],
        [0, 1],
      ]);
    });

    test.concurrent('preserves custom mutation, exceptions, and nonfinite ordering', () => {
      expect(
        search({
          grid: [[0, 0, 0]],
          from: [0, 0],
          to: [2, 0],
          heuristic: (current) => {
            current[0] = 2;

            return 0;
          },
        }),
      ).toStrictEqual([
        [0, 0],
        [2, 0],
      ]);

      const failure = new Error('heuristic failure');

      expect(() =>
        search({
          grid: [[0, 0]],
          from: [0, 0],
          to: [1, 0],
          heuristic: () => {
            throw failure;
          },
        }),
      ).toThrow(failure);

      for (const value of [Number.NaN, Infinity, -Infinity]) {
        expect(
          search({
            grid: [[0, 0]],
            from: [0, 0],
            to: [1, 0],
            heuristic: () => value,
          }),
        ).toStrictEqual([
          [0, 0],
          [1, 0],
        ]);
      }
    });

    test.concurrent('snapshots object tiles once at first access', () => {
      let elevation = 0;
      let reads = 0;

      const middle = {
        get elevation() {
          reads++;

          return elevation;
        },
      };

      const path = search({
        grid: [[0, middle, 0]],
        from: [0, 0],
        to: [2, 0],
        heuristic: () => {
          elevation = 10;

          return 0;
        },
      });

      expect(path).toStrictEqual([
        [0, 0],
        [1, 0],
        [2, 0],
      ]);
      expect(reads).toBe(2);
    });
  });

  describe('movement', () => {
    test.concurrent('should pathfind vertically', () => {
      const path = search({
        from: [0, 0],
        to: [0, 7],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [0, 7],
      ]);
    });

    test.concurrent('should pathfind horizontally', () => {
      const path = search({
        from: [0, 6],
        to: [4, 6],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6],
      ]);
    });

    test.concurrent('should pathfind diagonally', () => {
      const path = search({
        cutCorners: false,
        diagonal: true,
        from: [0, 7],
        to: [2, 6],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [0, 7],
        [1, 6],
        [2, 6],
      ]);
    });

    test.concurrent('should pathfind diagonally in base directions', () => {
      const path = search({
        cutCorners: false,
        diagonal: false,
        from: [0, 7],
        to: [2, 6],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [0, 7],
        [1, 7],
        [1, 6],
        [2, 6],
      ]);
    });

    test.concurrent('should pathfind diagonally without cutting corner', () => {
      const path = search({
        cutCorners: false,
        diagonal: true,
        from: [1, 7],
        to: [2, 6],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [1, 7],
        [1, 6],
        [2, 6],
      ]);
    });

    test.concurrent('should pathfind diagonally with cutting corner', () => {
      const path = search({
        cutCorners: true,
        diagonal: true,
        from: [1, 7],
        to: [2, 6],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [1, 7],
        [2, 6],
      ]);
    });
  });

  describe('elevation constraints', () => {
    test.concurrent('should consider elevation when pathfinding', () => {
      const path = search({
        cutCorners: false,
        diagonal: true,
        from: [0, 0],
        to: [1, 0],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 4],
        [1, 3],
        [1, 2],
        [1, 1],
        [1, 0],
      ]);
    });

    test.concurrent('should allow differing step heights in elevation', () => {
      const path = search({
        cutCorners: false,
        diagonal: true,
        stepHeight: 2,
        from: [0, 0],
        to: [1, 0],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 3],
        [1, 2],
        [1, 1],
        [1, 0],
      ]);
    });

    test.concurrent('should not cut corners over elevated tiles', () => {
      const path = search({
        cutCorners: false,
        diagonal: true,
        from: [1, 0],
        to: [0, 3],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [0, 4],
        [0, 3],
      ]);
    });

    test.concurrent('should produce similar results with manhattan heuristic', () => {
      const path = search({
        heuristic: 'manhattan',
        cutCorners: false,
        diagonal: true,
        stepHeight: 2,
        from: [0, 0],
        to: [1, 0],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 3],
        [1, 2],
        [1, 1],
        [1, 0],
      ]);
    });
  });

  describe('destination handling', () => {
    test.concurrent('should pathfind if starting point is invalid tile', () => {
      const testGrid: Grid = [
        [-1, 5, 5, -1],
        [5, 5, 5, -1],
        [-1, -1, -1, -1],
      ];

      const path = search({
        grid: testGrid,
        from: [0, 0],
        to: [2, 0],
      });

      expect(path).toStrictEqual([
        [0, 0],
        [1, 0],
        [2, 0],
      ]);
    });

    test.concurrent('should not allow moving from illegal destination tile to larger than step elevation (lol)', () => {
      const path = search({
        cutCorners: false,
        diagonal: false,
        from: [7, 6],
        to: [7, 7],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual(null);
    });

    test.concurrent('should fail to pathfind when destination is illegal and invalid', () => {
      const path = search({
        cutCorners: false,
        diagonal: false,
        from: [4, 7],
        to: [6, 7],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [4, 7],
        [4, 6],
        [4, 5],
        [4, 4],
        [4, 3],
        [5, 3],
        [6, 3],
        [6, 4],
        [6, 5],
        [6, 6],
        [6, 7],
      ]);
    });

    test.concurrent('should allow pathfinding to illegal tile if valid as destination', () => {
      const path = search({
        cutCorners: false,
        diagonal: false,
        from: [4, 7],
        to: [5, 7],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [4, 7],
        [5, 7],
      ]);
    });

    test.concurrent('should allow pathfinding to illegal tile if valid as destination and correctly go over pathing', () => {
      const path = search({
        cutCorners: false,
        diagonal: false,
        from: [6, 2],
        to: [7, 2],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual([
        [6, 2],
        [6, 3],
        [7, 3],
        [7, 2],
      ]);
    });

    test.concurrent('should not pathfind to illegal tile that is valid as a destination but above step limit', () => {
      const path = search({
        cutCorners: false,
        diagonal: false,
        from: [7, 1],
        to: [7, 0],
        grid: makeGrid(),
      });

      expect(path).toStrictEqual(null);
    });
  });
});
