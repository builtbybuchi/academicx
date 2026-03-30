import { useEffect } from 'react';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';

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
            <SchoolSubPage title="School Fees Portal">
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-8 max-w-2xl mx-auto shadow-xl shadow-black/5">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">Financial Records</h2>
                        <p className="text-slate-500 leading-relaxed text-lg">
                            Track payments, view invoices, and make secure fee payments through the official AcademicX Student App.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Due</span>
                            <div className="text-2xl font-bold">₦0.00</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Paid</span>
                            <div className="text-2xl font-bold">₦0.00</div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button className="w-full bg-green-600 text-white rounded-full px-10 py-8 font-bold hover:bg-green-700 text-lg shadow-xl shadow-green-900/10">
                            Pay via Mobile App
                        </Button>
                    </div>
                </div>
            </SchoolSubPage>
            <StudentAppPrompt schoolId={school.$id} />
        </>
    );
}
