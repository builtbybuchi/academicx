import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Models } from 'appwrite';
import { submitContactMessage } from '@/lib/api';
import { useSchoolSite } from '@/context/SchoolSiteContext';

export function SubPageHero({ title, subtitle }: { title: string; subtitle?: string }) {
    const { data, templateId } = useSchoolSite();
    const heroImage = data.hero.imageUrl;

    // Different styles based on template
    const baseClasses = "relative py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 mb-12";
    
    const renderHero = () => {
        switch (templateId) {
            case 'template1':
                return (
                    <section className={`${baseClasses} bg-[var(--school-primary)] text-white border-b-8 border-[var(--school-secondary)]`}>
                        {heroImage && <div className="absolute inset-0 opacity-20 grayscale"><img src={heroImage} alt="" className="w-full h-full object-cover" /></div>}
                        <div className="relative z-10 max-w-4xl">
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-[var(--school-font-display)] drop-shadow-lg uppercase tracking-tighter">{title}</h1>
                            {subtitle && <p className="text-xl md:text-2xl opacity-80 max-w-2xl mx-auto font-serif italic">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template2':
                return (
                    <section className={`${baseClasses} bg-black text-white text-left items-start px-8 md:px-20`}>
                        {heroImage && <div className="absolute inset-0 opacity-40"><img src={heroImage} alt="" className="w-full h-full object-cover" /></div>}
                        <div className="relative z-10 max-w-4xl">
                            <div className="w-20 h-2 bg-[var(--school-primary)] mb-8" />
                            <h1 className="text-6xl md:text-8xl font-black mb-6 font-[var(--school-font-display)] uppercase leading-none tracking-tighter italic">{title}</h1>
                            {subtitle && <p className="text-xl opacity-70 max-w-xl font-medium tracking-tight uppercase">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template3':
                return (
                    <section className={`${baseClasses} bg-white text-black border-y-4 border-black`}>
                        <div className="relative z-10 max-w-5xl w-full">
                            <div className="flex items-center gap-8 mb-8">
                                <div className="flex-1 h-px bg-black" />
                                <span className="text-xs font-bold uppercase tracking-[0.5em] opacity-40">AcademicX Magazine</span>
                                <div className="flex-1 h-px bg-black" />
                            </div>
                            <h1 className="text-6xl md:text-9xl font-black mb-8 font-[var(--school-font-display)] tracking-tighter leading-none">{title}</h1>
                            {subtitle && <p className="text-2xl opacity-60 font-serif italic max-w-3xl mx-auto">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template4':
                return (
                    <section className={`${baseClasses} bg-gray-900 text-white skew-y-[-2deg] origin-top-left`}>
                        <div className="skew-y-[2deg] relative z-10 w-full">
                            <h1 className="text-6xl md:text-8xl font-black mb-4 font-[var(--school-font-display)] uppercase tracking-tighter italic drop-shadow-[8px_8px_0px_var(--school-primary)]">{title}</h1>
                            {subtitle && <div className="bg-[var(--school-secondary)] text-black inline-block px-6 py-2 font-black uppercase tracking-widest skew-x-[-12deg] mt-4"><span className="inline-block skew-x-[12deg]">{subtitle}</span></div>}
                        </div>
                    </section>
                );
            case 'template5':
                return (
                    <section className={`${baseClasses} bg-[#FDFCF9] text-black border-b border-black/5`}>
                        <div className="relative z-10 max-w-4xl">
                            <span className="text-[10px] uppercase tracking-[0.6em] opacity-40 mb-8 block">Refinement & Purpose</span>
                            <h1 className="text-5xl md:text-7xl font-light mb-8 font-[var(--school-font-display)] tracking-tight">{title}</h1>
                            {subtitle && <p className="text-xl opacity-50 font-light italic max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template6':
                return (
                    <section className={`${baseClasses} bg-[var(--school-primary)] text-white border-b-8 border-black`}>
                        <div className="relative z-10 bg-white text-black p-12 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full">
                            <h1 className="text-6xl md:text-8xl font-black mb-4 font-[var(--school-font-display)] uppercase tracking-tighter leading-none">{title}</h1>
                            {subtitle && <p className="text-xl font-bold uppercase tracking-tight opacity-70">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template7':
                return (
                    <section className={`${baseClasses} bg-white text-slate-900 pt-32 pb-20`}>
                        <div className="relative z-10 max-w-4xl">
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-[var(--school-font-display)] tracking-tight tracking-tighter leading-tight">{title}</h1>
                            <div className="w-12 h-1.5 bg-[var(--school-primary)] mx-auto rounded-full mb-8" />
                            {subtitle && <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template8':
                return (
                    <section className={`${baseClasses} bg-white text-[var(--school-primary)]`}>
                        <div className="relative z-10 max-w-4xl">
                            <div className="inline-block bg-[var(--school-accent)]/10 text-[var(--school-accent)] font-black uppercase text-xs tracking-widest px-4 py-2 rounded-lg mb-8 rotate-[-2deg]">Explore</div>
                            <h1 className="text-6xl md:text-8xl font-black mb-6 font-[var(--school-font-display)] leading-none tracking-tight">{title}</h1>
                            {subtitle && <p className="text-2xl font-bold text-[var(--school-secondary)] italic max-w-2xl mx-auto">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template9':
                return (
                    <section className={`${baseClasses} bg-slate-900 text-white border-l-[12px] border-blue-600 text-left items-start px-12 md:px-24`}>
                        <div className="relative z-10 max-w-4xl">
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-[var(--school-font-display)] tracking-tight leading-none">{title}</h1>
                            {subtitle && <p className="text-xl text-slate-300 font-medium max-w-2xl leading-relaxed border-l-2 border-white/20 pl-8 mt-8">{subtitle}</p>}
                        </div>
                    </section>
                );
            case 'template10':
                return (
                    <section className={`${baseClasses} bg-[#F4EFE6] text-[#2D3E27]`}>
                        <div className="relative z-10 max-w-4xl">
                            <div className="flex justify-center gap-2 mb-8 opacity-30">
                                {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#4A6741]" />)}
                            </div>
                            <h1 className="text-6xl md:text-8xl font-bold mb-8 font-[var(--school-font-display)] leading-none tracking-tight">{title}</h1>
                            {subtitle && <p className="text-2xl font-medium italic opacity-60 max-w-2xl mx-auto">{subtitle}</p>}
                        </div>
                    </section>
                );
            default:
                return (
                    <section className={baseClasses}>
                        <h1 className="text-5xl font-bold">{title}</h1>
                    </section>
                );
        }
    };

    return renderHero();
}

export function SchoolAnthemBlock({ text }: { text: string }) {
    if (!text) return null;
    return (
        <div className="p-8 bg-white shadow-sm border border-gray-100 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-[var(--school-primary)]">School Anthem</h3>
            <p className="whitespace-pre-line leading-relaxed opacity-80 italic">{text}</p>
        </div>
    );
}

export function SchoolPledgeBlock({ text }: { text: string }) {
    if (!text) return null;
    return (
        <div className="p-8 bg-white shadow-sm border border-gray-100 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-[var(--school-primary)]">School Pledge</h3>
            <p className="whitespace-pre-line leading-relaxed opacity-80 italic">{text}</p>
        </div>
    );
}

export function VisionMissionBlock({ vision, mission }: { vision: string; mission: string }) {
    return (
        <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-3xl font-bold text-[var(--school-primary)]">Our Vision</h3>
                <p className="text-lg leading-relaxed opacity-80">{vision || "To be a leading center of academic excellence and character development."}</p>
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-bold text-[var(--school-primary)]">Our Mission</h3>
                <p className="text-lg leading-relaxed opacity-80">{mission || "Providing a holistic education that empowers students to reach their full potential."}</p>
            </div>
        </div>
    );
}

export function CoreValuesBlock({ values }: { values: { text: string; icon?: string }[] }) {
    return (
        <div className="space-y-8">
            <h3 className="text-3xl font-bold text-[var(--school-primary)]">Core Values</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {values.map((v, i) => (
                    <div key={i} className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center transition-transform hover:-translate-y-1">
                        <div className="w-12 h-12 bg-[var(--school-primary)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--school-primary)]">
                            {/* Icon would go here - for now just index or generic */}
                            <span className="font-bold">{i + 1}</span>
                        </div>
                        <span className="font-bold text-lg">{v.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function WelcomeAddressBlock({ text }: { text: string }) {
    if (!text) return null;
    return (
        <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--school-primary)]">Welcome to our School</h2>
            <div className="w-24 h-1 bg-[var(--school-secondary)] mx-auto" />
            <p className="text-xl leading-relaxed opacity-80 italic">
                {text}
            </p>
        </div>
    );
}

export function EventsSection({ events, basePath }: { events: Models.Document[]; basePath: string }) {
    if (events.length === 0) return null;
    return (
        <section className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-4xl font-bold text-[var(--school-primary)]">Upcoming Events</h2>
                    <p className="opacity-60 mt-2">Stay updated with our latest school activities</p>
                </div>
                <Link to={`${basePath}/events`} className="text-[var(--school-primary)] font-bold hover:underline">View All</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.slice(0, 3).map((event: any) => (
                    <Link key={event.$id} to={`${basePath}/events/${event.$id}`} className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-all hover:shadow-xl">
                        {event.image && (
                            <div className="aspect-[16/9] overflow-hidden">
                                <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex items-center gap-2 text-sm text-[var(--school-secondary)] font-bold mb-3">
                                <span>{event.date}</span>
                                <span>•</span>
                                <span>{event.location}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--school-primary)] transition-colors line-clamp-2">{event.title}</h3>
                            <p className="text-sm opacity-70 line-clamp-3 mb-4">{event.summary}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export function NewsSection({ news, basePath }: { news: Models.Document[]; basePath: string }) {
    if (news.length === 0) return null;
    return (
        <section className="bg-gray-50 py-20">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-bold text-[var(--school-primary)]">Latest News</h2>
                        <p className="opacity-60 mt-2">What's happening in our community</p>
                    </div>
                    <Link to={`${basePath}/news`} className="text-[var(--school-primary)] font-bold hover:underline">Read All</Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {news.slice(0, 4).map((item: any) => (
                        <Link key={item.$id} to={`${basePath}/news/${item.$id}`} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold mb-3 line-clamp-2 hover:text-[var(--school-primary)]">{item.title}</h3>
                            <p className="text-sm opacity-60 line-clamp-3 mb-4">{item.summary}</p>
                            <span className="text-xs font-medium opacity-40">{new Date(item.$createdAt).toLocaleDateString()}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function GallerySection({ images, basePath }: { images: Models.Document[]; basePath: string }) {
    if (images.length === 0) return null;
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 text-center mb-12">
                <h2 className="text-4xl font-bold text-[var(--school-primary)] mb-4">Our Gallery</h2>
                <p className="opacity-60">Glimpses of life at our school</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {images.slice(0, 8).map((img: any, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm">
                        <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                ))}
            </div>
            <div className="mt-12 text-center">
                <Link to={`${basePath}/gallery`}>
                    <button className="px-8 py-3 bg-[var(--school-primary)] text-white rounded-full font-bold hover:opacity-90 transition-opacity">
                        View Full Gallery
                    </button>
                </Link>
            </div>
        </section>
    );
}

export function ContactSection({ data, schoolId }: { data: any; schoolId: string }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');
        try {
            await (submitContactMessage as any)({
                schoolId,
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
            });
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Failed to send message:', err);
            setStatus('error');
        }
    }

    return (
        <section className="container mx-auto px-4 py-20">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
                <div className="bg-[var(--school-primary)] text-white p-12 md:w-1/3 space-y-8">
                    <h2 className="text-3xl font-bold">Get In Touch</h2>
                    <p className="opacity-70">Have questions? We're here to help you. Reach out to us via any of the following channels.</p>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">📍</div>
                            <div>
                                <h4 className="font-bold">Location</h4>
                                <p className="text-sm opacity-70">{data.address}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">📞</div>
                            <div>
                                <h4 className="font-bold">Phone</h4>
                                <p className="text-sm opacity-70">{data.phones?.join(', ')}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">✉️</div>
                            <div>
                                <h4 className="font-bold">Email</h4>
                                <p className="text-sm opacity-70">{data.emails?.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-12 md:w-2/3">
                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-3xl">✓</div>
                            <h3 className="text-2xl font-bold">Message Sent!</h3>
                            <p className="text-slate-500 max-w-sm">Thank you for reaching out. We've received your inquiry and will get back to you shortly.</p>
                            <button onClick={() => setStatus('idle')} className="text-[var(--school-primary)] font-bold hover:underline">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold opacity-70">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[var(--school-primary)]" 
                                        placeholder="John Doe" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold opacity-70">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[var(--school-primary)]" 
                                        placeholder="john@example.com" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-70">Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[var(--school-primary)]" 
                                    placeholder="How can we help?" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-70">Message</label>
                                <textarea 
                                    rows={4} 
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[var(--school-primary)]" 
                                    placeholder="Your message here..."
                                ></textarea>
                            </div>
                            {status === 'error' && <p className="text-red-500 text-sm">Failed to send message. Please try again later.</p>}
                            <button 
                                disabled={status === 'loading'}
                                className="w-full py-4 bg-[var(--school-primary)] text-white rounded-lg font-bold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
