import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'], environment: 'node', fileParallelism: false,
    // Portable exports consume these as text; an empty CSS mock would hide missing fonts.
    css: { include: [/typography\.css/, /portable-font-faces\.css/] },
  },
});
