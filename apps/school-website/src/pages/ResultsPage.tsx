import { useEffect } from 'react';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';

const SESSION_KEY = 'academicx_student_demo';

export function ResultsPage() {
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
            <SchoolSubPage title="Results">
                <p className="text-school-text/80">
                    Student authentication will be connected here. For now this page is a placeholder after &ldquo;login&rdquo;.
                </p>
            </SchoolSubPage>
            <StudentAppPrompt schoolId={school.$id} />
        </>
    );
}
