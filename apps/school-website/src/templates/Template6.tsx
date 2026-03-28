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

/** Bold / high-contrast borders, poster-like hero */
export function Template6() {
    const { school, data, events, news, gallery, testimonials, accreditations, partnerships } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <div className="min-h-screen border-x-4 border-school-text bg-school-background">
            <SchoolNavBar variant="bold" schoolName={name} logoUrl={school.logo ? String(school.logo) : undefined} basePath={basePath} />
            <HeroClassic data={data} schoolName={name} />
            <AboutSection data={data} />
            <TextCard title="School Anthem" body={data.schoolAnthem} />
            <TextCard title="School Pledge" body={data.schoolPledge} />
            <TextCard title="Principal’s Pledge" body={data.principalsPledge} />
            <TextCard title="Vision" body={data.vision} />
            <TextCard title="Mission" body={data.mission} />
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
