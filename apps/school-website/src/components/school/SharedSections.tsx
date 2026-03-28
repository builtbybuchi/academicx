import { useState } from 'react';
import type { Models } from 'appwrite';
import { ChevronLeft, ChevronRight, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ContactForm } from '@/components/school/ContactForm';
import type { SchoolDataJson } from '@/types/school-data';
import { eventImage, galleryThumb, newsImage, resolveAboutImages, resolveHeroImage } from '@/lib/media';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function HeroClassic({
    data,
    schoolName,
    className,
}: {
    data: SchoolDataJson;
    schoolName: string;
    className?: string;
}) {
    const bg = resolveHeroImage(data);
    return (
        <section className={cn('relative min-h-[56vh] overflow-hidden', className)}>
            {bg ? (
                <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-school-primary to-school-secondary opacity-90" />
            )}
            <div className="relative z-10 flex min-h-[56vh] flex-col items-center justify-center px-4 py-20 text-center text-white">
                <p className="mb-2 text-sm uppercase tracking-[0.2em] opacity-90">{schoolName}</p>
                <h1 className="font-display max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">{data.hero.headline}</h1>
                <p className="mt-4 max-w-2xl text-lg text-white/90">{data.hero.subheadline}</p>
            </div>
        </section>
    );
}

export function AboutSection({ data, className }: { data: SchoolDataJson; className?: string }) {
    const imgs = resolveAboutImages(data);
    return (
        <section className={cn('mx-auto max-w-6xl px-4 py-16', className)}>
            <h2 className="font-display text-3xl font-bold text-school-text">{data.about.title || 'About Us'}</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="prose prose-lg max-w-none text-school-text/90">
                    {data.about.body.split('\n').map((p, idx) => (
                        <p key={idx}>{p}</p>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {imgs.slice(0, 4).map((src) => (
                        <img key={src} src={src} alt="" className="h-40 w-full rounded-lg object-cover" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function TextCard({ title, body, className }: { title: string; body: string; className?: string }) {
    if (!body?.trim()) return null;
    return (
        <section className={cn('mx-auto max-w-4xl px-4 py-10', className)}>
            <Card>
                <CardContent className="p-8">
                    <h2 className="font-display text-2xl font-semibold text-school-text">{title}</h2>
                    <p className="mt-4 whitespace-pre-wrap text-school-text/85">{body}</p>
                </CardContent>
            </Card>
        </section>
    );
}

export function ValuesGrid({ values, className }: { values: string[]; className?: string }) {
    if (!values?.length) return null;
    return (
        <section className={cn('bg-black/[0.03] py-16', className)}>
            <div className="mx-auto max-w-6xl px-4">
                <h2 className="font-display text-center text-3xl font-bold text-school-text">Core Values</h2>
                <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {values.map((v) => (
                        <li key={v} className="rounded-xl border border-black/10 bg-white px-6 py-4 text-center font-medium text-school-text shadow-sm">
                            {v}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export function EventsStrip({
    docs,
    basePath,
    className,
}: {
    docs: Models.Document[];
    basePath: string;
    className?: string;
}) {
    const slice = docs.slice(0, 4);
    if (!slice.length) return null;
    return (
        <section className={cn('mx-auto max-w-6xl px-4 py-16', className)}>
            <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-3xl font-bold text-school-text">Events</h2>
                <Link to={`${basePath}/events`} className="text-sm font-medium text-school-primary hover:underline">
                    View all
                </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {slice.map((e) => (
                    <Card key={e.$id} className="overflow-hidden">
                        {eventImage(e) ? (
                            <img src={eventImage(e)} alt="" className="h-36 w-full object-cover" />
                        ) : (
                            <div className="h-36 bg-school-primary/15" />
                        )}
                        <CardContent className="p-4">
                            <p className="text-xs text-school-text/60">{String(e.date || '')}</p>
                            <h3 className="mt-1 font-semibold text-school-text">{String(e.title || '')}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

export function NewsStrip({
    docs,
    basePath,
    className,
}: {
    docs: Models.Document[];
    basePath: string;
    className?: string;
}) {
    const slice = docs.slice(0, 4);
    if (!slice.length) return null;
    return (
        <section className={cn('mx-auto max-w-6xl px-4 py-16', className)}>
            <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-3xl font-bold text-school-text">Latest News</h2>
                <Link to={`${basePath}/news`} className="text-sm font-medium text-school-primary hover:underline">
                    View all
                </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
                {slice.map((n) => (
                    <Card key={n.$id} className="overflow-hidden md:flex">
                        {newsImage(n) ? (
                            <img src={newsImage(n)} alt="" className="h-48 w-full object-cover md:h-auto md:w-48" />
                        ) : (
                            <div className="h-48 w-full bg-school-secondary/20 md:w-48" />
                        )}
                        <CardContent className="p-6">
                            <h3 className="font-display text-xl font-semibold text-school-text">{String(n.title || '')}</h3>
                            <p className="mt-2 line-clamp-3 text-sm text-school-text/80">{String(n.summary || '')}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

export function GalleryTeaser({
    docs,
    basePath,
    className,
}: {
    docs: Models.Document[];
    basePath: string;
    className?: string;
}) {
    const slice = docs.slice(0, 6);
    if (!slice.length) return null;
    return (
        <section className={cn('py-16', className)}>
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="font-display text-3xl font-bold text-school-text">Gallery</h2>
                    <Link to={`${basePath}/gallery`} className="text-sm font-medium text-school-primary hover:underline">
                        View all
                    </Link>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3">
                    {slice.map((g) => (
                        <img key={g.$id} src={galleryThumb(g)} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function TestimonialCarousel({ docs, className }: { docs: Models.Document[]; className?: string }) {
    const [i, setI] = useState(0);
    if (!docs.length) return null;
    const t = docs[i % docs.length];
    const quote = String(t.message || '');
    const name = String(t.name || '');
    const role = String(t.role || '');
    return (
        <section className={cn('bg-school-primary/10 py-16', className)}>
            <div className="mx-auto max-w-3xl px-4 text-center">
                <h2 className="font-display text-3xl font-bold text-school-text">Parent Testimonials</h2>
                <div className="relative mt-10 rounded-2xl bg-white p-8 shadow-md">
                    <p className="text-lg italic text-school-text/90">&ldquo;{quote}&rdquo;</p>
                    <p className="mt-6 font-semibold text-school-text">{name}</p>
                    {role ? <p className="text-sm text-school-text/60">{role}</p> : null}
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            type="button"
                            className="rounded-full border border-black/10 p-2 hover:bg-black/5"
                            onClick={() => setI((x) => (x - 1 + docs.length) % docs.length)}
                            aria-label="Previous"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            className="rounded-full border border-black/10 p-2 hover:bg-black/5"
                            onClick={() => setI((x) => (x + 1) % docs.length)}
                            aria-label="Next"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function AccreditationsBlock({
    title,
    docs,
    className,
}: {
    title: string;
    docs: Models.Document[];
    className?: string;
}) {
    if (!docs.length) return null;
    return (
        <section className={cn('mx-auto max-w-6xl px-4 py-12', className)}>
            <h2 className="font-display text-center text-2xl font-bold text-school-text">{title}</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-8">
                {docs.map((d) => (
                    <div key={d.$id} className="flex w-36 flex-col items-center text-center">
                        {d.logo ? <img src={String(d.logo)} alt="" className="h-16 w-auto object-contain" /> : <div className="h-16 w-16 rounded-full bg-school-accent/20" />}
                        <p className="mt-2 text-sm font-medium text-school-text">{String(d.name || '')}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function SocialIcon({ href, children }: { href?: string; children: React.ReactNode }) {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noreferrer" className="text-school-primary hover:opacity-80">
            {children}
        </a>
    );
}

export function GetInTouch({
    data,
    schoolId,
    basePath,
    className,
}: {
    data: SchoolDataJson;
    schoolId: string;
    basePath: string;
    className?: string;
}) {
    const c = data.contact;
    return (
        <section id="contact" className={cn('border-t border-black/10 py-16', className)}>
            <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2">
                <div>
                    <h2 className="font-display text-3xl font-bold text-school-text">Get In Touch</h2>
                    <p className="mt-4 whitespace-pre-wrap text-school-text/85">{c.address}</p>
                    <div className="mt-4 space-y-2 text-sm">
                        {(c.phones || []).map((p) => (
                            <p key={p}>
                                <a href={`tel:${p}`} className="text-school-primary hover:underline">
                                    {p}
                                </a>
                            </p>
                        ))}
                        {(c.emails || []).map((em) => (
                            <p key={em}>
                                <a href={`mailto:${em}`} className="text-school-primary hover:underline">
                                    {em}
                                </a>
                            </p>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-school-text/70">
                        <span className="font-semibold">Hours:</span> {c.schoolHours}
                    </p>
                    <div className="mt-4 flex gap-3">
                        <SocialIcon href={c.social?.facebook}>
                            <Facebook className="h-5 w-5" />
                        </SocialIcon>
                        <SocialIcon href={c.social?.instagram}>
                            <Instagram className="h-5 w-5" />
                        </SocialIcon>
                        <SocialIcon href={c.social?.youtube}>
                            <Youtube className="h-5 w-5" />
                        </SocialIcon>
                        <SocialIcon href={c.social?.linkedin}>
                            <Linkedin className="h-5 w-5" />
                        </SocialIcon>
                    </div>
                    <p className="mt-6 text-xs text-school-text/50">
                        Public pages: <Link to={basePath}>Home</Link>
                    </p>
                </div>
                <ContactForm schoolId={schoolId} />
            </div>
        </section>
    );
}
