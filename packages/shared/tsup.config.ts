import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/validators/index.ts', 'src/constants/index.ts', 'src/types/index.ts', 'src/api/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
});