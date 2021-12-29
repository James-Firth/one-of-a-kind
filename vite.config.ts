import reactRefresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'
import shimReactPdf from 'vite-plugin-shim-react-pdf'
import tsconfigPaths from 'vite-tsconfig-paths' //This is because we use absolute import paths
export default defineConfig({
  plugins: [reactRefresh(), tsconfigPaths(), shimReactPdf()],
  define: {
    'process.env.SERVER': '1',
  },
})
