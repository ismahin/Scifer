import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: '0.0.0.0' },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      preserveEntrySignatures: false,
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'webgl-engine', test: /node_modules[\\/]three[\\/]/ },
            { name: 'three-react', test: /node_modules[\\/](@react-three|three-stdlib)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](gsap|lenis|framer-motion|motion-dom|motion-utils)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-reconciler|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
})
