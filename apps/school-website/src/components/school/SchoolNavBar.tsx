import { Link } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { resolveSchoolLogoUrl } from '@/lib/media';

export type NavVariant = 'classic' | 'minimal' | 'pill' | 'split' | 'centered' | 'bold';

export function SchoolNavBar({
    schoolName,
    logoUrl,
    basePath,
    variant,
}: {
    schoolName: string;
    logoUrl?: string;
    basePath: string;
    variant: NavVariant;
}) {
    const [open, setOpen] = useState(false);
    const root = basePath || '/';
    const logoSrc = logoUrl ? resolveSchoolLogoUrl(logoUrl) : '';
    const links = [
        { to: root, label: 'Home', end: true },
        { to: `${basePath}/events`, label: 'Events' },
        { to: `${basePath}/gallery`, label: 'Gallery' },
        { to: `${basePath}/news`, label: 'News' },
        { to: `${basePath}/staff`, label: 'Staff' },
    ];

    const bar = cn(
        'sticky top-0 z-40 w-full border-b backdrop-blur transition-colors',
        variant === 'classic' && 'border-black/10 bg-white/90',
        variant === 'minimal' && 'border-transparent bg-school-background/95',
        variant === 'pill' && 'border-black/5 bg-white/95',
        variant === 'split' && 'border-school-primary/20 bg-school-primary text-white',
        variant === 'centered' && 'border-black/10 bg-white/95',
        variant === 'bold' && 'border-4 border-school-text bg-school-background',
    );

    const linkClass = cn(
        'text-sm font-medium transition-opacity hover:opacity-80',
        variant === 'split' ? 'text-white' : 'text-school-text',
    );

    return (
        <header className={bar}>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                <Link to={root} className="flex items-center gap-2 font-display text-lg font-bold">
                    {logoSrc ? <img src={logoSrc} alt="" className="h-9 w-auto object-contain" /> : null}
                    <span className={variant === 'split' ? 'text-white' : 'text-school-text'}>{schoolName}</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {links.map((l) => (
                        <Link key={l.label} to={l.to} className={linkClass}>
                            {l.label}
                        </Link>
                    ))}
                    <Button variant={variant === 'split' ? 'secondary' : 'outline'} size="sm" asChild>
                        <Link to={`${basePath}/results`}>
                            <LogIn className="mr-1 h-4 w-4" />
                            Student
                        </Link>
                    </Button>
                </nav>

                <button type="button" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {open ? (
                <div className="border-t border-black/10 bg-white px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-3">
                        {links.map((l) => (
                            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="text-school-text">
                                {l.label}
                            </Link>
                        ))}
                        <Link to={`${basePath}/results`} onClick={() => setOpen(false)}>
                            Student login
                        </Link>
                    </div>
                </div>
            ) : null}
        </header>
    );
}

