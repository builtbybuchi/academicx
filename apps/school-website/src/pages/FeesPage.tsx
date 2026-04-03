import { useEffect, useState } from 'react';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';
import { listAcademicSessions } from '@/lib/api';
import { Loader2, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

export function FeesPage() {
    const { school } = useSchoolSite();
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
    const [feesDoc, setFeesDoc] = useState<any>(null);
    const [fetchingFees, setFetchingFees] = useState(false);

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

    async function handleCheckFees() {
        if (!selectedSession || !selectedTerm) return;
        setFetchingFees(true);
        setFeesDoc(null);
        try {
            // Mocking fees fetching for now as we don't have a direct getSchoolFees call
            // In a real app, we would query the payments/fees collection
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

    const SQUAD_CHARGE = 0.012; // 1.2%
    const PLATFORM_FEE = 0.005; // 0.5%
    const TOTAL_CHARGE_RATE = 0.019; // 1.9%
    const MAX_FEE = 2500;

    const calculateProcessingFee = (amount: number) => {
        const fee = amount * TOTAL_CHARGE_RATE;
        return Math.min(fee, MAX_FEE);
    };

    return (
        <SchoolSubPage title="School Fees Portal" subtitle="Manage your academic payments securely.">
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
                    <div className="grid md:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="md:col-span-3 space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg space-y-6">
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    <CreditCard className="text-[var(--school-primary)]" />
                                    Fees Breakdown
                                </h3>
                                <div className="space-y-4">
                                    {feesDoc.breakdown.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-slate-600">{item.item}</span>
                                            <span className="font-bold">₦{item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-4 text-xl">
                                        <span className="font-black text-slate-900">Total Amount</span>
                                        <span className="font-black text-[var(--school-primary)]">₦{feesDoc.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-8">
                                <div>
                                    <h3 className="font-bold text-xl mb-2">Payment Summary</h3>
                                    <p className="text-white/50 text-sm">Including processing fees.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm opacity-70">
                                        <span>School Fees</span>
                                        <span>₦{feesDoc.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm opacity-70">
                                        <span>Processing Fee (1.9%)</span>
                                        <span>₦{calculateProcessingFee(feesDoc.total).toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">Payable Now</span>
                                        <span className="text-2xl font-black text-[var(--school-secondary)]">
                                            ₦{(feesDoc.total + calculateProcessingFee(feesDoc.total)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <Button className="w-full bg-[var(--school-secondary)] text-white py-8 rounded-2xl font-black text-lg hover:opacity-90">
                                    Pay with SquadCo
                                </Button>
                                <div className="flex items-center gap-2 justify-center text-[10px] uppercase tracking-widest opacity-40">
                                    <ShieldCheck size={14} />
                                    Secure SSL Encrypted
                                </div>
                            </div>
                        </div>
                    </div>
                ) : !loading && (
                    <div className="bg-amber-50 rounded-3xl border border-amber-100 p-12 text-center space-y-6">
                        <AlertCircle className="h-12 w-12 mx-auto text-amber-400" />
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-amber-900">Fees Not Published</h3>
                            <p className="text-amber-700/70 max-w-sm mx-auto">
                                The school has not yet published the fees for this session and term. Please check back later.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold">Need a Receipt?</h3>
                        <p className="text-slate-500">
                            Download the AcademicX Student App to view your full payment history and download official receipts.
                        </p>
                    </div>
                    <StudentAppPrompt schoolId={school.$id} />
                </div>
            </div>
        </SchoolSubPage>
    );
}
