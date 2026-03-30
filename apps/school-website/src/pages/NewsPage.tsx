import type { Models } from 'appwrite';
import { Card, CardContent } from '@/components/ui/card';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { newsImage } from '@/lib/media';
import { Button } from '@/components/ui/button';

export function NewsPage() {
    const { news } = useSchoolSite();

    return (
        <SchoolSubPage title="School News & Updates" subtitle="The latest announcements and stories from across our campus.">
            <div className="grid gap-12">
                {news.map((n: Models.Document) => (
                    <article key={n.$id} className="grid md:grid-cols-12 gap-8 items-start group">
                        <div className="md:col-span-4 lg:col-span-3">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                                {newsImage(n as any) ? (
                                    <img src={newsImage(n as any)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <span className="text-slate-300 font-bold uppercase tracking-widest text-xs">No Image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-8 lg:col-span-9 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="bg-[var(--school-primary)]/10 text-[var(--school-primary)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Update</span>
                                <time className="text-slate-400 text-xs font-medium uppercase tracking-widest">{new Date((n as any).$createdAt).toLocaleDateString()}</time>
                            </div>
                            <h2 className="font-[var(--school-font-display)] text-3xl font-bold text-[var(--school-text)] group-hover:text-[var(--school-primary)] transition-colors">{String((n as any).title || '')}</h2>
                            <p className="text-[var(--school-text)] opacity-70 leading-relaxed text-lg max-w-4xl">
                                {String((n as any).summary || (n as any).body || '').slice(0, 300)}...
                            </p>
                            <Button variant="ghost" className="p-0 h-auto text-[var(--school-primary)] font-bold uppercase tracking-widest text-xs hover:bg-transparent hover:opacity-70">
                                Read Full Article →
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
            {news.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No news articles yet. Check back soon!</p>
                </div>
            ) : null}
        </SchoolSubPage>
    );
}
