/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/store/slices/**/*', 'src/components/**/*', 'src/pages/**/*'],
            exclude: ['src/main.tsx', 'src/vite-env.d.ts', '**/*.test.tsx', '**/*.spec.ts']
        },
    },
});
