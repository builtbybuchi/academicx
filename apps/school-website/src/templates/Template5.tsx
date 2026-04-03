import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    const { school } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <div className="min-h-screen bg-[#FDFCF9] font-serif text-[#2D2D2D]">
            {/* Minimal Editorial Header */}
            <header className="py-10">
                <div className="container mx-auto px-6 flex flex-col items-center gap-8">
                    <Link to={basePath} className="flex flex-col items-center text-center space-y-2 group">
                        {(school as any).logo && (
                            <img src={String((school as any).logo)} alt={name} className="h-16 w-auto mb-4 opacity-80 transition-opacity group-hover:opacity-100" />
                        )}
                        <h1 className="text-3xl tracking-[0.2em] font-light uppercase">{name}</h1>
                        <div className="w-12 h-px bg-black/20" />
                    </Link>
                    <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-[10px] uppercase tracking-[0.3em] font-medium">
                        <Link to={basePath} className="hover:opacity-50 transition-opacity">Journal</Link>
                        <Link to={`${basePath}/events`} className="hover:opacity-50 transition-opacity">Calendar</Link>
                        <Link to={`${basePath}/news`} className="hover:opacity-50 transition-opacity">Dispatch</Link>
                        <Link to={`${basePath}/gallery`} className="hover:opacity-50 transition-opacity">Archives</Link>
                        <Link to={`${basePath}/staff`} className="hover:opacity-50 transition-opacity">Faculty</Link>
                        <Link to={`${basePath}/results`} className="hover:opacity-50 transition-opacity">Portal</Link>
                    </nav>
                </div>
            </header>

            {children}

            {/* Minimalist Footer */}
            <footer className="py-20 border-t border-black/5">
                <div className="container mx-auto px-6 text-center space-y-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-light tracking-[0.2em] uppercase">{name}</h3>
                        <p className="text-[10px] opacity-40 tracking-[0.2em] uppercase max-w-md mx-auto leading-relaxed">
                            Location: Global Campus
                        </p>
                    </div>
                    <div className="flex justify-center gap-12 text-[10px] uppercase tracking-[0.4em] font-bold opacity-60">
                        <Link to={basePath} className="hover:opacity-100">Home</Link>
                        <Link to={`${basePath}/about`} className="hover:opacity-100">Legacy</Link>
                        <Link to={`${basePath}/contact`} className="hover:opacity-100">Inquiry</Link>
                    </div>
                    <div className="flex justify-center gap-8 opacity-30">
                        <span className="text-[10px] uppercase tracking-widest">Powered by AcademicX</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.5em] opacity-20">
                        © {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
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
