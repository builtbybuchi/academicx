import { useSchoolSite } from '@/context/SchoolSiteContext';
import { TEMPLATES } from '@/templates/registry';

export function HomePage() {
    const { templateId, loading, error } = useSchoolSite();
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-school-background text-school-text">
                Loading…
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-school-background p-8 text-center text-red-600">
                {error}
            </div>
        );
    }
    const T = TEMPLATES[templateId] || TEMPLATES.template1;
    return <T />;
}
