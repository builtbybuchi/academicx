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

export function Template9Layout({ children }: { children: React.ReactNode }) {
    const { school, data } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Corporate Header */}
            <header className="bg-[#0F172A] text-white">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to={basePath} className="flex items-center gap-4">
                        {(school as any).logo && (
                            <img src={String((school as any).logo)} alt={name} className="h-10 w-auto" />
                        )}
                        <span className="text-xl font-bold tracking-tight border-l border-white/20 pl-4">{name}</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium opacity-80">
                        <Link to={basePath} className="hover:text-white hover:opacity-100 transition-all">Home</Link>
                        <Link to={`${basePath}/events`} className="hover:text-white hover:opacity-100 transition-all">Events</Link>
                        <Link to={`${basePath}/news`} className="hover:text-white hover:opacity-100 transition-all">News</Link>
                        <Link to={`${basePath}/gallery`} className="hover:text-white hover:opacity-100 transition-all">Gallery</Link>
                        <Link to={`${basePath}/staff`} className="hover:text-white hover:opacity-100 transition-all">Staff</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to={`${basePath}/results`}>
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-md">
                                Portal Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {children}

            {/* Corporate Footer */}
            <footer className="bg-[#0F172A] text-white pt-24 pb-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-16 mb-20">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                {(school as any).logo && <img src={String((school as any).logo)} alt={name} className="h-8 w-auto" />}
                                <span className="text-xl font-bold tracking-tight">{name}</span>
                            </div>
                            <p className="text-sm opacity-50 leading-relaxed">
                                {data.principalsPledge}
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-500">Navigation</h4>
                            <ul className="space-y-4 text-sm opacity-60">
                                <li><Link to={basePath} className="hover:opacity-100">Dashboard</Link></li>
                                <li><Link to={`${basePath}/about`} className="hover:opacity-100">About Us</Link></li>
                                <li><Link to={`${basePath}/admission`} className="hover:opacity-100">Admissions</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-500">Information</h4>
                            <ul className="space-y-4 text-sm opacity-60">
                                <li>{data.contact.emails[0]}</li>
                                <li>{data.contact.phones[0]}</li>
                                <li>{data.contact.address}</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-500">Legal</h4>
                            <ul className="space-y-4 text-sm opacity-60">
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                                <li>Cookie Policy</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs opacity-40 font-medium">
                        <span>© {new Date().getFullYear()} {name} Institutional Portal</span>
                        <div className="flex items-center gap-2">
                            <span>Powered by</span>
                            <span className="text-blue-500 font-bold">AcademicX</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/** 
 * Template 9 – Corporate Professional
 * Sleek dark navy header, structured card grids, professional typography
 */
export function Template9() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <>
            {/* Corporate Hero */}
            <section className="relative bg-slate-900 text-white py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent z-10" />
                    {data.hero.imageUrl && (
                        <img 
                            src={data.hero.imageUrl} 
                            alt="Hero" 
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className="container mx-auto px-6 relative z-20">
                    <div className="max-w-3xl space-y-8">
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                            {data.hero.headline}
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
                            {data.hero.subheadline}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-md shadow-lg shadow-blue-900/20">
                                Enroll Now
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 rounded-md">
                                Request Prospectus
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Decorative grid pattern */}
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>
            </section>

            {/* Corporate Content */}
            <main className="py-24 space-y-32">
                <section className="container mx-auto px-6">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </section>

                {/* Trust signals / Stats */}
                <section className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Years of Excellence', value: '35+' },
                        { label: 'Graduated Students', value: '12k+' },
                        { label: 'Expert Faculty', value: '150+' },
                        { label: 'Awards Won', value: '45' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center space-y-2">
                            <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </section>

                {/* About - Professional Grid */}
                <section className="container mx-auto px-6">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col lg:flex-row">
                        <div className="lg:w-1/2 p-12 lg:p-20 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Institutional Profile</h2>
                                <h3 className="text-4xl font-bold tracking-tight">Commitment to Academic Rigor</h3>
                            </div>
                            <p className="text-lg leading-relaxed text-slate-600">
                                {data.about.body}
                            </p>
                        </div>
                        <div className="lg:w-1/2 relative bg-slate-100">
                            {data.about.imageUrls?.[1] && <img src={data.about.imageUrls[1]} alt="About" className="w-full h-full object-cover" />}
                        </div>
                    </div>
                </section>

                {/* Vision/Mission - Structured */}
                <section className="container mx-auto px-6">
                    <VisionMissionBlock vision={data.vision} mission={data.mission} />
                </section>

                {/* Core Values - Professional Grid */}
                <section className="container mx-auto px-6">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold mb-4">Core Competencies</h2>
                        <div className="w-12 h-1 bg-blue-600" />
                    </div>
                    <CoreValuesBlock values={data.coreValues} />
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
