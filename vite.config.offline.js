import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build offline: xuất dist-offline/index.html — mọi JS, CSS, font nhúng inline.
// Mở bằng file:// khi tắt mạng, không cần server.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-offline',
    assetsInlineLimit: 100_000_000, // nhúng mọi asset (font, ảnh) vào bundle
    cssCodeSplit: false,
  },
  test: {
    environment: 'node',
  },
})
