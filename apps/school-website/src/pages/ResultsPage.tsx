import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';
import { getStudentResults, getStudentByAdmissionNumber, listSubjects } from '@/lib/api';
import { useBasePath } from '@/hooks/useBasePath';
import { BookLoader, ButtonBarLoader } from '@/components/ui/BookLoader';
import { ReportCard } from '@/components/school/ReportCard';

export function ResultsPage({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const { school, sessions } = useSchoolSite();
    const navigate = useNavigate();
    const basePath = useBasePath();
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [student, setStudent] = useState<any>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [fetchingResults, setFetchingResults] = useState(false);
    const [popup, setPopup] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

    const studentId = sessionStorage.getItem('student_id');
    const sessionOptions = ((sessions || []) as any[])
        .map((item) => ({ $id: String(item.$id || item.id || item.name || 'session'), name: String(item.name || '').trim() }))
        .filter((item) => item.name.length > 0);

    const subjectsById = useMemo(() => {
        return subjects.reduce((acc, sub) => {
            acc[sub.$id] = sub.name;
            return acc;
        }, {} as Record<string, string>);
    }, [subjects]);

    useEffect(() => {
        if (!studentId && !isEmbedded) {
            navigate(`${basePath}/login`);
            return;
        }
        
        const loadInitialData = async () => {
            if (studentId && school?.$id) {
                try {
                    const [studentData, subjectsData] = await Promise.all([
                        getStudentByAdmissionNumber(school.$id, studentId),
                        listSubjects(school.$id)
                    ]);
                    setStudent(studentData);
                    setSubjects(subjectsData.documents || []);
                } catch (err) {
                    console.error('Failed to load student/subjects:', err);
                }
            }
            
            const fallbackSession = String((school as any)?.currentSession || '').trim();
            const fallbackTerm = String((school as any)?.currentTerm || '').trim();
            const optionSession = sessionOptions.length > 0 ? sessionOptions[0].name : fallbackSession;
            setSelectedSession(optionSession || '');
            if (fallbackTerm) setSelectedTerm(fallbackTerm);
            setLoading(false);
        };

        loadInitialData();
    }, [school, sessionOptions, studentId, navigate, basePath, isEmbedded]);

    const sessionOptionsFallback = sessionOptions.length > 0
        ? sessionOptions
        : (school ? [{ $id: 'current-session', name: String((school as any)?.currentSession || '').trim() || 'Current Session' }] : []);

    async function handleFetchResults() {
        if (!studentId || !selectedSession || !selectedTerm) {
            setPopup({ type: 'error', message: 'Please select both session and term before checking results.' });
            return;
        }
        if (fetchingResults) return;
        setFetchingResults(true);
        setPopup(null);
        try {
            const res = await getStudentResults(studentId, selectedTerm, selectedSession);
            const rows = res.documents || [];
            
            // In the student app, we already updated getStudentResults to only return published results
            // But we filter here just in case, and to handle the "not published" message
            const publishedRows = rows.filter((item: any) => item.isPublished === true);

            if (publishedRows.length > 0) {
                setResults(publishedRows);
                setPopup({ type: 'success', message: `Loaded ${publishedRows.length} result record${publishedRows.length > 1 ? 's' : ''} for ${selectedTerm}, ${selectedSession}.` });
            } else if (rows.length > 0) {
                setResults([]);
                setPopup({ type: 'warning', message: 'Results for this term have not been published by the school administration yet.' });
            } else {
                setResults([]);
                setPopup({ type: 'error', message: 'No result records found for the selected term and session.' });
            }
        } catch (err) {
            console.error('Failed to fetch results:', err);
            setResults([]);
            setPopup({ type: 'error', message: 'We cannot access this result for the selected term and session.' });
        } finally {
            setFetchingResults(false);
        }
    }

    if (!school) return null;

    const content = (
        <div className={`space-y-12 ${isEmbedded ? '' : 'max-w-4xl mx-auto'}`}>
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-black/5 grid md:grid-cols-3 gap-6 items-end no-print">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Academic Session</label>
                    <select 
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[var(--school-primary)]"
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                    >
                        {sessionOptionsFallback.map((s) => <option key={s.$id} value={s.name}>{s.name}</option>)}
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
                    {fetchingResults ? <ButtonBarLoader /> : "Check Results"}
                </Button>
            </div>

            {popup && (
                <div className={`rounded-2xl border px-6 py-4 no-print ${
                    popup.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : popup.type === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                    <p className="font-semibold">
                        {popup.type === 'success' ? 'Results loaded' : popup.type === 'warning' ? 'Result not published' : 'Result unavailable'}
                    </p>
                    <p className="text-sm mt-1">{popup.message}</p>
                </div>
            )}

            {fetchingResults ? (
                <div className="py-20 text-center">
                    <div className="flex justify-center">
                        <BookLoader label="Checking results..." />
                    </div>
                </div>
            ) : results.length > 0 ? (
                <div className="grid gap-6">
                    <ReportCard 
                        data={{
                            results,
                            student,
                            term: selectedTerm,
                            session: selectedSession
                        }}
                        subjectsById={subjectsById}
                        school={school}
                    />
                </div>
            ) : !loading && (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 no-print">
                    <p className="text-slate-400">Select session and term, then click Check Results.</p>
                </div>
            )}

            {!isEmbedded && <div className="no-print"><StudentAppPrompt schoolId={school.$id} /></div>}
        </div>
    );

    if (isEmbedded) return content;

    return (
        <SchoolSubPage title="Academic Results" subtitle="View and download your termly performance reports.">
            {content}
        </SchoolSubPage>
    );
}
