import { useEffect, useState } from 'react';

/** True when the browser is likely Safari on iPhone/iPad (hide “download app” promo). */
export function useIosDevice(): boolean {
    const [ios, setIos] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const isIosUa = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        setIos(isIosUa);
    }, []);

    return ios;
}
