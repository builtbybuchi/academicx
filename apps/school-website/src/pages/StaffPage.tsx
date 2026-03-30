import { ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useSchoolSite } from '@/context/SchoolSiteContext';

const STAFF_LOGIN = 'https://academicxstaff.onrender.com/';
const DOWNLOADS = 'https://academicxlanding.onrender.com/downloads';
const STAFF_GUIDE = 'https://academicxlanding.onrender.com/staff-guide';

export function StaffPage() {
    return (
        <SchoolSubPage title="Staff Portal">
            <div className="space-y-12">
                <section className="rounded-[2rem] bg-slate-900 p-12 md:p-20 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 text-white/5">
                        <Users size={200} />
                    </div>
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="font-[var(--school-font-display)] text-4xl md:text-5xl font-bold">Faculty Resources</h2>
                        <p className="text-xl text-white/70 leading-relaxed">
                            Access your administrative tools, student records, and digital classroom management systems.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 pt-4">
                            <Button size="lg" className="bg-[var(--school-primary)] text-white hover:opacity-90 rounded-full px-10 py-8 text-lg font-bold" asChild>
                                <a href={STAFF_LOGIN} target="_blank" rel="noreferrer">
                                    Launch Dashboard
                                    <ExternalLink className="ml-3 h-5 w-5" />
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-8 text-lg font-bold" asChild>
                                <a href={DOWNLOADS} target="_blank" rel="noreferrer">
                                    Download App
                                    <ExternalLink className="ml-3 h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-black/5 space-y-4">
                        <h3 className="text-xl font-bold">Need Assistance?</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Our comprehensive staff guide covers everything from result entry to attendance tracking.
                        </p>
                        <Button variant="ghost" className="p-0 h-auto text-[var(--school-primary)] font-bold uppercase tracking-widest text-xs hover:bg-transparent" asChild>
                            <a href={STAFF_GUIDE} target="_blank" rel="noreferrer">
                                Read the Guide →
                            </a>
                        </Button>
                    </div>
                    <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200 space-y-4">
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest text-xs">Admin Notice</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Staff credentials are provided by the school administrator. Please contact the IT department if you've forgotten your password.
                        </p>
                    </div>
                </div>
            </div>
        </SchoolSubPage>
    );
}
