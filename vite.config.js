import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative assets work both at / and /repository-name/ on GitHub Pages.
export default defineConfig({ plugins: [react()], base: './' });
