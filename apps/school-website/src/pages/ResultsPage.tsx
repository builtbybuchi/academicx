import { useEffect } from 'react';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';

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
            <SchoolSubPage title="Academic Results">
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-8 max-w-2xl mx-auto shadow-xl shadow-black/5">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold">Secure Access</h2>
                        <p className="text-slate-500 leading-relaxed">
                            For security reasons, academic results are now exclusively available through the AcademicX Student App. Please use the mobile app to view and download your report cards.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Button className="bg-blue-600 text-white rounded-full px-10 py-6 font-bold hover:bg-blue-700">
                            Download Mobile App
                        </Button>
                    </div>
                </div>
            </SchoolSubPage>
            <StudentAppPrompt schoolId={school.$id} />
        </>
    );
}
