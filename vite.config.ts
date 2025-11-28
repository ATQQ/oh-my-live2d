import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'L2DWidget',
      fileName: format => `index${format === 'umd' ? '.min' : ''}.js`,
      formats: ['es', 'umd'],
    },
  },
  plugins: [
    dts()
  ]
});
