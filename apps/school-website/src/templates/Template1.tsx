import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SchoolNavBar } from '@/components/school/SchoolNavBar';
import { 
    SchoolAnthemBlock, 
    SchoolPledgeBlock, 
    VisionMissionBlock, 
    CoreValuesBlock, 
    WelcomeAddressBlock,
    EventsSection,
    NewsSection,
    GallerySection,
    ContactSection
} from './SharedTemplateComponents';

export function Template1Layout({ children }: { children: React.ReactNode }) {
    const { data, school } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;

    return (
        <div 
            className="min-h-screen bg-[var(--school-background)] text-[var(--school-text)] font-[var(--school-font-body)]"
            style={{ 
                '--school-primary': data.colors.primary,
                '--school-secondary': data.colors.secondary,
                '--school-accent': data.colors.accent,
                '--school-background': data.colors.background,
                '--school-text': data.colors.text,
            } as React.CSSProperties}
        >
            <SchoolNavBar 
                schoolName={String((school as any).name || 'School')} 
                logoUrl={(school as any).logo} 
                basePath={basePath} 
                variant="classic"
            />
            {children}
        </div>
    );
}

/** 
 * Template 1 – Classic, Stacked, Serif Hero
 * Deep navy + gold + cream feel
 */
export function Template1() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Hero */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                {data.hero.imageUrl && (
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={data.hero.imageUrl} 
                            alt="Hero" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>
                )}
                <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-md">
                        {data.hero.headline || "Excellence Since 1985"}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {data.hero.subheadline || "Empowering minds, building character, and shaping the future of tomorrow."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Button size="lg" className="bg-white text-[var(--school-primary)] hover:bg-white/90 px-10 text-lg">
                            Take a Tour
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-10 text-lg">
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <main className="space-y-20 py-20">
                <div className="container mx-auto px-4">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </div>

                <div className="bg-[var(--school-primary)]/5 py-20">
                    <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 text-[var(--school-primary)]">About Our School</h2>
                            <p className="text-lg leading-relaxed mb-8 opacity-90">
                                {data.about.body}
                            </p>
                            <Button variant="outline" className="border-[var(--school-primary)] text-[var(--school-primary)]">
                                Read Full History
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {data.about.imageUrls?.slice(1, 3).map((url, i) => (
                                <img key={i} src={url} alt={`About ${i}`} className="rounded-lg shadow-lg aspect-square object-cover" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                        <VisionMissionBlock vision={data.vision} mission={data.mission} />
                        <CoreValuesBlock values={data.coreValues} />
                    </div>
                    <aside className="space-y-8">
                        <div className="bg-[var(--school-primary)]/5 p-8 rounded-2xl border border-[var(--school-primary)]/10">
                            <h3 className="text-xl font-bold mb-4 text-[var(--school-primary)]">About Us</h3>
                            <p className="text-sm opacity-70 leading-relaxed italic">Dedicated to excellence in education and holistic development of our students since our foundation.</p>
                        </div>
                    </aside>
                </div>

                <EventsSection events={events} basePath={basePath} />
                <NewsSection news={news} basePath={basePath} />
                <GallerySection images={gallery} basePath={basePath} />
                <ContactSection data={data.contact} schoolId={school.$id} />
            </main>
        </>
    );
}
