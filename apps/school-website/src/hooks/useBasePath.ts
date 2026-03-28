import { matchPath, useLocation } from 'react-router-dom';

/** '' for hostname routing, or `/site/:slug` when using path-based dev URLs */
export function useBasePath(): string {
    const { pathname } = useLocation();
    const m = matchPath({ path: '/site/:slug/*', end: false }, pathname);
    const slug = m?.params?.slug;
    return slug ? `/site/${slug}` : '';
}
