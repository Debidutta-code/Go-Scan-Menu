import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import * as path from "path";

export default ({ mode }: any) => {
  // load env variables based on current mode (development, production, etc)
  const env = loadEnv(mode, process.cwd(), '');

  const shouldAnalyze = env.VITE_ANALYZE === 'true';
  console.log(`
    🌐 Mode: ${mode}
    📦 Visualizer: ${shouldAnalyze ? 'Yes' : 'No'}
  `);

  return defineConfig({
    plugins: [
      react(),
      ...(shouldAnalyze
        ? [
          visualizer({
            open: true,
            filename: './dist/stats.html',
            gzipSize: true,
            brotliSize: true,
          }),
        ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    },
    server: {}
  });
};
