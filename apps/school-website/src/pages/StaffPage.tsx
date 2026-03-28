import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolNavBar } from '@/components/school/SchoolNavBar';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';

const STAFF_LOGIN = 'https://academicxstaff.onrender.com/';
const DOWNLOADS = 'https://academicxlanding.onrender.com/downloads';
const STAFF_GUIDE = 'https://academicxlanding.onrender.com/staff-guide';

export function StaffPage() {
    const { school, loading } = useSchoolSite();
    const basePath = useBasePath();
    if (loading) return <div className="flex min-h-[40vh] items-center justify-center">Loading…</div>;
    if (!school) return null;
    const name = String(school.name || 'School');

    return (
        <div className="min-h-screen bg-school-background">
            <SchoolNavBar
                variant="classic"
                schoolName={name}
                logoUrl={school.logo ? String(school.logo) : undefined}
                basePath={basePath}
            />
            <div className="mx-auto max-w-6xl px-4 py-10">
                <section className="rounded-2xl bg-gradient-to-br from-school-primary to-school-secondary p-10 text-center text-white md:p-16">
                    <h1 className="font-display text-3xl font-bold md:text-4xl">Staff</h1>
                    <p className="mx-auto mt-4 max-w-xl text-white/90">Access your staff dashboard or download the staff app.</p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Button size="lg" variant="secondary" className="bg-white text-school-primary hover:bg-white/90" asChild>
                            <a href={STAFF_LOGIN} target="_blank" rel="noreferrer">
                                Staff Login
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                            <a href={DOWNLOADS} target="_blank" rel="noreferrer">
                                Download Staff App
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </section>
                <section className="mt-12 rounded-xl border border-black/10 bg-white p-8 text-center shadow-sm">
                    <p className="text-school-text/90">You can also get the app from your school admin.</p>
                    <p className="mt-4">
                        <a href={STAFF_GUIDE} target="_blank" rel="noreferrer" className="font-medium text-school-primary hover:underline">
                            Having issues? Read the Staff Guide
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}
