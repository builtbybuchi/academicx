import type { Models } from 'appwrite';
import { Card, CardContent } from '@/components/ui/card';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { newsImage } from '@/lib/media';

export function NewsPage() {
    const { news } = useSchoolSite();

    return (
        <SchoolSubPage title="News">
            <div className="space-y-8">
                {news.map((n: Models.Document) => (
                    <Card key={n.$id} className="overflow-hidden md:flex">
                        {newsImage(n) ? (
                            <img src={newsImage(n)} alt="" className="h-56 w-full object-cover md:w-72" />
                        ) : (
                            <div className="h-56 w-full bg-school-secondary/15 md:w-72" />
                        )}
                        <CardContent className="p-8">
                            <h2 className="font-display text-2xl font-semibold text-school-text">{String(n.title || '')}</h2>
                            <p className="mt-4 whitespace-pre-wrap text-school-text/85">{String(n.body || n.summary || '')}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {news.length === 0 ? <p className="text-school-text/70">No news yet.</p> : null}
        </SchoolSubPage>
    );
}
