import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            appwrite: path.resolve(__dirname, 'node_modules/appwrite'),
            shared: path.resolve(__dirname, '../../shared'),
            'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion'),
            'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
        },
    },
    server: { port: 3004 },
});
