import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const baseline = mode === 'compare' ? process.env.BENCH_BASELINE : undefined;

  return {
    test: {
      benchmark: { include: ['bench/**/*.bench.ts'] },
      fileParallelism: false,
      maxWorkers: 1,
      projects: (['quick', 'full'] as const).map((name) => ({
        extends: true,
        test: {
          name,
          pool: 'forks',
          testTimeout: 0,
          provide: {
            benchmarkSuite: name,
            benchmarkMode: mode,
            benchmarkBaseline:
              baseline === undefined || baseline === ''
                ? null
                : resolve(fileURLToPath(new URL('.', import.meta.url)), baseline, '.vitest/benchmarks'),
          },
        },
      })),
    },
  };
});
