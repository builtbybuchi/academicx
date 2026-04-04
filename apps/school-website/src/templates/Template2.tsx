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

export function Template2Layout({ children }: { children: React.ReactNode }) {
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
                variant="split"
            />
            {children}
        </div>
    );
}

/** 
 * Template 2 – Split, News + Split Hero
 * Teal + orange accents on clean white
 */
export function Template2() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Split Hero */}
            <section className="flex flex-col lg:flex-row h-[70vh] lg:h-[80vh]">
                <div className="lg:w-1/2 relative overflow-hidden group">
                    {data.hero.imageUrl && (
                        <img 
                            src={data.hero.imageUrl} 
                            alt="Hero" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 lg:px-20 text-white">
                        <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase leading-none tracking-tighter">
                            {data.hero.headline || "Unlocking Potential"}
                        </h1>
                        <p className="text-lg opacity-80 max-w-md mb-8 font-medium">
                            {data.hero.subheadline || "A modern approach to education, fostering innovation and critical thinking."}
                        </p>
                        <Button className="w-fit bg-white text-[var(--school-primary)] hover:bg-gray-100 rounded-none px-10 py-6 font-bold uppercase tracking-widest">
                            Explore
                        </Button>
                    </div>
                </div>
                <div className="lg:w-1/2 bg-gray-50 p-12 lg:p-20 flex flex-col justify-center">
                    <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--school-secondary)] mb-6">Featured News</h2>
                    <div className="space-y-8">
                        {news.slice(0, 3).map((item: any, i) => (
                            <Link key={item.$id} to={`${basePath}/news/${item.$id}`} className="block group">
                                <span className="text-4xl font-black text-gray-200 group-hover:text-[var(--school-secondary)] transition-colors">0{i+1}</span>
                                <h3 className="text-xl font-bold mt-2 group-hover:text-[var(--school-primary)] transition-colors">{item.title}</h3>
                                <p className="text-sm opacity-60 line-clamp-2 mt-2">{item.summary}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Alternating Sections */}
            <main className="py-20">
                <div className="container mx-auto px-4 space-y-32">
                    {/* Welcome Address */}
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />

                    {/* About - Split */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-6">
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--school-secondary)]">Who We Are</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-[var(--school-primary)] tracking-tighter uppercase">Our Heritage & Future</h3>
                            <p className="text-lg leading-relaxed opacity-70">
                                {data.about.body}
                            </p>
                            <div className="pt-4">
                                <Button className="bg-[var(--school-primary)] text-white rounded-none px-8 py-6 font-bold uppercase tracking-widest">
                                    Learn More
                                </Button>
                            </div>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                            {data.about.imageUrls?.slice(1, 3).map((url, i) => (
                                <div key={i} className={`overflow-hidden rounded-none shadow-2xl ${i % 2 === 1 ? 'mt-12' : ''}`}>
                                    <img src={url} alt={`About ${i}`} className="w-full aspect-[3/4] object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vision/Mission - Split Grid */}
                    <div className="bg-white p-12 lg:p-20 shadow-2xl">
                        <VisionMissionBlock vision={data.vision} mission={data.mission} />
                    </div>

                    <CoreValuesBlock values={data.coreValues} />
                </div>

                <div className="mt-32">
                    <EventsSection events={events} basePath={basePath} />
                    <NewsSection news={news} basePath={basePath} />
                    <GallerySection images={gallery} basePath={basePath} />
                    <ContactSection data={data.contact} schoolId={school.$id} />
                </div>
            </main>
        </>
    );
}
