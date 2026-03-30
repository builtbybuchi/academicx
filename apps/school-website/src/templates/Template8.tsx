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
    ContactSection
} from './SharedTemplateComponents';

export function Template8Layout({ children }: { children: React.ReactNode }) {
    const { school, data } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <div className="min-h-screen bg-[#FFFDF5] font-sans text-amber-950">
            {/* Playful Header */}
            <header className="container mx-auto px-6 py-6">
                <div className="bg-white rounded-full shadow-lg px-8 py-4 flex items-center justify-between border-4 border-[var(--school-primary)]/10">
                    <Link to={basePath} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-[var(--school-secondary)] rounded-xl rotate-3 group-hover:rotate-12 transition-transform flex items-center justify-center text-white font-black text-xl">
                            {name[0]}
                        </div>
                        <span className="text-2xl font-black tracking-tight text-[var(--school-primary)]">{name}</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-2">
                        {['Home', 'Events', 'News', 'Gallery', 'Staff'].map((item) => (
                            <Link 
                                key={item} 
                                to={item === 'Home' ? basePath : `${basePath}/${item.toLowerCase()}`}
                                className="px-5 py-2 text-sm font-bold hover:bg-[var(--school-secondary)]/10 rounded-full transition-all"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>
                    <Link to={`${basePath}/results`}>
                        <Button className="bg-[var(--school-primary)] text-white rounded-full font-bold px-8 hover:scale-105 transition-transform shadow-lg shadow-[var(--school-primary)]/20">
                            Student Portal
                        </Button>
                    </Link>
                </div>
            </header>

            {children}

            {/* Vibrant Footer */}
            <footer className="bg-[var(--school-primary)] text-white pt-24 pb-12 rounded-t-[5rem]">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-16 mb-20">
                        <div className="space-y-8">
                            <h3 className="text-3xl font-black tracking-tighter">{name}</h3>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[var(--school-secondary)] transition-colors">FB</div>
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[var(--school-secondary)] transition-colors">IG</div>
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[var(--school-secondary)] transition-colors">TW</div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-lg font-black uppercase tracking-widest text-[var(--school-secondary)]">Menu</h4>
                            <ul className="space-y-4 font-bold opacity-60">
                                <li><Link to={basePath}>Home</Link></li>
                                <li><Link to={`${basePath}/events`}>Events</Link></li>
                                <li><Link to={`${basePath}/staff`}>Staff</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-lg font-black uppercase tracking-widest text-[var(--school-secondary)]">Say Hello</h4>
                            <ul className="space-y-4 font-bold opacity-60">
                                <li>{data.contact.emails[0]}</li>
                                <li>{data.contact.phones[0]}</li>
                                <li className="text-sm">{data.contact.address}</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex flex-col justify-center text-center">
                            <p className="text-xs font-black uppercase tracking-widest mb-4 opacity-40">Proudly Powered By</p>
                            <span className="text-2xl font-black tracking-tighter text-[var(--school-secondary)]">AcademicX</span>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-white/10 text-center text-xs font-black uppercase tracking-[0.3em] opacity-30">
                        © {new Date().getFullYear()} {name} Community • All Heart
                    </div>
                </div>
            </footer>
        </div>
    );
}

/** 
 * Template 8 – Vibrant Community
 * Playful colorful header, vibrant collage hero, rounded corners
 */
export function Template8() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Vibrant Collage Hero */}
            <section className="container mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in slide-in-from-left duration-700">
                        <div className="inline-block bg-[var(--school-accent)]/10 text-[var(--school-accent)] font-black uppercase text-xs tracking-widest px-4 py-2 rounded-lg">
                            Learning is an Adventure
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black leading-tight text-[var(--school-primary)]">
                            Growing Together, <br />
                            <span className="text-[var(--school-secondary)]">Shining Brighter.</span>
                        </h1>
                        <p className="text-xl opacity-70 leading-relaxed font-medium">
                            {data.hero.subheadline}
                        </p>
                        <div className="flex gap-4">
                            <Button className="bg-[var(--school-secondary)] text-white rounded-2xl font-black px-10 py-8 text-lg hover:rotate-2 transition-all shadow-xl shadow-[var(--school-secondary)]/20">
                                Join Our Family
                            </Button>
                            <Button variant="outline" className="rounded-2xl border-2 border-[var(--school-primary)] text-[var(--school-primary)] font-black px-10 py-8 text-lg hover:-rotate-2 transition-all">
                                Take a Tour
                            </Button>
                        </div>
                    </div>
                    <div className="relative animate-in zoom-in duration-1000">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="rounded-[3rem] overflow-hidden rotate-3 shadow-2xl border-4 border-white aspect-square">
                                    {data.about.imageUrls?.[0] && <img src={data.about.imageUrls[0]} alt="Hero 1" className="w-full h-full object-cover" />}
                                </div>
                                <div className="rounded-[3rem] overflow-hidden -rotate-6 shadow-2xl border-4 border-white aspect-[4/5] bg-[var(--school-primary)]/10" />
                            </div>
                            <div className="space-y-4 pt-12">
                                <div className="rounded-[3rem] overflow-hidden -rotate-3 shadow-2xl border-4 border-white aspect-[4/5] bg-[var(--school-secondary)]/10" />
                                <div className="rounded-[3rem] overflow-hidden rotate-6 shadow-2xl border-4 border-white aspect-square">
                                    {data.hero.imageUrl && <img src={data.hero.imageUrl} alt="Hero 2" className="w-full h-full object-cover" />}
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--school-accent)] rounded-full opacity-20 blur-xl animate-pulse" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[var(--school-secondary)] rounded-full opacity-20 blur-xl animate-pulse delay-700" />
                    </div>
                </div>
            </section>

            {/* Vibrant Content */}
            <main className="py-24 space-y-40">
                {/* About - Photo Heavy */}
                <section className="container mx-auto px-6">
                    <div className="bg-white rounded-[4rem] p-12 lg:p-24 shadow-2xl shadow-amber-900/5 relative overflow-hidden border border-amber-100">
                        <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-5xl font-black text-[var(--school-primary)]">Welcome to Our Happy Place!</h2>
                                <p className="text-lg leading-relaxed opacity-70 font-medium">
                                    {data.about.body}
                                </p>
                                <div className="bg-amber-50 p-8 rounded-3xl border-2 border-amber-100 italic font-bold text-[var(--school-primary)]">
                                    "{data.welcomeAddress}"
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {data.about.imageUrls?.slice(0, 4).map((url, i) => (
                                    <div key={i} className={`rounded-3xl overflow-hidden shadow-xl ${i % 2 === 1 ? 'translate-y-6' : '-translate-y-6'}`}>
                                        <img src={url} alt={`Gallery ${i}`} className="w-full aspect-square object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision/Mission - Fun Grids */}
                <section className="container mx-auto px-6 grid md:grid-cols-2 gap-8">
                    <div className="bg-[var(--school-primary)] text-white p-12 rounded-[3rem] rotate-1 space-y-6 shadow-xl shadow-[var(--school-primary)]/20">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Our Vision</h3>
                        <p className="text-lg opacity-80 leading-relaxed font-medium">{data.vision}</p>
                    </div>
                    <div className="bg-[var(--school-secondary)] text-white p-12 rounded-[3rem] -rotate-1 space-y-6 shadow-xl shadow-[var(--school-secondary)]/20">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Our Mission</h3>
                        <p className="text-lg opacity-80 leading-relaxed font-medium">{data.mission}</p>
                    </div>
                </section>

                {/* Core Values - Round Cards */}
                <section className="container mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl font-black text-[var(--school-primary)]">What We Stand For</h2>
                        <div className="flex justify-center gap-1">
                            <div className="w-3 h-3 bg-[var(--school-primary)] rounded-full" />
                            <div className="w-3 h-3 bg-[var(--school-secondary)] rounded-full" />
                            <div className="w-3 h-3 bg-[var(--school-accent)] rounded-full" />
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
