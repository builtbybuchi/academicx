import { useEffect, useState } from 'react';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';
import { listAcademicSessions, getStudentResults } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export function ResultsPage() {
    const { school } = useSchoolSite();
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [fetchingResults, setFetchingResults] = useState(false);

    const studentId = sessionStorage.getItem('student_id');

    useEffect(() => {
        if (school) {
            loadSessions();
        }
    }, [school]);

    async function loadSessions() {
        try {
            const res = await listAcademicSessions(school!.$id);
            setSessions(res.documents);
            if (res.documents.length > 0) {
                setSelectedSession(res.documents[0].name);
            }
        } catch (err) {
            console.error('Failed to load sessions:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleFetchResults() {
        if (!studentId || !selectedSession || !selectedTerm) return;
        setFetchingResults(true);
        try {
            const res = await getStudentResults(studentId, selectedTerm, selectedSession);
            setResults(res.documents);
        } catch (err) {
            console.error('Failed to fetch results:', err);
        } finally {
            setFetchingResults(false);
        }
    }

    if (!school) return null;

    return (
        <SchoolSubPage title="Academic Results" subtitle="View and download your termly performance reports.">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-black/5 grid md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Academic Session</label>
                        <select 
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[var(--school-primary)]"
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                        >
                            {sessions.map(s => <option key={s.$id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Term</label>
                        <select 
                            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[var(--school-primary)]"
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                        >
                            <option value="First Term">First Term</option>
                            <option value="Second Term">Second Term</option>
                            <option value="Third Term">Third Term</option>
                        </select>
                    </div>
                    <Button 
                        onClick={handleFetchResults}
                        disabled={fetchingResults || loading}
                        className="w-full bg-[var(--school-primary)] text-white py-7 rounded-xl font-bold"
                    >
                        {fetchingResults ? <Loader2 className="animate-spin" /> : "Check Results"}
                    </Button>
                </div>

                {fetchingResults ? (
                    <div className="py-20 text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-[var(--school-primary)] opacity-20" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {results.map(r => (
                            <div key={r.$id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl">{r.subjectName || 'Subject Result'}</h3>
                                    <p className="text-slate-500">{r.className} • {r.term} {r.session}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-[var(--school-primary)]">{r.totalScore}%</div>
                                    <div className="text-sm font-bold text-[var(--school-secondary)] uppercase tracking-widest">{r.grade}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !loading && (
                    <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">No Results Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                We couldn't find any published results for the selected session and term. Please contact the school if you believe this is an error.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-blue-900">Get the AcademicX App</h3>
                        <p className="text-blue-700/70">
                            Download our mobile app for a better experience, including instant notifications and offline access to your results.
                        </p>
                    </div>
                    <StudentAppPrompt schoolId={school.$id} />
                </div>
            </div>
        </SchoolSubPage>
    );
}
