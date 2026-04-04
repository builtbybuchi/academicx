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

export function Template4Layout({ children }: { children: React.ReactNode }) {
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
 * Template 4 – Geometric, Bold Angles
 * Electric blue + yellow + dark charcoal
 */
export function Template4() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Geometric Hero */}
            <section className="relative h-[80vh] flex items-center overflow-hidden bg-black">
                <div className="absolute inset-0 skew-y-[-6deg] origin-top-left scale-110 bg-gray-900 overflow-hidden">
                    {data.hero.imageUrl && (
                        <img 
                            src={data.hero.imageUrl} 
                            alt="Hero" 
                            className="w-full h-full object-cover opacity-50 blur-[2px]"
                        />
                    )}
                </div>
                <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-block bg-[var(--school-secondary)] text-black font-black uppercase text-sm tracking-[0.3em] px-4 py-1 skew-x-[-12deg]">
                            <span className="inline-block skew-x-[12deg]">Excellence Defined</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter uppercase italic">
                            {data.hero.headline}
                        </h1>
                        <p className="text-xl text-white/70 max-w-lg font-medium leading-relaxed">
                            {data.hero.subheadline}
                        </p>
                        <div className="flex gap-4">
                            <Button className="bg-[var(--school-primary)] text-white font-black uppercase text-sm tracking-widest rounded-none skew-x-[-12deg] px-12 py-8 hover:translate-x-2 transition-transform shadow-[6px_6px_0px_0px_var(--school-secondary)]">
                                <span className="inline-block skew-x-[12deg]">Get Started</span>
                            </Button>
                        </div>
                    </div>
                    <div className="hidden lg:block relative">
                        <div className="w-[500px] h-[500px] bg-[var(--school-primary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-20" />
                        <div className="w-[400px] h-[400px] bg-[var(--school-secondary)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-10" />
                        <div className="relative z-10 w-full aspect-square bg-gray-800 skew-x-[-6deg] overflow-hidden shadow-2xl border-8 border-white">
                            {data.hero.imageUrl && <img src={data.hero.imageUrl} alt="Hero" className="w-full h-full object-cover skew-x-[6deg] scale-125" />}
                        </div>
                    </div>
                </div>
            </section>

            {/* Geometric Content */}
            <main className="py-32 space-y-40">
                <section className="container mx-auto px-4">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </section>

                {/* About - Geometric */}
                <section className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-[var(--school-primary)] skew-x-[-12deg] translate-x-4 translate-y-4" />
                            <div className="relative bg-black p-12 skew-x-[-12deg] text-white">
                                <div className="skew-x-[12deg] space-y-6">
                                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Our Identity</h2>
                                    <p className="text-lg opacity-80 leading-relaxed font-medium">
                                        {data.about.body}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-8">
                            {data.about.imageUrls?.slice(1, 3).map((url, i) => (
                                <div key={i} className={`aspect-[3/4] bg-gray-200 skew-y-[6deg] overflow-hidden border-4 border-black shadow-xl ${i % 2 === 1 ? '-translate-y-12' : 'translate-y-12'}`}>
                                    <img src={url} alt={`About ${i}`} className="w-full h-full object-cover -skew-y-[6deg] scale-125" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Vision/Mission - Angled Blocks */}
                <section className="bg-gray-100 py-32 -skew-y-3">
                    <div className="container mx-auto px-4 skew-y-3">
                        <VisionMissionBlock vision={data.vision} mission={data.mission} />
                    </div>
                </section>

                {/* Core Values - Geometric Cards */}
                <section className="container mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter">The Blueprint</h2>
                        <div className="w-20 h-2 bg-[var(--school-primary)] mx-auto skew-x-[-12deg]" />
                    </div>
                    <CoreValuesBlock values={data.coreValues} />
                </section>

                {/* Anthem/Pledge - Geometric Frames */}
                <section className="container mx-auto px-4 grid lg:grid-cols-2 gap-8">
                    <div className="bg-black text-white p-12 border-l-[16px] border-[var(--school-primary)]">
                        <h3 className="text-2xl font-black uppercase mb-6 italic tracking-widest">School Anthem</h3>
                        <p className="text-lg leading-relaxed opacity-70 whitespace-pre-line font-medium italic">
                            {data.schoolAnthem}
                        </p>
                    </div>
                    <div className="bg-[var(--school-primary)] text-white p-12 border-r-[16px] border-black">
                        <h3 className="text-2xl font-black uppercase mb-6 italic tracking-widest">School Pledge</h3>
                        <p className="text-lg leading-relaxed opacity-70 whitespace-pre-line font-medium italic">
                            {data.schoolPledge}
                        </p>
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
