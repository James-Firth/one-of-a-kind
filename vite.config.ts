import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths'; //This is because we use absolute import paths

export default defineConfig({
  plugins: [reactRefresh(), tsconfigPaths()],
  define: {
    'process.env.SERVER': '1',
  },
});
