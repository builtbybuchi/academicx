import { matchPath, Outlet, useLocation } from 'react-router-dom';
import { SchoolSiteProvider } from '@/context/SchoolSiteContext';
import { useHostSlug } from '@/hooks/useHostSlug';

export function SchoolLayout() {
    const { pathname } = useLocation();
    const hostSlug = useHostSlug();
    const siteMatch =
        matchPath({ path: '/site/:slug/*', end: false }, pathname) || matchPath({ path: '/site/:slug', end: false }, pathname);
    const slug = siteMatch?.params?.slug || hostSlug || import.meta.env.VITE_DEV_SCHOOL_SLUG || '';

    if (!slug) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-school-background px-6 text-center text-school-text">
                <p className="max-w-lg text-lg">
                    Point a subdomain at this dev server (e.g. <code className="rounded bg-black/10 px-1">demo.buchis.site</code>) or open{' '}
                    <code className="rounded bg-black/10 px-1">/site/yourslug</code>.
                </p>
                <p className="mt-4 text-sm text-school-text/70">
                    Optional: set <code className="rounded bg-black/10 px-1">VITE_DEV_SCHOOL_SLUG</code> in <code>.env</code>.
                </p>
            </div>
        );
    }

    return (
        <SchoolSiteProvider slug={slug}>
            <Outlet />
        </SchoolSiteProvider>
    );
}
