import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/ac-panel.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    typescript({
      declaration: false,
      declarationMap: false,
    }),
    copy({
      targets: [
        { src: 'src/translations/**/*', dest: 'dist/translations' },
      ],
    }),
    terser({
      output: {
        comments: false,
      },
    }),
  ],
  external: ['lit', 'custom-card-helpers'],
};
