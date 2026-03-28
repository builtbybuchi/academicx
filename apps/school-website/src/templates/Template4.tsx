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

/** Tech / geometric — dark nav band, diagonal emphasis */
export function Template4() {
    const { school, data, events, news, gallery, testimonials, accreditations, partnerships } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;
    const name = String(school.name || 'School');
    const bg = resolveHeroImage(data);

    return (
        <div className="min-h-screen bg-school-background">
            <SchoolNavBar variant="split" schoolName={name} logoUrl={school.logo ? String(school.logo) : undefined} basePath={basePath} />
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 skew-y-2 scale-110 bg-school-accent/15" aria-hidden />
                <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-20 md:grid-cols-2">
                    <div>
                        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-school-text md:text-5xl">{data.hero.headline}</h1>
                        <p className="mt-4 text-lg text-school-text/80">{data.hero.subheadline}</p>
                    </div>
                    <div className="aspect-video overflow-hidden rounded-2xl shadow-2xl">
                        {bg ? (
                            <img src={bg} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-school-primary to-school-secondary" />
                        )}
                    </div>
                </div>
            </section>
            <AboutSection data={data} />
            <TextCard title="School Anthem" body={data.schoolAnthem} />
            <TextCard title="School Pledge" body={data.schoolPledge} />
            <TextCard title="Principal’s Pledge" body={data.principalsPledge} />
            <TextCard title="Vision Statement" body={data.vision} />
            <TextCard title="Mission Statement" body={data.mission} />
            <ValuesGrid values={data.coreValues} />
            <TextCard title="Welcome Address" body={data.welcomeAddress} />
            <EventsStrip docs={events} basePath={basePath} />
            <NewsStrip docs={news} basePath={basePath} />
            <AccreditationsBlock title="Accreditations" docs={accreditations} />
            <AccreditationsBlock title="Partnerships" docs={partnerships} />
            <GalleryTeaser docs={gallery} basePath={basePath} />
            <TestimonialCarousel docs={testimonials} />
            <GetInTouch data={data} schoolId={school.$id} basePath={basePath} />
        </div>
    );
}
