import { useEffect } from 'react';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';

const SESSION_KEY = 'academicx_student_demo';

export function FeesPage() {
    const { school } = useSchoolSite();

    useEffect(() => {
        try {
            sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
            /* ignore */
        }
    }, []);

    if (!school) return null;

    return (
        <>
            <SchoolSubPage title="School fees">
                <p className="text-school-text/80">Fees payment flow will be integrated here.</p>
            </SchoolSubPage>
            <StudentAppPrompt schoolId={school.$id} />
        </>
    );
}
