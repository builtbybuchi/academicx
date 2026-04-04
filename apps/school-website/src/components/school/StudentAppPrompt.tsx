import { Button } from '@/components/ui/button';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Download, Smartphone } from 'lucide-react';

export function StudentAppPrompt({ schoolId }: { schoolId: string }) {
    const { systemConfig, school } = useSchoolSite();
    const apkUrl = systemConfig?.apkUrl || '#';
    const name = (school as any)?.name || 'the school';

    return (
        <div className="relative overflow-hidden rounded-3xl bg-[var(--school-primary)] p-8 text-white shadow-2xl border border-white/10">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Smartphone size={32} />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">Download your school app</h3>
                    <p className="opacity-80 max-w-md">For the best experience, stay connected with all school activities directly from your mobile device.</p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                    <Button size="lg" className="bg-white text-[var(--school-primary)] hover:bg-white/90 rounded-xl font-bold px-8 h-14" asChild>
                        <a href={apkUrl} target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-5 w-5" />
                            Download APK
                        </a>
                    </Button>
                    <p className="text-[10px] uppercase tracking-widest text-center opacity-60">Direct Download • Secure APK</p>
                </div>
            </div>
        </div>
    );
}
