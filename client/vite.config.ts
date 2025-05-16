import path from "path"
import tailwindcss from "@tailwindcss/vite"
import svgr from "@svgr/rollup"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@client": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "./src"), // duplicate because it makes shadcn life easier
      "@server": path.resolve(__dirname, "../server/src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
    }
  }
})
