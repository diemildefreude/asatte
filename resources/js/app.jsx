import './bootstrap';
import '../css/app.css';
import './styles/reset.css';
import './styles/styles.css';

import { setupIframeResizer } from './utils/helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Layout from './Components/layout/Layout';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Asatte';

createInertiaApp({
    title: (title) => `${title} | ${appName}`,
    resolve: (name) => {
        const page = resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx'));
        page.then((module) => {
            if (module.default.layout === undefined) {
                module.default.layout = page => {
                    const isDash = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');
                    return <Layout isDashboard={isDash}>{page}</Layout>;
                };
            }
        });
        return page;
    },
    setup({ el, App, props }) {
        // Initialize global iframe resizer for Twitter embeds
        setupIframeResizer();

        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
