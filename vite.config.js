import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// В App.jsx стили импортируются как ТЕКСТ:  import STYLES from "./styles.css"
// и вставляются через <style>{STYLES}</style>.
// Vite по умолчанию так не умеет — добавляем свой плагин.
function cssAsString() {
  return {
    name: "css-as-string",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("styles.css")) return null;
      return {
        code: `export default ${JSON.stringify(code)};`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [cssAsString(), react({ include: "**/*.{js,jsx}" })],

  // Разрешаем JSX внутри .js файлов — на случай, если где-то остался
  esbuild: { loader: "jsx", include: /src\/.*\.[jt]sx?$/ },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },

  // ВАЖНО: для GitHub Pages укажите имя репозитория, например "/kalibri-messenger/".
  // Для Vercel, Netlify и своего домена оставьте "/".
  base: "/",

  build: {
    outDir: "dist",
    sourcemap: false,
    // Разбиваем на части: React отдельно — он меняется редко и будет кешироваться
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          icons: ["lucide-react"],
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },
});
