import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';
import { getStudentFeeStatus, initiateSchoolFeePayment, listAcademicSessions } from '@/lib/api';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useBasePath } from '@/hooks/useBasePath';
import { BookLoader, ButtonBarLoader } from '@/components/ui/BookLoader';

export function FeesPage({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const { school } = useSchoolSite();
    const navigate = useNavigate();
    const basePath = useBasePath();
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
    const [feesDoc, setFeesDoc] = useState<any>(null);
    const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
    const [fetchingFees, setFetchingFees] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

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
        if (fetchingFees) return;
        setFetchingFees(true);
        setError(null);
        setFeesDoc(null);
        setFeeBreakdown(null);
        try {
            const response = await getStudentFeeStatus({
                studentId,
                term: selectedTerm,
                session: selectedSession,
            });
            setFeesDoc(response.fee);
            setFeeBreakdown(response.breakdown);
            setPayAmount(String(response.breakdown?.outstanding || ''));
        } catch (err) {
            console.error('Failed to check fees:', err);
            setError((err as Error).message || 'We cannot access this fee record for the selected term and session.');
        } finally {
            setFetchingFees(false);
        }
    }

    async function handlePayFees() {
        if (!feesDoc || !feeBreakdown || paying) return;

        const numeric = Number(payAmount || 0);
        const outstanding = Number(feeBreakdown.outstanding || 0);
        if (!Number.isFinite(numeric) || numeric <= 0) {
            setError('Enter a valid payment amount.');
            return;
        }
        if (numeric > outstanding) {
            setError('Payment amount cannot be higher than outstanding balance.');
            return;
        }

        setPaying(true);
        setError(null);
        try {
            const payment = await initiateSchoolFeePayment({
                feeId: feesDoc.$id,
                studentId: feesDoc.studentId,
                amount: numeric,
                term: selectedTerm,
                session: selectedSession,
            });

            if (payment.checkoutUrl) {
                window.open(payment.checkoutUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (err) {
            setError((err as Error).message || 'Unable to initiate payment.');
        } finally {
            setPaying(false);
        }
    }

    if (!school) return null;

    const squadFeeRate = 0.012;
    const platformFeeRate = 0.007;
    const payAmountNumber = Number(payAmount || 0);
    const squadFee = Math.max(0, payAmountNumber * squadFeeRate);
    const platformFee = Math.max(0, payAmountNumber * platformFeeRate);
    const totalCharge = payAmountNumber + squadFee + platformFee;
    const paid = Number(feeBreakdown?.amountPaid || 0);
    const total = Number(feeBreakdown?.principal || 0);
    const outstanding = Number(feeBreakdown?.outstanding || 0);
    const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

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
                    {fetchingFees ? <ButtonBarLoader /> : "Check Fees"}
                </Button>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 px-6 py-4">
                    <p className="font-semibold">Unable to access fees</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            )}

            {fetchingFees ? (
                <div className="py-20 text-center">
                    <div className="flex justify-center">
                        <BookLoader label="Checking fees..." />
                    </div>
                </div>
            ) : feesDoc ? (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-black/5">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">Fee Breakdown</h3>
                            <p className="text-sm text-slate-500">{selectedSession} - {selectedTerm}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-[var(--school-primary)]">₦{outstanding.toLocaleString()}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outstanding Balance</p>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Total Fee</span>
                                <span className="font-mono font-bold">₦{total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Already Paid</span>
                                <span className="font-mono font-bold text-emerald-600">₦{paid.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="text-xs text-slate-500">Payment progress: {progress.toFixed(1)}%</div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Amount to pay now (part or full)</label>
                            <input
                                className="w-full mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[var(--school-primary)]"
                                type="number"
                                min="1"
                                max={outstanding || 0}
                                value={payAmount}
                                onChange={(event) => setPayAmount(event.target.value)}
                            />
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>SquadCo Fee (1.2%)</span>
                                <span className="font-mono">₦{squadFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Platform Fee (0.7%)</span>
                                <span className="font-mono">₦{platformFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2">
                                <span>Total Charge</span>
                                <span className="text-[var(--school-primary)] font-mono">₦{totalCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-[var(--school-primary)] text-white py-8 rounded-2xl text-lg font-bold shadow-lg mt-8"
                            onClick={handlePayFees}
                            disabled={paying || outstanding <= 0}
                        >
                            {paying ? <ButtonBarLoader /> : <><CreditCard className="mr-2" /> Pay with SquadCo</>}
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
