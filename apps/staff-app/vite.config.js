import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            appwrite: path.resolve(__dirname, 'node_modules/appwrite'),
        },
    },
    server: { port: 3002 },
});
