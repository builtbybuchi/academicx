import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SchoolNavBar } from '@/components/school/SchoolNavBar';
import { 
    VisionMissionBlock, 
    CoreValuesBlock, 
    EventsSection,
    NewsSection,
    GallerySection,
    ContactSection,
    WelcomeAddressBlock
} from './SharedTemplateComponents';

export function Template5Layout({ children }: { children: React.ReactNode }) {
    const { school, data } = useSchoolSite();
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
 * Template 5 – Editorial, Serif, Airy
 * Soft sage green + warm beige + deep charcoal
 */
export function Template5() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Airy Full-screen Hero */}
            <section className="relative h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FDFCF9] via-transparent to-[#FDFCF9] z-10" />
                {data.hero.imageUrl && (
                    <img 
                        src={data.hero.imageUrl} 
                        alt="Hero" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
                    />
                )}
                <div className="relative z-20 text-center space-y-12 max-w-5xl">
                    <span className="text-xs uppercase tracking-[0.5em] opacity-40">Founded in Excellence</span>
                    <h2 className="text-6xl md:text-8xl font-light leading-[1.1] tracking-tight">
                        {data.hero.headline}
                    </h2>
                    <p className="text-xl md:text-2xl font-light opacity-60 max-w-2xl mx-auto leading-relaxed italic">
                        {data.hero.subheadline}
                    </p>
                    <div className="pt-8">
                        <Button variant="ghost" className="text-xs uppercase tracking-[0.4em] hover:bg-black/5 px-12 py-8 border border-black/10">
                            Discover the Legacy
                        </Button>
                    </div>
                </div>
            </section>

            {/* Editorial Content */}
            <main className="py-40 space-y-60">
                <section className="container mx-auto px-6">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </section>

                {/* About - Two Column Editorial */}
                <section className="container mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">Our Story</span>
                            <h3 className="text-4xl md:text-5xl font-light">An Institution of Purpose</h3>
                        </div>
                        <p className="text-lg leading-[1.8] opacity-60">
                            {data.about.body}
                        </p>
                        <div className="pt-6">
                            <Link to={`${basePath}/about`} className="text-xs uppercase tracking-[0.4em] font-bold border-b border-black pb-2 hover:opacity-50 transition-opacity">Learn More</Link>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/5] bg-gray-100 overflow-hidden shadow-2xl">
                            {data.about.imageUrls?.[1] && <img src={data.about.imageUrls[1]} alt="About" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />}
                        </div>
                        <div className="absolute -bottom-12 -left-12 w-64 h-80 bg-[#F4F1EA] -z-10 shadow-lg" />
                    </div>
                </section>

                {/* Vision/Mission - Airy Grid */}
                <section className="bg-[#F4F1EA] py-40">
                    <div className="container mx-auto px-6">
                        <VisionMissionBlock vision={data.vision} mission={data.mission} />
                    </div>
                </section>

                {/* Core Values - Minimalist Icons */}
                <section className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl font-light tracking-widest uppercase mb-4">Our Core Tenets</h2>
                        <div className="w-16 h-px bg-black/20 mx-auto" />
                    </div>
                    <CoreValuesBlock values={data.coreValues} />
                </section>

                <div className="space-y-40">
                    <EventsSection events={events} basePath={basePath} />
                    <NewsSection news={news} basePath={basePath} />
                    <GallerySection images={gallery} basePath={basePath} />
                    <ContactSection data={data.contact} schoolId={school.$id} />
                </div>
            </main>
        </>
    );
}
