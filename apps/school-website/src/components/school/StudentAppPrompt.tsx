import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIosDevice } from '@/hooks/useIosDevice';
import { cn } from '@/lib/utils';

const PLAY = 'https://play.google.com/store/apps/details?id=com.academicx.student';
const IOS = 'https://apps.apple.com/';
const APK = 'https://academicxlanding.onrender.com/downloads';

function storageKey(schoolId: string) {
    return `academicx_app_prompt_${schoolId}`;
}

export function StudentAppPrompt({ schoolId }: { schoolId: string }) {
    const ios = useIosDevice();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (ios) return;
        try {
            if (sessionStorage.getItem(storageKey(schoolId))) return;
        } catch {
            /* ignore */
        }
        setOpen(true);
    }, [schoolId, ios]);

    function dismiss() {
        setOpen(false);
        try {
            sessionStorage.setItem(storageKey(schoolId), '1');
        } catch {
            /* ignore */
        }
    }

    if (ios || !open) return null;

    return (
        <div
            className={cn(
                'fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-black/10 bg-white p-4 shadow-xl',
                'animate-in slide-in-from-bottom-4',
            )}
            role="dialog"
            aria-label="Download mobile app"
        >
            <button type="button" className="absolute right-2 top-2 rounded p-1 hover:bg-black/5" onClick={dismiss} aria-label="Close">
                <X className="h-4 w-4" />
            </button>
            <p className="pr-6 text-sm font-medium text-school-text">For the best experience, download our mobile app!</p>
            <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                    <a href={PLAY} target="_blank" rel="noreferrer">
                        Google Play
                    </a>
                </Button>
                <Button size="sm" variant="accent" asChild>
                    <a href={APK} target="_blank" rel="noreferrer">
                        Direct APK
                    </a>
                </Button>
            </div>
        </div>
    );
}
