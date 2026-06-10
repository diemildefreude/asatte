import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    define: {
        'process.env.REACT_APP_BACKEND_URL': JSON.stringify(''),
        'process.env.REACT_APP_FRONTEND_URL': JSON.stringify(''),
        'process.env.REACT_APP_NAME': JSON.stringify('netart'),
        'process.env.REACT_APP_USER_AGREEMENT_VERSION': JSON.stringify('1.0'),
        'process.env.REACT_APP_OAUTH_CLIENT_ID': JSON.stringify(''),
        'process.env.PASSPORT_CLIENT_SECRET': JSON.stringify(''),
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
});
