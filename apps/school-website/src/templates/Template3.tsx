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

export function Template3Layout({ children }: { children: React.ReactNode }) {
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
 * Template 3 – Magazine, Wide Hero, Asymmetric
 * Bold red + black + off-white
 */
export function Template3() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Asymmetric Wide Hero */}
            <section className="container mx-auto px-4 py-12">
                <div className="relative grid grid-cols-12 gap-4">
                    <div className="col-span-12 lg:col-span-8 relative aspect-[16/9] overflow-hidden group">
                        {data.hero.imageUrl && (
                            <img 
                                src={data.hero.imageUrl} 
                                alt="Hero" 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-10 left-10 text-white max-w-2xl">
                            <span className="inline-block bg-[var(--school-primary)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-4">Featured Story</span>
                            <h2 className="text-4xl md:text-6xl font-black leading-none mb-4">{data.hero.headline}</h2>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 bg-black text-white p-10 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-6 italic border-b border-white/20 pb-4">Principal's Note</h3>
                            <p className="text-lg opacity-80 leading-relaxed mb-8 font-light">
                                "{data.welcomeAddress.slice(0, 200)}..."
                            </p>
                            <Button className="bg-white text-black hover:bg-gray-200 rounded-none font-bold uppercase text-xs tracking-widest px-8">
                                Read More
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 text-[12rem] font-black opacity-5 select-none leading-none -mr-10 -mt-10">"</div>
                    </div>
                </div>
            </section>

            {/* Magazine Sections */}
            <main className="py-20 space-y-32">
                <div className="container mx-auto px-4">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </div>

                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-16">
                            <section>
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">Our Foundation</h2>
                                    <div className="flex-1 h-px bg-black" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-5xl font-black text-[var(--school-primary)] opacity-10">01</h3>
                                        <h4 className="text-2xl font-bold italic -mt-8">Our Vision</h4>
                                        <p className="opacity-70 leading-relaxed">{data.vision}</p>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-5xl font-black text-[var(--school-primary)] opacity-10">02</h3>
                                        <h4 className="text-2xl font-bold italic -mt-8">Our Mission</h4>
                                        <p className="opacity-70 leading-relaxed">{data.mission}</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-4 mb-10">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">Core Values</h2>
                                    <div className="flex-1 h-px bg-black" />
                                </div>
                                <CoreValuesBlock values={data.coreValues} />
                            </section>
                        </div>

                        <aside className="space-y-12 bg-gray-50 p-8 border-t-4 border-black">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black pb-2">The Anthem</h3>
                                <p className="text-sm italic opacity-70 leading-loose whitespace-pre-line">{data.schoolAnthem}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black pb-2">The Pledge</h3>
                                <p className="text-sm italic opacity-70 leading-loose whitespace-pre-line">{data.schoolPledge}</p>
                            </div>
                        </aside>
                    </div>
                </div>

                <div className="bg-black text-white py-32">
                    <EventsSection events={events} basePath={basePath} />
                </div>

                <div className="container mx-auto px-4">
                    <NewsSection news={news} basePath={basePath} />
                </div>

                <div className="bg-gray-100 py-32">
                    <GallerySection images={gallery} basePath={basePath} />
                </div>

                <ContactSection data={data.contact} schoolId={school.$id} />
            </main>
        </>
    );
}
