import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
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
        },
      },
    })),
  },
}));
