import React, { useEffect, useState, useMemo } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getStudentFees, initiateSchoolFeePayment, getStudentPortalData } from 'shared/utils/api.js';
import { formatCurrency, formatDate } from 'shared/utils/index.js';

export default function SchoolFees() {
    const [fees, setFees] = useState([]);
    const [student, setStudent] = useState(null);
    const [school, setSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [feesData, portalData] = await Promise.all([
                getStudentFees(),
                getStudentPortalData()
            ]);
            setFees(Array.isArray(feesData) ? feesData : []);
            if (portalData?.success) {
                setStudent(portalData.data?.student);
                setSchool(portalData.data?.school);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setFees([]);
        } finally {
            setLoading(false);
        }
    };

    const classFeeAmounts = useMemo(() => {
        try {
            const parsed = typeof school?.data === 'string' ? JSON.parse(school.data) : (school?.data || {});
            return parsed.classFeeAmounts || {};
        } catch { return {}; }
    }, [school]);

    const getClassFee = (className) => Number(classFeeAmounts[className]) || 0;

    const handlePayment = async (fee) => {
        if (fee.status === 'paid') return;
        
        setProcessingPayment(true);
        try {
            const result = await initiateSchoolFeePayment({
                feeId: fee.$id,
                studentId: fee.studentId,
                amount: fee.amount,
                term: fee.term,
                session: fee.session
            });

            if (result.success) {
                // Redirect to payment gateway
                window.open(result.data.checkoutUrl, '_blank');
                // Reload fees after a delay to allow payment processing
                setTimeout(loadFees, 5000);
            } else {
                alert('Payment initiation failed: ' + result.error);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment processing failed');
        } finally {
            setProcessingPayment(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <CheckCircle size={20} style={{ color: '#10B981' }} />;
            case 'pending':
                return <Clock size={20} style={{ color: '#F59E0B' }} />;
            default:
                return <AlertCircle size={20} style={{ color: '#EF4444' }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return '#10B981';
            case 'pending':
                return '#F59E0B';
            default:
                return '#EF4444';
        }
    };

    if (loading) {
        return <div className="loading">Loading school fees...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">School Fees</h1>
                <p className="page-subtitle">View and pay your school fees online</p>
            </div>

            {/* Fee Structure Notice */}
            <div className="alert alert-info" style={{ marginBottom: 24 }}>
                <h4>Payment Information</h4>
                <p><strong>Platform Fee:</strong> 1.9% of transaction amount (capped at &#x20A6;2,500 per transaction)</p>
                <p><strong>Payment Methods:</strong> Online payment via secure gateway</p>
                <p><strong>Bi-weekly Reminders:</strong> WhatsApp reminders will be sent for unpaid fees</p>
            </div>

            {fees.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center" style={{ padding: 40 }}>
                        <CreditCard size={48} style={{ color: 'var(--color-gray-400)', marginBottom: 16 }} />
                        <h3 style={{ color: 'var(--color-gray-600)', marginBottom: 8 }}>No School Fees Found</h3>
                        <p style={{ color: 'var(--color-gray-500)' }}>
                            School fees for the current term will appear here once assigned by the school administration.
                        </p>
                        {student?.className && getClassFee(student.className) > 0 && (
                            <div style={{ marginTop: 24, padding: 16, background: '#F3F4F6', borderRadius: 8 }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#374151' }}>
                                    Expected Fee for {student.className}:
                                </p>
                                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#3B82F6' }}>
                                    {formatCurrency(getClassFee(student.className))}
                                </p>
                                <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#6B7280' }}>
                                    This is the fee amount set for your class. Please contact your school if you have questions.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-1" style={{ gap: 16 }}>
                    {fees.map((fee) => (
                        <div key={fee.$id} className="card">
                            <div className="card-body">
                                <div className="grid grid-3" style={{ marginBottom: 16 }}>
                                    <div>
                                        <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 4 }}>
                                            {fee.term} - {fee.session}
                                        </h4>
                                        <p style={{ fontSize: 14, color: 'var(--color-gray-600)', margin: 0 }}>
                                            Due Date: {fee.dueDate ? formatDate(fee.dueDate) : 'Not specified'}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                                            {formatCurrency(fee.amount)}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                                            School Fee
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            {getStatusIcon(fee.status)}
                                            <span style={{ 
                                                fontSize: 14, 
                                                fontWeight: 600, 
                                                color: getStatusColor(fee.status),
                                                textTransform: 'capitalize'
                                            }}>
                                                {fee.status}
                                            </span>
                                        </div>
                                        {fee.status === 'paid' && fee.paidAt && (
                                            <p style={{ fontSize: 12, color: 'var(--color-gray-500)', margin: 0 }}>
                                                Paid on {formatDate(fee.paidAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {fee.status === 'pending' && (
                                    <div style={{ 
                                        background: '#fef3c7', 
                                        padding: 12, 
                                        borderRadius: 8, 
                                        marginBottom: 16,
                                        border: '1px solid #f59e0b'
                                    }}>
                                        <div style={{ fontSize: 14, color: '#92400e', marginBottom: 4 }}>
                                            <strong>Platform Fee:</strong> {formatCurrency(fee.platformFee || 0)}
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: '#78350f' }}>
                                            <strong>Total Amount:</strong> {formatCurrency(fee.totalAmount || fee.amount)}
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                                        {fee.paymentMethod === 'online' ? 'Online Payment' : 'Manual Payment'}
                                        {fee.paymentReference && (
                                            <span> · Ref: {fee.paymentReference.slice(0, 8)}...</span>
                                        )}
                                    </div>
                                    
                                    {fee.status === 'pending' && (
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => handlePayment(fee)}
                                            disabled={processingPayment}
                                        >
                                            {processingPayment ? (
                                                <>
                                                    <div className="spinner spinner-sm" style={{ marginRight: 8 }} />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={16} style={{ marginRight: 8 }} />
                                                    Pay Now
                                                </>
                                            )}
                                        </button>
                                    )}
                                    
                                    {fee.status === 'paid' && (
                                        <span className="badge badge-success">
                                            <CheckCircle size={14} style={{ marginRight: 4 }} />
                                            Payment Complete
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Instructions */}
            <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header">
                    <h3>Payment Instructions</h3>
                </div>
                <div className="card-body">
                    <ol style={{ paddingLeft: 20, color: 'var(--color-gray-700)' }}>
                        <li style={{ marginBottom: 12 }}>Click "Pay Now" to initiate the payment process</li>
                        <li style={{ marginBottom: 12 }}>You will be redirected to a secure payment gateway</li>
                        <li style={{ marginBottom: 12 }}>Complete the payment using your preferred method</li>
                        <li style={{ marginBottom: 12 }}>You will receive a WhatsApp confirmation upon successful payment</li>
                        <li style={{ marginBottom: 12 }}>Payment status will be updated automatically</li>
                    </ol>
                    
                    <div style={{ 
                        background: '#f0fdf4', 
                        padding: 16, 
                        borderRadius: 8, 
                        marginTop: 16,
                        border: '1px solid #86efac'
                    }}>
                        <h4 style={{ fontSize: 14, color: '#166534', marginBottom: 8 }}>Need Help?</h4>
                        <p style={{ fontSize: 13, color: '#166534', margin: 0 }}>
                            Contact the school administration for any payment-related queries or assistance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
