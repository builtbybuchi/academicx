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

/** Magazine-style: wide hero, asymmetric content blocks */
export function Template3() {
    const { school, data, events, news, gallery, testimonials, accreditations, partnerships } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <div className="min-h-screen bg-[#f4f1ea]">
            <SchoolNavBar variant="pill" schoolName={name} logoUrl={school.logo ? String(school.logo) : undefined} basePath={basePath} />
            <HeroClassic data={data} schoolName={name} className="min-h-[70vh]" />
            <div className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <AboutSection data={data} className="!px-0 !py-0" />
                    </div>
                    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-lg">
                        <h3 className="font-display text-xl font-bold">Quick facts</h3>
                        <TextCard title="Vision" body={data.vision} className="!py-2" />
                        <TextCard title="Mission" body={data.mission} className="!py-2" />
                    </div>
                </div>
            </div>
            <TextCard title="School Anthem" body={data.schoolAnthem} />
            <TextCard title="School Pledge" body={data.schoolPledge} />
            <TextCard title="Principal’s Pledge" body={data.principalsPledge} />
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
