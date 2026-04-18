import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ReceiptText, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { SchoolSubPage } from '@/components/school/SchoolSubPage';
import { useBasePath } from '@/hooks/useBasePath';
import { useSchoolSite } from '@/context/SchoolSiteContext';
import { verifySchoolFeePayment } from '@/lib/api';

export function PaymentSuccessPage() {
    const { school } = useSchoolSite();
    const [searchParams] = useSearchParams();
    const basePath = useBasePath();

    const reference = useMemo(() => {
        return searchParams.get('transaction_ref') || searchParams.get('reference') || searchParams.get('trxref') || '';
    }, [searchParams]);

    const studentLoggedIn = !!sessionStorage.getItem('student_id');
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Payment received. Verifying your transaction...');

    useEffect(() => {
        let cancelled = false;

        async function verifyNow() {
            if (!reference) {
                setStatusMessage('Payment received. Transaction reference not found in callback URL.');
                return;
            }

            setVerifying(true);
            try {
                await verifySchoolFeePayment({ transactionRef: reference });
                if (!cancelled) {
                    setVerified(true);
                    setStatusMessage('Payment verified successfully. A receipt has been sent to the parent and school admin email.');
                }
            } catch (err) {
                if (!cancelled) {
                    setVerified(false);
                    setStatusMessage((err as Error).message || 'Payment verification is still pending. Please check back shortly.');
                }
            } finally {
                if (!cancelled) setVerifying(false);
            }
        }

        void verifyNow();

        return () => {
            cancelled = true;
        };
    }, [reference]);

    return (
        <SchoolSubPage
            title="Payment Received"
            subtitle="Your school fee payment has been completed successfully."
        >
            <div className="max-w-2xl mx-auto pt-12">
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl shadow-emerald-100/40 p-8 md:p-10 text-center">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={34} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900">Thank you for your payment</h1>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                        <div className="flex items-start gap-3">
                            {verifying ? (
                                <Loader2 size={18} className="mt-0.5 text-slate-500 animate-spin" />
                            ) : verified ? (
                                <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                            ) : (
                                <AlertTriangle size={18} className="mt-0.5 text-amber-600" />
                            )}
                            <p className="text-slate-700 leading-7">{statusMessage}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 text-left">
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">School</div>
                            <div className="mt-1 font-semibold text-slate-900">{school?.name || 'AcademicX School'}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Reference</div>
                            <div className="mt-1 font-semibold text-slate-900 break-all">{reference || 'Pending verification'}</div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to={`${basePath}/${studentLoggedIn ? 'dashboard/fees' : 'login'}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--school-primary)] px-5 py-3 font-bold text-white hover:opacity-95 transition-opacity"
                        >
                            <ReceiptText size={18} />
                            {studentLoggedIn ? 'View Fees Portal' : 'Log in to view portal'}
                        </Link>
                        <Link
                            to={basePath}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowRight size={18} />
                            Go to Home
                        </Link>
                    </div>
                </div>
            </div>
        </SchoolSubPage>
    );
}