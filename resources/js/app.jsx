import './bootstrap';
import '../css/app.css';
import './styles/reset.css';
import './styles/styles.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './Components/layout/Layout';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
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
        const root = createRoot(el);

        root.render(
            <AuthProvider initialPage={props.initialPage}>
                <App {...props} />
            </AuthProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
