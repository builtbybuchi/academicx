import { Link } from 'react-router-dom';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { useBasePath } from '@/hooks/useBasePath';
import { resolveSchoolLogoUrl } from '@/lib/media';

export function NotFoundPage() {
    const basePath = useBasePath();
    const { school, data } = useSchoolSite();
    const logo = school ? resolveSchoolLogoUrl(String((school as any).logo || '')) : '';
    const schoolName = String((school as any)?.name || 'School');

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
            <div className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white shadow-2xl p-8 text-center space-y-6">
                {logo ? (
                    <img src={logo} alt={schoolName} className="h-14 w-auto mx-auto object-contain" />
                ) : null}
                <p className="text-xs font-bold tracking-[0.3em] text-slate-400">404</p>
                <h1 className="text-3xl font-black" style={{ color: 'var(--school-primary)' }}>
                    Page Not Found
                </h1>
                <p className="text-slate-500">
                    This page does not exist on {schoolName}. Use the links below to continue browsing.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link to={basePath || '/'} className="px-5 py-3 rounded-xl text-white font-bold" style={{ backgroundColor: 'var(--school-primary)' }}>
                        Go Home
                    </Link>
                    <Link to={`${basePath}/events`} className="px-5 py-3 rounded-xl border border-slate-200 font-semibold text-slate-700">
                        View Events
                    </Link>
                </div>
                <p className="text-xs text-slate-400">{data.contact?.emails?.[0] || data.contact?.phones?.[0] || 'Please contact school admin for help.'}</p>
            </div>
        </div>
    );
}
