import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';
import { listAcademicSessions, getStudentResults } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useBasePath } from '@/hooks/useBasePath';

export function ResultsPage({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const { school } = useSchoolSite();
    const navigate = useNavigate();
    const basePath = useBasePath();
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [fetchingResults, setFetchingResults] = useState(false);

    const studentId = sessionStorage.getItem('student_id');

    useEffect(() => {
        if (!studentId && !isEmbedded) {
            navigate(`${basePath}/login`);
            return;
        }
        if (school) {
            loadSessions();
        }
    }, [school, studentId, navigate, basePath, isEmbedded]);

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

    const content = (
        <div className={`space-y-12 ${isEmbedded ? '' : 'max-w-4xl mx-auto'}`}>
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
                <div className="grid gap-6">
                    {/* Render results list */}
                    {results.map((res, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-lg">{res.subjectName}</h4>
                                <p className="text-sm text-slate-500">Score: {res.totalScore} | Grade: {res.grade}</p>
                            </div>
                            <Button variant="outline" size="sm">Download PDF</Button>
                        </div>
                    ))}
                </div>
            ) : !loading && (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400">Select session and term to check results.</p>
                </div>
            )}

            {!isEmbedded && <StudentAppPrompt schoolId={school.$id} />}
        </div>
    );

    if (isEmbedded) return content;

    return (
        <SchoolSubPage title="Academic Results" subtitle="View and download your termly performance reports.">
            {content}
        </SchoolSubPage>
    );
}
