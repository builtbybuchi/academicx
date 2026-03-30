import { useSchoolSite } from '@/context/SchoolSiteContext';
import { SubPageHero } from '@/templates/SharedTemplateComponents';

export function SchoolSubPage({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    const { school, loading } = useSchoolSite();
    if (loading) return null;
    if (!school) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <SubPageHero title={title} subtitle={subtitle} />
            <main className="container mx-auto px-4 pb-20 flex-1">
                {children}
            </main>
        </div>
    );
}
