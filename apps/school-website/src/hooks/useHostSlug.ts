import { useEffect, useState } from 'react';

/** First subdomain label for multi-tenant hosts, e.g. demo.buchis.site → demo */
export function useHostSlug(): string | null {
    const [slug, setSlug] = useState<string | null>(null);

    useEffect(() => {
        const h = window.location.hostname;
        if (h === 'localhost' || h === '127.0.0.1') {
            setSlug(null);
            return;
        }
        if (h.endsWith('.localhost')) {
            const sub = h.split('.')[0];
            setSlug(sub && sub !== 'www' ? sub : null);
            return;
        }
        const parts = h.split('.');
        if (parts.length >= 3) {
            const sub = parts[0];
            setSlug(sub && sub !== 'www' ? sub : null);
            return;
        }
        setSlug(null);
    }, []);

    return slug;
}
