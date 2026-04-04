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

export function Template6Layout({ children }: { children: React.ReactNode }) {
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
 * Template 6 – Poster, High-Contrast Borders
 * Black + white + vibrant accent
 */
export function Template6() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Poster Hero */}
            <section className="relative h-[80vh] flex items-center border-b-8 border-black overflow-hidden bg-[var(--school-primary)]">
                <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 bg-white p-12 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                        <h1 className="text-6xl md:text-8xl leading-none uppercase tracking-tighter">
                            {data.hero.headline}
                        </h1>
                        <p className="text-xl opacity-80 uppercase tracking-tight">
                            {data.hero.subheadline}
                        </p>
                        <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-none px-12 py-8 text-xl uppercase tracking-tighter">
                            Join the Movement
                        </Button>
                    </div>
                    <div className="hidden lg:block">
                        <div className="border-8 border-black p-4 bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                            {data.hero.imageUrl && <img src={data.hero.imageUrl} alt="Hero" className="w-full h-auto border-4 border-black" />}
                        </div>
                    </div>
                </div>
                {/* Background Text Decor */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20rem] opacity-5 select-none pointer-events-none whitespace-nowrap">
                    {name.toUpperCase()} {name.toUpperCase()}
                </div>
            </section>

            {/* Poster Content */}
            <main className="py-32 space-y-40">
                <section className="container mx-auto px-4">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </section>

                {/* Sections with thick borders */}
                <section className="container mx-auto px-4">
                    <div className="border-8 border-black p-12 md:p-20 space-y-12 bg-white shadow-[16px_16px_0px_0px_var(--school-primary)]">
                        <div className="space-y-4">
                            <span className="inline-block bg-black text-white px-4 py-1 text-xs uppercase tracking-widest">About Us</span>
                            <h2 className="text-5xl md:text-7xl uppercase tracking-tighter">The Visionary Edge</h2>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-12">
                            <p className="text-2xl leading-tight uppercase opacity-80">
                                {data.about.body}
                            </p>
                            <div className="space-y-8">
                                <div className="p-8 border-4 border-black bg-[var(--school-primary)] text-white">
                                    <h3 className="text-2xl mb-4 uppercase">Institutional Story</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {data.about.imageUrls?.slice(1, 3).map((url: string, i: number) => (
                                            <img key={i} src={url} alt={`About ${i}`} className="w-full h-32 object-cover border-2 border-black" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="bg-black text-white py-32 border-y-8 border-black">
                    <div className="container mx-auto px-4">
                        <VisionMissionBlock vision={data.vision} mission={data.mission} />
                    </div>
                </div>

                <section className="container mx-auto px-4">
                    <div className="border-8 border-black p-12 bg-white">
                        <h2 className="text-5xl uppercase tracking-tighter mb-16 text-center">Core Pillars</h2>
                        <CoreValuesBlock values={data.coreValues} />
                    </div>
                </section>

                <div className="space-y-32">
                    <EventsSection events={events} basePath={basePath} />
                    <NewsSection news={news} basePath={basePath} />
                    <GallerySection images={gallery} basePath={basePath} />
                    <ContactSection data={data.contact} schoolId={school.$id} />
                </div>
            </main>
        </>
    );
}
