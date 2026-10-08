import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type BaselineData, type BenchFromSource } from 'vitest';
import { type Suite } from './fixtures';

export function baselineFrom(directory: string, suite: Suite, id: string): BenchFromSource {
  const path = join(directory, suite, `${id}.json`);

  return async () => {
    try {
      // SAFETY: References come from native Vitest capture, not arbitrary JSON.
      return JSON.parse(await readFile(path, 'utf8')) as BaselineData;
    } catch (error) {
      throw new Error(`Cannot read BENCH_BASELINE reference "${path}".`, { cause: error });
    }
  };
}
