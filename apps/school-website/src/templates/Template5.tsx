import { useSchoolSite } from '@/context/SchoolSiteContext';
import { SchoolNavBar } from '@/components/school/SchoolNavBar';
import {
    AboutSection,
    AccreditationsBlock,
    EventsStrip,
    GalleryTeaser,
    GetInTouch,
    HeroClassic,
    NewsStrip,
    TestimonialCarousel,
    TextCard,
    ValuesGrid,
} from '@/components/school/SharedSections';
import { useBasePath } from '@/hooks/useBasePath';

/** Editorial: centered nav, serif, lots of whitespace */
export function Template5() {
    const { school, data, events, news, gallery, testimonials, accreditations, partnerships } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <div className="min-h-screen bg-[#fdfcfa]">
            <SchoolNavBar variant="centered" schoolName={name} logoUrl={school.logo ? String(school.logo) : undefined} basePath={basePath} />
            <HeroClassic data={data} schoolName={name} className="min-h-[45vh]" />
            <div className="mx-auto max-w-3xl px-6 py-20 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-school-text/50">Our story</p>
                <AboutSection data={data} className="!max-w-none !px-0 text-left" />
            </div>
            <TextCard title="School Anthem" body={data.schoolAnthem} />
            <TextCard title="School Pledge" body={data.schoolPledge} />
            <TextCard title="Principal’s Pledge" body={data.principalsPledge} />
            <TextCard title="Vision" body={data.vision} />
            <TextCard title="Mission" body={data.mission} />
            <ValuesGrid values={data.coreValues} />
            <TextCard title="From the Principal" body={data.welcomeAddress} />
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
