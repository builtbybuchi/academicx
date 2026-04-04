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

export function Template7Layout({ children }: { children: React.ReactNode }) {
    const { school, data } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[var(--school-primary)] selection:text-white">
            {/* Minimal Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to={basePath} className="flex items-center gap-2 group">
                        {(school as any).logo && (
                            <img src={String((school as any).logo)} alt={name} className="h-8 w-auto transition-transform group-hover:scale-110" />
                        )}
                        <span className="text-lg font-semibold tracking-tight">{name}</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        {['Home', 'Events', 'News', 'Gallery', 'Staff'].map((item) => (
                            <Link 
                                key={item} 
                                to={item === 'Home' ? basePath : `${basePath}/${item.toLowerCase()}`}
                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-all"
                            >
                                {item}
                            </Link>
                        ))}
                        <div className="w-px h-4 bg-slate-200 mx-2" />
                        <Link to={`${basePath}/contact`} className="px-4 py-2 text-sm font-semibold text-[var(--school-primary)]">
                            Contact
                        </Link>
                    </nav>
                    <Link to={`${basePath}/results`}>
                        <Button size="sm" className="bg-slate-900 text-white rounded-full px-6 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                            Portal
                        </Button>
                    </Link>
                </div>
            </header>

            {children}

            {/* Simple Footer */}
            <footer className="bg-slate-50 border-t border-slate-100 pt-24 pb-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
                        <div className="space-y-6 max-w-xs">
                            <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Dedicated to academic excellence and character building.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                            <div className="space-y-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Links</h4>
                                <ul className="space-y-3 text-sm font-medium text-slate-600">
                                    <li><Link to={basePath} className="hover:text-slate-900">Home</Link></li>
                                    <li><Link to={`${basePath}/events`} className="hover:text-slate-900">Events</Link></li>
                                    <li><Link to={`${basePath}/staff`} className="hover:text-slate-900">Staff</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Support</h4>
                                <ul className="space-y-3 text-sm font-medium text-slate-600">
                                    <li>{data.contact.emails[0]}</li>
                                    <li>{data.contact.phones[0]}</li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">System</h4>
                                <a href="#" className="text-xs font-bold text-[var(--school-primary)] uppercase tracking-widest">Powered by AcademicX</a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
                        <span>© {new Date().getFullYear()} {name}</span>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Facebook</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/** 
 * Template 7 – Minimal Modern
 * Extreme whitespace, single-column focus, subtle shadows
 */
export function Template7() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Minimal Hero */}
            <section className="pt-20 pb-32">
                <div className="container mx-auto px-6 text-center space-y-12">
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900">
                            {data.hero.headline}
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed font-medium">
                            {data.hero.subheadline}
                        </p>
                    </div>
                    <div className="relative max-w-5xl mx-auto aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 group">
                        {data.hero.imageUrl && (
                            <img 
                                src={data.hero.imageUrl} 
                                alt="Hero" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Minimal Content */}
            <main className="space-y-40 pb-40">
                <section className="container mx-auto px-6">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </section>

                {/* About - Clean Cards */}
                <section className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
                    <div className="bg-slate-50 p-12 rounded-[2rem] space-y-8 border border-slate-100">
                        <h2 className="text-3xl font-bold">Our Philosophy</h2>
                        <p className="text-lg leading-relaxed text-slate-500">
                            {data.about.body}
                        </p>
                        <Button variant="outline" className="rounded-full border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300">
                            Learn more about our values
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {data.about.imageUrls?.slice(1, 3).map((url, i) => (
                            <div key={i} className="rounded-[2rem] overflow-hidden shadow-xl shadow-slate-100 border border-slate-50">
                                <img src={url} alt={`About ${i}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Vision/Mission - Minimal Dividers */}
                <section className="container mx-auto px-6 border-y border-slate-100 py-24">
                    <VisionMissionBlock vision={data.vision} mission={data.mission} />
                </section>

                {/* Core Values - Modern Grid */}
                <section className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <h2 className="text-4xl font-bold">The Core Values</h2>
                        <p className="text-slate-500 max-w-sm">The pillars that define our community and academic excellence.</p>
                    </div>
                    <CoreValuesBlock values={data.coreValues} />
                </section>

                {/* Anthem/Pledge - Simple Boxes */}
                <section className="container mx-auto px-6 grid md:grid-cols-2 gap-8">
                    <div className="p-10 rounded-3xl bg-slate-900 text-white space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">The Anthem</h3>
                        <p className="text-lg font-medium opacity-90 leading-relaxed whitespace-pre-line">{data.schoolAnthem}</p>
                    </div>
                    <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">The Pledge</h3>
                        <p className="text-lg font-medium text-slate-600 leading-relaxed whitespace-pre-line">{data.schoolPledge}</p>
                    </div>
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
