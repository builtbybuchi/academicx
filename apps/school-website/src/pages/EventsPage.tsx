import type { Models } from 'appwrite';
import { Card, CardContent } from '@/components/ui/card';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { eventImage } from '@/lib/media';

export function EventsPage() {
    const { events } = useSchoolSite();

    return (
        <SchoolSubPage title="Events">
            <div className="grid gap-6 md:grid-cols-2">
                {events.map((e: Models.Document) => (
                    <Card key={e.$id} className="overflow-hidden">
                        {eventImage(e) ? (
                            <img src={eventImage(e)} alt="" className="h-48 w-full object-cover" />
                        ) : (
                            <div className="h-48 bg-school-primary/10" />
                        )}
                        <CardContent className="p-6">
                            <p className="text-sm text-school-text/60">{String(e.date || '')}</p>
                            <h2 className="mt-2 font-display text-xl font-semibold text-school-text">{String(e.title || '')}</h2>
                            <p className="mt-2 whitespace-pre-wrap text-school-text/80">{String(e.description || '')}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {events.length === 0 ? <p className="text-school-text/70">No events published yet.</p> : null}
        </SchoolSubPage>
    );
}
