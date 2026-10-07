import { search as publicSearch } from '@devlsh/astar';
import { inject, test } from 'vitest';
import { baselineFrom } from './baseline';
import { fixtures, select, type Suite } from './fixtures';

declare module 'vitest' {
  interface ProvidedContext {
    benchmarkSuite: Suite;
    benchmarkMode: string;
    benchmarkBaseline: string | null;
  }
}

const selection = inject('benchmarkSuite');

const mode = inject('benchmarkMode');

const baselineDirectory = inject('benchmarkBaseline');

const search = publicSearch;

const config = {
  warmupTime: 250 * (mode === 'double-warmup' ? 2 : 1),
  warmupIterations: selection === 'quick' ? 16 : 4,
  time: 250,
  iterations: 32,
};

const workloads = fixtures();

const selected = new Set(select(selection).map((entry) => entry.id));

for (const workload of workloads) {
  if (!selected.has(workload.id)) {
    continue;
  }

  const { queries } = workload;
  let sink = 0;

  test(workload.name, async ({ bench }) => {
    const baseline = `.vitest/astar/${selection}/${workload.id}.json`;
    const candidate = `.vitest/astar/${selection}/current/${workload.id}.json`;

    const current = bench(
      'current (4 searches)',
      {
        async: false,
        writeResult: mode === 'capture' ? baseline : mode === 'compare' ? candidate : undefined,
      },
      () => {
        for (const query of queries) {
          const result = search(query);
          const end = result?.at(-1);
          sink += result ? result.length + (end?.[0] ?? 0) + (end?.[1] ?? 0) + 1 : 1;
        }
      },
    );

    await (mode === 'compare'
      ? bench.compare(
          bench.from(
            'baseline (4 searches)',
            baselineDirectory === null ? baseline : baselineFrom(baselineDirectory, selection, workload.id),
          ),
          current,
          config,
        )
      : current.run(config));
  });
}
