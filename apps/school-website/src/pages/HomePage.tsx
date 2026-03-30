import { useSchoolSite } from '@/context/SchoolSiteContext';
import { TEMPLATES } from '@/templates/registry';

export function HomePage() {
    const { templateId, loading, error } = useSchoolSite();
    
    // TemplateLayout handles loading and base error states
    if (loading || error) return null;
    
    const T = TEMPLATES[templateId] || TEMPLATES.template1;
    return <T />;
}
