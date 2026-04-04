import React, { useEffect } from 'react';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Template1Layout } from './Template1';
import { Template2Layout } from './Template2';
import { Template3Layout } from './Template3';
import { Template4Layout } from './Template4';
import { Template5Layout } from './Template5';
import { Template6Layout } from './Template6';
import { Template7Layout } from './Template7';
import { Template8Layout } from './Template8';
import { Template9Layout } from './Template9';
import { Template10Layout } from './Template10';
import { Loader2 } from 'lucide-react';
import { Footer } from './SharedTemplateComponents';

export function TemplateLayout({ children }: { children: React.ReactNode }) {
    const { school, loading, error, templateId, data } = useSchoolSite();
    
    useEffect(() => {
        if (school) {
            // Update Title
            const schoolName = String((school as any).name || 'School');
            document.title = schoolName;

            // Update Favicon
            const logo = (school as any).logo;
            if (logo) {
                let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = String(logo);
            }
        }
    }, [school]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Loading school site...</p>
                </div>
            </div>
        );
    }

    if (error || !school) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
                <div className="max-w-md space-y-6 p-8 rounded-2xl border border-gray-100 shadow-xl">
                    <h1 className="text-6xl font-black text-gray-200">404</h1>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">School Not Found</h2>
                        <p className="text-gray-600">{error || 'The school you are looking for does not exist or has been moved.'}</p>
                    </div>
                    <a href="/" className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Return to AcademicX
                    </a>
                </div>
            </div>
        );
    }

    const content = (
        <>
            {children}
            <Footer 
                schoolName={String((school as any).name || 'School')} 
                logoUrl={(school as any).logo} 
                contact={data.contact}
            />
        </>
    );

    switch (templateId) {
        case 'template1': return <Template1Layout>{content}</Template1Layout>;
        case 'template2': return <Template2Layout>{content}</Template2Layout>;
        case 'template3': return <Template3Layout>{content}</Template3Layout>;
        case 'template4': return <Template4Layout>{content}</Template4Layout>;
        case 'template5': return <Template5Layout>{content}</Template5Layout>;
        case 'template6': return <Template6Layout>{content}</Template6Layout>;
        case 'template7': return <Template7Layout>{content}</Template7Layout>;
        case 'template8': return <Template8Layout>{content}</Template8Layout>;
        case 'template9': return <Template9Layout>{content}</Template9Layout>;
        case 'template10': return <Template10Layout>{content}</Template10Layout>;
        default: return <Template1Layout>{content}</Template1Layout>;
    }
}
