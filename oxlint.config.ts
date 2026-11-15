import preset from '@devlsh/tools/oxlint';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [preset],
  ignorePatterns: ['/CHANGELOG.md', 'tests/grid.ts'],
});
