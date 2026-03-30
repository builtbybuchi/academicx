import type { Models } from 'appwrite';
import { Card, CardContent } from '@/components/ui/card';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { eventImage } from '@/lib/media';
import { Button } from '@/components/ui/button';

export function EventsPage() {
    const { events } = useSchoolSite();

    return (
        <SchoolSubPage title="Events & Calendar" subtitle="Stay updated with our latest school activities and important dates.">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {events.map((e: Models.Document) => (
                    <Card key={e.$id} className="overflow-hidden border-none shadow-xl shadow-black/5 bg-white group">
                        <div className="aspect-video relative overflow-hidden">
                            {eventImage(e as any) ? (
                                <img src={eventImage(e as any)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-[var(--school-primary)]/10 flex items-center justify-center">
                                    <span className="text-[var(--school-primary)] font-bold opacity-20 uppercase tracking-widest text-xs">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-md shadow-sm">
                                <span className="text-[var(--school-primary)] font-bold text-xs uppercase tracking-widest">{String((e as any).date || '').split(' ')[0]}</span>
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <h2 className="font-[var(--school-font-display)] text-2xl font-bold text-[var(--school-text)] mb-4">{String((e as any).title || '')}</h2>
                            <p className="text-[var(--school-text)] opacity-70 leading-relaxed line-clamp-3 mb-6">
                                {String((e as any).description || '')}
                            </p>
                            <Button variant="ghost" className="p-0 h-auto text-[var(--school-primary)] font-bold hover:bg-transparent hover:opacity-70 transition-all uppercase tracking-widest text-xs">
                                Read More →
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {events.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No events published yet. Stay tuned!</p>
                </div>
            ) : null}
        </SchoolSubPage>
    );
}
