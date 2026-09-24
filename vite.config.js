import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // Worktree của công cụ (.claude/worktrees/…) không thuộc repo — không quét test ở đó
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})
