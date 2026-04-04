import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';
import { listAcademicSessions } from '@/lib/api';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { useBasePath } from '@/hooks/useBasePath';

export function FeesPage({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const { school } = useSchoolSite();
    const navigate = useNavigate();
    const basePath = useBasePath();
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
    const [feesDoc, setFeesDoc] = useState<any>(null);
    const [fetchingFees, setFetchingFees] = useState(false);

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

    async function handleCheckFees() {
        if (!selectedSession || !selectedTerm) return;
        setFetchingFees(true);
        setFeesDoc(null);
        try {
            // Mocking fees fetching for now
            setTimeout(() => {
                setFeesDoc({
                    published: true,
                    total: 150000,
                    breakdown: [
                        { item: 'Tuition', amount: 100000 },
                        { item: 'Development Levy', amount: 25000 },
                        { item: 'Laboratory Fee', amount: 15000 },
                        { item: 'Library Fee', amount: 10000 },
                    ],
                    alreadyPaid: false
                });
                setFetchingFees(false);
            }, 1000);
        } catch (err) {
            console.error('Failed to check fees:', err);
            setFetchingFees(false);
        }
    }

    if (!school) return null;

    const TOTAL_CHARGE_RATE = 0.019; // 1.9%
    const MAX_FEE = 2500;

    const calculateProcessingFee = (amount: number) => {
        const fee = amount * TOTAL_CHARGE_RATE;
        return Math.min(fee, MAX_FEE);
    };

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
                    onClick={handleCheckFees}
                    disabled={fetchingFees || loading}
                    className="w-full bg-[var(--school-primary)] text-white py-7 rounded-xl font-bold"
                >
                    {fetchingFees ? <Loader2 className="animate-spin" /> : "Check Fees"}
                </Button>
            </div>

            {fetchingFees ? (
                <div className="py-20 text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-[var(--school-primary)] opacity-20" />
                </div>
            ) : feesDoc ? (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-black/5">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">Fee Breakdown</h3>
                            <p className="text-sm text-slate-500">{selectedSession} - {selectedTerm}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-[var(--school-primary)]">₦{feesDoc.total.toLocaleString()}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Outstanding</p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-4">
                        {feesDoc.breakdown.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-slate-600">
                                <span>{item.item}</span>
                                <span className="font-mono font-bold">₦{item.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        
                        <div className="pt-6 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Processing Fee (1.9%)</span>
                                <span className="font-mono">₦{calculateProcessingFee(feesDoc.total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2">
                                <span>Total to Pay</span>
                                <span className="text-[var(--school-primary)] font-mono">₦{(feesDoc.total + calculateProcessingFee(feesDoc.total)).toLocaleString()}</span>
                            </div>
                        </div>

                        <Button className="w-full bg-[var(--school-primary)] text-white py-8 rounded-2xl text-lg font-bold shadow-lg mt-8">
                            <CreditCard className="mr-2" /> Pay Fees Now
                        </Button>
                        
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-4">
                            <ShieldCheck size={14} />
                            <span>Securely processed via Squad by GTBank</span>
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400">Select session and term to check outstanding fees.</p>
                </div>
            )}

            {!isEmbedded && <StudentAppPrompt schoolId={school.$id} />}
        </div>
    );

    if (isEmbedded) return content;

    return (
        <SchoolSubPage title="School Fees Portal" subtitle="Manage your academic payments securely.">
            {content}
        </SchoolSubPage>
    );
}
