import { SchoolNavBar, type NavVariant } from '@/components/school/SchoolNavBar';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';

export function SchoolSubPage({
    title,
    children,
    navVariant = 'classic',
}: {
    title: string;
    children: React.ReactNode;
    navVariant?: NavVariant;
}) {
    const { school, loading } = useSchoolSite();
    const basePath = useBasePath();
    if (loading) return <div className="flex min-h-[40vh] items-center justify-center">Loading…</div>;
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <div className="min-h-screen bg-school-background">
            <SchoolNavBar
                variant={navVariant}
                schoolName={name}
                logoUrl={school.logo ? String(school.logo) : undefined}
                basePath={basePath}
            />
            <main className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="font-display text-4xl font-bold text-school-text">{title}</h1>
                <div className="mt-8">{children}</div>
            </main>
        </div>
    );
}
