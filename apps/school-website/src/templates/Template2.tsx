import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { 
    VisionMissionBlock, 
    CoreValuesBlock, 
    EventsSection,
    NewsSection,
    GallerySection,
    ContactSection
} from './SharedTemplateComponents';

export function Template2Layout({ children }: { children: React.ReactNode }) {
    const { school, data, news } = useSchoolSite();
    const basePath = useBasePath();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    if (!school) return null;
    const name = String((school as any).name || 'School');

    return (
        <div className="min-h-screen bg-[var(--school-background)] font-sans text-[var(--school-text)]">
            {/* Header with News Ticker */}
            <header className="bg-white border-b border-gray-100">
                <div className="bg-[var(--school-primary)] text-white py-2 overflow-hidden whitespace-nowrap">
                    <div className="container mx-auto px-4 flex items-center">
                        <span className="bg-[var(--school-secondary)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded mr-4">Latest News</span>
                        <div className="animate-marquee inline-block">
                            {news.map((item: any) => (
                                <span key={item.$id} className="mx-8 text-sm">{item.title}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to={basePath} className="flex items-center gap-3">
                        {(school as any).logo && (
                            <img src={String((school as any).logo)} alt={name} className="h-10 w-auto" />
                        )}
                        <span className="text-xl font-black tracking-tighter text-[var(--school-primary)] uppercase">{name}</span>
                    </Link>
                    
                    <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
                        <Link to={basePath} className="hover:text-[var(--school-secondary)] transition-colors">Home</Link>
                        <Link to={`${basePath}/events`} className="hover:text-[var(--school-secondary)] transition-colors">Events</Link>
                        <Link to={`${basePath}/news`} className="hover:text-[var(--school-secondary)] transition-colors">News</Link>
                        <Link to={`${basePath}/gallery`} className="hover:text-[var(--school-secondary)] transition-colors">Gallery</Link>
                        <Link to={`${basePath}/staff`} className="hover:text-[var(--school-secondary)] transition-colors">Staff</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </Button>
                        <Link to={`${basePath}/results`}>
                            <Button size="sm" className="bg-[var(--school-secondary)] text-white hover:opacity-90 rounded-none px-6">
                                Portal
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {children}

            {/* Split Footer */}
            <footer className="bg-gray-900 text-white pt-20 pb-10">
                <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-20">
                    <div className="lg:w-1/2 space-y-8">
                        <div className="flex items-center gap-3">
                            {(school as any).logo && <img src={String((school as any).logo)} alt={name} className="h-12 w-auto brightness-0 invert" />}
                            <span className="text-3xl font-black uppercase tracking-tighter">{name}</span>
                        </div>
                        <div className="space-y-4 opacity-60 italic max-w-md">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--school-secondary)] not-italic">School Anthem</h4>
                            <p className="text-sm leading-relaxed">{data.schoolAnthem}</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--school-secondary)]">Navigate</h4>
                            <ul className="space-y-3 text-sm opacity-60">
                                <li><Link to={basePath}>Home</Link></li>
                                <li><Link to={`${basePath}/events`}>Events</Link></li>
                                <li><Link to={`${basePath}/staff`}>Staff</Link></li>
                                <li><Link to={`${basePath}/contact`}>Contact</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--school-secondary)]">Contact</h4>
                            <ul className="space-y-3 text-sm opacity-60">
                                <li>{data.contact.phones[0]}</li>
                                <li>{data.contact.emails[0]}</li>
                                <li>{data.contact.address}</li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--school-secondary)]">AcademicX</h4>
                            <p className="text-xs opacity-40 leading-relaxed">
                                Powered by AcademicX. Building the future of school management.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 text-[10px] uppercase tracking-widest font-bold">
                    <span>© {new Date().getFullYear()} {name}</span>
                    <div className="flex gap-8">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </footer>
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
                            {data.about.imageUrls?.slice(0, 2).map((url, i) => (
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
