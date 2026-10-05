import { defineConfig } from 'oxlint';
import preset from '@devlsh/tools/oxlint';

export default defineConfig({
  extends: [preset],
  ignorePatterns: ['/CHANGELOG.md', 'dist/**', 'tests/grid.ts'],
  overrides: [
    {
      files: ['*.config.ts'],
      rules: {
        'import/extensions': 'off',
      },
    },
  ],
});
