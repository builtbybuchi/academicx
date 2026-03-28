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

/** Classic stacked layout — serif hero, light sections */
export function Template1() {
    const { school, data, events, news, gallery, testimonials, accreditations, partnerships } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <div className="min-h-screen bg-school-background">
            <SchoolNavBar variant="classic" schoolName={name} logoUrl={school.logo ? String(school.logo) : undefined} basePath={basePath} />
            <HeroClassic data={data} schoolName={name} />
            <AboutSection data={data} />
            <TextCard title="School Anthem" body={data.schoolAnthem} />
            <TextCard title="School Pledge" body={data.schoolPledge} />
            <TextCard title="Principal’s Pledge" body={data.principalsPledge} />
            <TextCard title="Vision Statement" body={data.vision} />
            <TextCard title="Mission Statement" body={data.mission} />
            <ValuesGrid values={data.coreValues} />
            <TextCard title="Welcome Address from the Principal" body={data.welcomeAddress} />
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
