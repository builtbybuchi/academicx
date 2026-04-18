import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { StudentAppPrompt } from '@/components/school/StudentAppPrompt';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { Button } from '@/components/ui/button';
import { getStudentFeeStatus, initiateSchoolFeePayment } from '@/lib/api';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useBasePath } from '@/hooks/useBasePath';
import { BookLoader, ButtonBarLoader } from '@/components/ui/BookLoader';

export function FeesPage({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const { school, sessions } = useSchoolSite();
    const navigate = useNavigate();
    const basePath = useBasePath();
    const schoolId = school?.$id;
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
    const [feesDoc, setFeesDoc] = useState<any>(null);
    const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
    const [fetchingFees, setFetchingFees] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [popup, setPopup] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

    const studentId = sessionStorage.getItem('student_id');
    const sessionOptions = ((sessions || []) as any[])
        .map((item) => ({ $id: String(item.$id || item.id || item.name || 'session'), name: String(item.name || '').trim() }))
        .filter((item) => item.name.length > 0);

    useEffect(() => {
        if (!studentId && !isEmbedded) {
            navigate(`${basePath}/login`);
            return;
        }
        const fallbackSession = String((school as any)?.currentSession || '').trim();
        const fallbackTerm = String((school as any)?.currentTerm || '').trim();
        const optionSession = sessionOptions.length > 0 ? sessionOptions[0].name : fallbackSession;
        setSelectedSession(optionSession || '');
        if (fallbackTerm) setSelectedTerm(fallbackTerm);
        setLoading(false);
    }, [school, sessionOptions, studentId, navigate, basePath, isEmbedded]);

    const sessionOptionsFallback = sessionOptions.length > 0
        ? sessionOptions
        : (school ? [{ $id: 'current-session', name: String((school as any)?.currentSession || '').trim() || 'Current Session' }] : []);

    async function handleCheckFees() {
        if (!selectedSession || !selectedTerm) {
            setPopup({ type: 'error', message: 'Please select both session and term before checking fees.' });
            return;
        }
        if (fetchingFees) return;
        setFetchingFees(true);
        setPopup(null);
        setFeesDoc(null);
        setFeeBreakdown(null);
        try {
            if (!schoolId) {
                throw new Error('School details are not available right now.');
            }
            const response = await getStudentFeeStatus({
                schoolId,
                studentId,
                term: selectedTerm,
                session: selectedSession,
            });
            setFeesDoc(response.fee);
            setFeeBreakdown(response.breakdown);
            setPayAmount(String(response.breakdown?.outstanding || ''));
            setPopup({ type: 'success', message: `Fee record loaded for ${selectedTerm}, ${selectedSession}.` });
        } catch (err) {
            console.error('Failed to check fees:', err);
            setPopup({ type: 'error', message: (err as Error).message || 'We cannot access this fee record for the selected term and session.' });
        } finally {
            setFetchingFees(false);
        }
    }

    async function handlePayFees() {
        if (!feesDoc || !feeBreakdown || paying) return;

        const numeric = Number(payAmount || 0);
        const outstanding = Number(feeBreakdown.outstanding || 0);
        if (!Number.isFinite(numeric) || numeric <= 0) {
            setPopup({ type: 'error', message: 'Enter a valid payment amount.' });
            return;
        }
        if (numeric > outstanding) {
            setPopup({ type: 'error', message: 'Payment amount cannot be higher than outstanding balance.' });
            return;
        }

        setPaying(true);
        setPopup(null);
        try {
            if (!schoolId) {
                throw new Error('School details are not available right now.');
            }
            const payment = await initiateSchoolFeePayment({
                schoolId,
                feeId: feesDoc.$id,
                studentId: feesDoc.studentId,
                amount: numeric,
                term: selectedTerm,
                session: selectedSession,
                callbackUrl: `${window.location.origin}${basePath}/dashboard/fees`,
            });

            if (payment.checkoutUrl) {
                setPopup({ type: 'success', message: 'Payment initiated. Opening SquadCo checkout in a new tab.' });
                window.open(payment.checkoutUrl, '_blank', 'noopener,noreferrer');
            } else {
                setPopup({ type: 'warning', message: 'Payment was initiated but no checkout URL was returned.' });
            }
        } catch (err) {
            setPopup({ type: 'error', message: (err as Error).message || 'Unable to initiate payment.' });
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
                    onClick={handleCheckFees}
                    disabled={fetchingFees || loading}
                    className="w-full bg-[var(--school-primary)] text-white py-7 rounded-xl font-bold"
                >
                    {fetchingFees ? <ButtonBarLoader /> : "Check Fees"}
                </Button>
            </div>

            {popup && (
                <div className={`rounded-2xl border px-6 py-4 ${
                    popup.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : popup.type === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                    <p className="font-semibold">
                        {popup.type === 'success' ? 'Success' : popup.type === 'warning' ? 'Notice' : 'Unable to access fees'}
                    </p>
                    <p className="text-sm mt-1">{popup.message}</p>
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
