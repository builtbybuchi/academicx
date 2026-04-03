import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
    SchoolAnthemBlock, 
    SchoolPledgeBlock, 
    VisionMissionBlock, 
    CoreValuesBlock, 
    WelcomeAddressBlock,
    EventsSection,
    NewsSection,
    GallerySection,
    ContactSection
} from './SharedTemplateComponents';

export function Template1Layout({ children }: { children: React.ReactNode }) {
    const { school, data } = useSchoolSite();
    const basePath = useBasePath();
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <div className="min-h-screen bg-[var(--school-background)] font-serif text-[var(--school-text)]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[var(--school-nav-bg,var(--school-background))] shadow-sm border-b border-[var(--school-primary)]/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to={basePath} className="flex items-center gap-3">
                        {school.logo && (
                            <img src={String(school.logo)} alt={name} className="h-12 w-auto" />
                        )}
                        <span className="text-2xl font-bold tracking-tight text-[var(--school-primary)]">{name}</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link to={basePath} className="hover:text-[var(--school-primary)] transition-colors">Home</Link>
                        <Link to={`${basePath}/events`} className="hover:text-[var(--school-primary)] transition-colors">Events</Link>
                        <Link to={`${basePath}/news`} className="hover:text-[var(--school-primary)] transition-colors">News</Link>
                        <Link to={`${basePath}/gallery`} className="hover:text-[var(--school-primary)] transition-colors">Gallery</Link>
                        <Link to={`${basePath}/staff`} className="hover:text-[var(--school-primary)] transition-colors">Staff</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to={`${basePath}/results`}>
                            <Button variant="outline" size="sm" className="hidden sm:inline-flex border-[var(--school-primary)] text-[var(--school-primary)]">
                                Student Portal
                            </Button>
                        </Link>
                        <Button size="sm" className="bg-[var(--school-primary)] text-white hover:opacity-90">
                            Apply Now
                        </Button>
                    </div>
                </div>
            </header>

            {children}

            {/* Footer */}
            <footer className="bg-[var(--school-primary)] text-white py-16">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold">{name}</h3>
                        <p className="opacity-70 text-sm leading-relaxed">
                            Providing quality education and fostering excellence in a supportive environment.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-3 opacity-70 text-sm">
                            <li><Link to={basePath}>Home</Link></li>
                            <li><Link to={`${basePath}/events`}>Events</Link></li>
                            <li><Link to={`${basePath}/news`}>News</Link></li>
                            <li><Link to={`${basePath}/gallery`}>Gallery</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-3 opacity-70 text-sm">
                            <li>{data.contact.address}</li>
                            <li>{data.contact.phones.join(', ')}</li>
                            <li>{data.contact.emails.join(', ')}</li>
                            <li>{data.contact.schoolHours}</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-6">AcademicX</h4>
                        <p className="opacity-70 text-sm mb-4">
                            Powered by AcademicX - The complete school management system.
                        </p>
                        <a href="https://academicx.onrender.com" className="text-[var(--school-secondary)] font-bold">Visit AcademicX</a>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center opacity-50 text-xs">
                    © {new Date().getFullYear()} {name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

/** 
 * Template 1 – Classic, Stacked, Serif Hero
 * Deep navy + gold + cream feel
 */
export function Template1() {
    const { school, data, events, news, gallery } = useSchoolSite();
    const basePath = useBasePath();
    
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <>
            {/* Hero */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                {data.hero.imageUrl && (
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={data.hero.imageUrl} 
                            alt="Hero" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>
                )}
                <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-md">
                        {data.hero.headline || "Excellence Since 1985"}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {data.hero.subheadline || "Empowering minds, building character, and shaping the future of tomorrow."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Button size="lg" className="bg-white text-[var(--school-primary)] hover:bg-white/90 px-10 text-lg">
                            Take a Tour
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-10 text-lg">
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <main className="space-y-20 py-20">
                <div className="container mx-auto px-4">
                    <WelcomeAddressBlock text={data.welcomeAddress} imageUrl={data.about.imageUrls?.[0]} />
                </div>

                <div className="bg-[var(--school-primary)]/5 py-20">
                    <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 text-[var(--school-primary)]">About Our School</h2>
                            <p className="text-lg leading-relaxed mb-8 opacity-90">
                                {data.about.body}
                            </p>
                            <Button variant="outline" className="border-[var(--school-primary)] text-[var(--school-primary)]">
                                Read Full History
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {data.about.imageUrls?.slice(1, 3).map((url, i) => (
                                <img key={i} src={url} alt={`About ${i}`} className="rounded-lg shadow-lg aspect-square object-cover" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                        <VisionMissionBlock vision={data.vision} mission={data.mission} />
                        <CoreValuesBlock values={data.coreValues} />
                    </div>
                    <aside className="space-y-8">
                        <SchoolAnthemBlock text={data.schoolAnthem} />
                        <SchoolPledgeBlock text={data.schoolPledge} />
                        <div className="bg-[var(--school-secondary)]/10 p-8 rounded-lg border-l-4 border-[var(--school-secondary)]">
                            <h3 className="text-2xl font-bold mb-4">Principal's Pledge</h3>
                            <p className="italic opacity-80 leading-relaxed">"{data.principalsPledge}"</p>
                        </div>
                    </aside>
                </div>

                <EventsSection events={events} basePath={basePath} />
                <NewsSection news={news} basePath={basePath} />
                <GallerySection images={gallery} basePath={basePath} />
                <ContactSection data={data.contact} schoolId={school.$id} />
            </main>
        </>
    );
}
