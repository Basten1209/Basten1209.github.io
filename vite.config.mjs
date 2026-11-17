import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cpSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/',
  publicDir: false,
  resolve: { alias: { '@': path.join(root, 'src') } },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'portfolio-static-files',
      closeBundle() {
        for (const file of ['data', 'assets/images', 'CNAME', 'robots.txt']) {
          if (existsSync(path.join(root, file)))
            cpSync(path.join(root, file), path.join(root, 'dist', file), { recursive: true })
        }
      },
    },
  ],
})
