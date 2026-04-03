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

export function Template4Layout({ children }: { children: React.ReactNode }) {
    const { school, data } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            {/* Geometric Header */}
            <header className="relative z-50">
                <div className="bg-black text-white py-2 px-4 text-[10px] font-bold uppercase tracking-widest">
                    <div className="container mx-auto flex justify-between items-center">
                        <span>Portal: 24/7 Access</span>
                        <div className="flex gap-6">
                            <span>{data.contact.phones[0]}</span>
                            <span>{data.contact.emails[0]}</span>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-6 flex items-center justify-between">
                    <Link to={basePath} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--school-primary)] flex items-center justify-center transform rotate-45 shadow-xl">
                            {(school as any).logo ? (
                                <img src={String((school as any).logo)} alt={name} className="w-8 h-8 -rotate-45 object-contain invert" />
                            ) : (
                                <span className="text-white font-black -rotate-45 text-xl">{name[0]}</span>
                            )}
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">{name}</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-1">
                        {['Home', 'Events', 'News', 'Gallery', 'Staff'].map((item) => (
                            <Link 
                                key={item} 
                                to={item === 'Home' ? basePath : `${basePath}/${item.toLowerCase()}`}
                                className="px-6 py-2 font-black uppercase text-xs tracking-widest hover:bg-[var(--school-primary)] hover:text-white transition-all skew-x-[-12deg]"
                            >
                                <span className="inline-block skew-x-[12deg]">{item}</span>
                            </Link>
                        ))}
                    </nav>
                    <Link to={`${basePath}/results`}>
                        <Button className="bg-[var(--school-secondary)] text-black font-black uppercase text-xs tracking-widest rounded-none skew-x-[-12deg] px-8 py-6 hover:translate-x-1 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <span className="inline-block skew-x-[12deg]">Student Login</span>
                        </Button>
                    </Link>
                </div>
            </header>

            {children}

            {/* Geometric Footer */}
            <footer className="bg-black text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-[var(--school-primary)] skew-y-[-1deg] origin-left" />
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-16 relative z-10">
                    <div className="space-y-8">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter">{name}</h3>
                        <p className="text-sm opacity-50 font-medium leading-relaxed">
                            {data.principalsPledge}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--school-secondary)] mb-8">Directory</h4>
                        <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
                            <li><Link to={basePath} className="hover:text-[var(--school-primary)] transition-colors">Home</Link></li>
                            <li><Link to={`${basePath}/events`} className="hover:text-[var(--school-primary)] transition-colors">Events</Link></li>
                            <li><Link to={`${basePath}/admission`} className="hover:text-[var(--school-primary)] transition-colors">Admission</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--school-secondary)] mb-8">Support</h4>
                        <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
                            <li>{data.contact.emails[0]}</li>
                            <li>{data.contact.phones[0]}</li>
                            <li>{data.contact.address}</li>
                        </ul>
                    </div>
                    <div className="flex flex-col justify-between">
                        <div className="bg-white/5 p-6 border-l-4 border-[var(--school-primary)]">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">System Powered By</p>
                            <span className="text-xl font-black tracking-tighter uppercase italic text-[var(--school-primary)]">AcademicX</span>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
                    <span>© {new Date().getFullYear()} Global Operations</span>
                    <div className="flex gap-12">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
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
