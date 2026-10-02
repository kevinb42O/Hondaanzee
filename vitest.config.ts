import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '.admin-local/**', 'dist/**', 'dist-ssr/**'],
  },
});
