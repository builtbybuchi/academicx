import { useSchoolSite } from '@/context/SchoolSiteContext';
import { SchoolNavBar } from '@/components/school/SchoolNavBar';
import {
    AboutSection,
    AccreditationsBlock,
    EventsStrip,
    GalleryTeaser,
    GetInTouch,
    NewsStrip,
    TestimonialCarousel,
    TextCard,
    ValuesGrid,
} from '@/components/school/SharedSections';
import { useBasePath } from '@/hooks/useBasePath';
import { resolveHeroImage } from '@/lib/media';
import { cn } from '@/lib/utils';

/** Split hero + news-first ordering, minimal chrome */
export function Template2() {
    const { school, data, events, news, gallery, testimonials, accreditations, partnerships } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;
    const name = String(school.name || 'School');
    const bg = resolveHeroImage(data);

    return (
        <div className="min-h-screen bg-school-background">
            <SchoolNavBar variant="minimal" schoolName={name} logoUrl={school.logo ? String(school.logo) : undefined} basePath={basePath} />
            <section className="grid min-h-[50vh] lg:grid-cols-2">
                <div
                    className={cn(
                        'relative flex flex-col justify-center px-6 py-16 lg:px-12',
                        !bg && 'bg-gradient-to-br from-school-primary/90 to-school-secondary/80 text-white',
                    )}
                >
                    {bg ? <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                    {bg ? <div className="absolute inset-0 bg-school-primary/70" /> : null}
                    <div className="relative z-10">
                        <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">{data.hero.headline}</h1>
                        <p className="mt-4 max-w-lg text-lg text-white/90">{data.hero.subheadline}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-center bg-white px-6 py-12 lg:px-12">
                    <h2 className="font-display text-2xl font-bold text-school-text">Latest News</h2>
                    <ul className="mt-6 space-y-4">
                        {news.slice(0, 3).map((n) => (
                            <li key={n.$id} className="border-b border-black/10 pb-3 text-school-text">
                                <span className="font-semibold">{String(n.title || '')}</span>
                                <p className="mt-1 line-clamp-2 text-sm text-school-text/70">{String(n.summary || '')}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            <NewsStrip docs={news} basePath={basePath} />
            <EventsStrip docs={events} basePath={basePath} />
            <AboutSection data={data} className="bg-white" />
            <TextCard title="School Anthem" body={data.schoolAnthem} />
            <TextCard title="School Pledge" body={data.schoolPledge} />
            <TextCard title="Principal’s Pledge" body={data.principalsPledge} />
            <TextCard title="Vision" body={data.vision} />
            <TextCard title="Mission" body={data.mission} />
            <ValuesGrid values={data.coreValues} />
            <TextCard title="Welcome from the Principal" body={data.welcomeAddress} />
            <AccreditationsBlock title="Accreditations" docs={accreditations} />
            <AccreditationsBlock title="Partnerships" docs={partnerships} />
            <GalleryTeaser docs={gallery} basePath={basePath} />
            <TestimonialCarousel docs={testimonials} />
            <GetInTouch data={data} schoolId={school.$id} basePath={basePath} />
        </div>
    );
}
