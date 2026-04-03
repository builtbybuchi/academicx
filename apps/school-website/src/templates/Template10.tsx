import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { 
    VisionMissionBlock, 
    CoreValuesBlock, 
    EventsSection,
    NewsSection,
    GallerySection,
    ContactSection,
    WelcomeAddressBlock
} from './SharedTemplateComponents';

export function Template10Layout({ children }: { children: React.ReactNode }) {
    const { school, data } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-serif text-[#3C3A36]">
            {/* Nature Header */}
            <header className="container mx-auto px-6 py-8 flex items-center justify-between">
                <Link to={basePath} className="flex items-center gap-3 group">
                    <div className="text-[#4A6741] transition-transform group-hover:rotate-12">
                        <Leaf size={32} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-[#2D3E27]">{name}</span>
                </Link>
                <nav className="hidden lg:flex items-center gap-10 text-sm font-semibold text-[#4A6741]">
                    <Link to={basePath} className="hover:text-[#2D3E27] transition-colors relative group">
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A6741] transition-all group-hover:w-full" />
                    </Link>
                    <Link to={`${basePath}/events`} className="hover:text-[#2D3E27] transition-colors relative group">
                        Calendar
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A6741] transition-all group-hover:w-full" />
                    </Link>
                    <Link to={`${basePath}/gallery`} className="hover:text-[#2D3E27] transition-colors relative group">
                        Forest Gallery
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A6741] transition-all group-hover:w-full" />
                    </Link>
                </nav>
                <Link to={`${basePath}/results`}>
                    <Button className="bg-[#4A6741] hover:bg-[#3A5233] text-white rounded-full px-8 shadow-md">
                        Portal
                    </Button>
                </Link>
            </header>

            {children}

            {/* Nature Footer */}
            <footer className="bg-[#2D3E27] text-[#F4EFE6] pt-24 pb-12 overflow-hidden relative">
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                    <Leaf size={400} />
                </div>
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-16 mb-20 relative z-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <Leaf size={24} className="text-[#89A87C]" />
                                <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
                            </div>
                            <p className="text-sm opacity-60 leading-relaxed italic">
                                {data.principalsPledge}
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#89A87C]">Forest Map</h4>
                            <ul className="space-y-4 text-sm font-medium opacity-80">
                                <li><Link to={basePath} className="hover:text-white transition-colors">Home</Link></li>
                                <li><Link to={`${basePath}/staff`} className="hover:text-white transition-colors">Faculty</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#89A87C]">Branch Out</h4>
                            <ul className="space-y-4 text-sm font-medium opacity-80">
                                <li>{data.contact.emails[0]}</li>
                                <li>{data.contact.phones[0]}</li>
                                <li className="text-xs">{data.contact.address}</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col justify-center text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40">Nurtured by</p>
                            <span className="text-2xl font-bold tracking-tighter text-[#89A87C]">AcademicX</span>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-white/5 text-center text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">
                        © {new Date().getFullYear()} {name} • Naturally Gifted
                    </div>
                </div>
            </footer>
        </div>
    );
}

/** 
 * Template 10 – Nature Inspired
 * Earthy tones, organic shapes, leaf accents
 */
export function Template10() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Serene Nature Hero */}
            <section className="container mx-auto px-6 py-12">
                <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl group">
                    {data.hero.imageUrl && (
                        <img 
                            src={data.hero.imageUrl} 
                            alt="Hero" 
                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center text-center p-8">
                        <div className="max-w-3xl space-y-8 animate-in fade-in zoom-in duration-1000">
                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                                {data.hero.headline}
                            </h1>
                            <p className="text-xl text-white/90 font-medium italic">
                                {data.hero.subheadline}
                            </p>
                            <div className="pt-4">
                                <Button size="lg" className="bg-white text-[#4A6741] hover:bg-white/90 rounded-full px-12 font-bold shadow-xl">
                                    Begin Your Journey
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nature Content */}
            <main className="py-24 space-y-40">
                <section className="container mx-auto px-6">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </section>

                {/* About - Organic Layout */}
                <section className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8 relative">
                        <div className="absolute -left-10 -top-10 text-[#4A6741] opacity-10">
                            <Leaf size={120} />
                        </div>
                        <div className="space-y-4">
                            <span className="text-[#4A6741] font-bold uppercase tracking-widest text-xs">Our Heritage</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-[#2D3E27]">Rooted in Values, Growing in Wisdom</h2>
                        </div>
                        <p className="text-lg leading-relaxed text-[#5C5A54]">
                            {data.about.body}
                        </p>
                    </div>
                    <div className="relative grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="rounded-t-full rounded-b-3xl overflow-hidden shadow-lg aspect-[3/4]">
                                {data.about.imageUrls?.[1] && <img src={data.about.imageUrls[1]} alt="About 1" className="w-full h-full object-cover" />}
                            </div>
                        </div>
                        <div className="space-y-4 pt-12">
                            <div className="rounded-b-full rounded-t-3xl overflow-hidden shadow-lg aspect-[3/4]">
                                {data.about.imageUrls?.[2] && <img src={data.about.imageUrls[2]} alt="About 2" className="w-full h-full object-cover" />}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision/Mission - Soft Rounded Blocks */}
                <section className="bg-[#F4EFE6] py-32 rounded-[5rem] mx-6">
                    <div className="container mx-auto px-6">
                        <VisionMissionBlock vision={data.vision} mission={data.mission} />
                    </div>
                </section>

                {/* Core Values - Leaf Themed */}
                <section className="container mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-bold text-[#2D3E27]">Our Growth Pillars</h2>
                        <div className="flex justify-center gap-1">
                            {[1,2,3].map(i => <Leaf key={i} size={16} className="text-[#4A6741] opacity-30" />)}
                        </div>
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
