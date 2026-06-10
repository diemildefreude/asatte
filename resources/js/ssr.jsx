import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Layout from './Components/layout/Layout';

const appName = 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => {
            const pagePromise = resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx', { eager: true }));
            
            // To support layout property being dynamically assigned
            // Since eager:true is used for SSR, resolvePageComponent returns the module directly or a promise
            // Actually eager: true returns the module synchronously if not a promise, but wait, resolvePageComponent handles eager glob correctly.
            // Let's resolve the layout if it's missing.
            
            // Wait, import.meta.glob with eager: true returns modules synchronously. 
            // So we can just return the module and modify it.
            return pagePromise.then((module) => {
                if (module.default.layout === undefined) {
                    module.default.layout = page => {
                        // We cannot use window in SSR. Determine dashboard from URL.
                        // The page object has the URL.
                        const isDash = page.url.startsWith('/dashboard');
                        return <Layout isDashboard={isDash}>{page}</Layout>;
                    };
                }
                return module;
            }).catch(() => {
                // Fallback for eager:true which might return the module directly
                const module = pagePromise;
                if (module && module.default && module.default.layout === undefined) {
                    module.default.layout = page => {
                        const isDash = page.props.ziggy?.location?.startsWith('/dashboard') || false; // Or simpler, just check path if possible
                        // We can also just check page.url which is available in SSR
                        return <Layout>{page}</Layout>;
                    };
                }
                return module;
            });
        },
        setup: ({ App, props }) => <App {...props} />,
    })
);
