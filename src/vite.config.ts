import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui'
    ]
  }
});
