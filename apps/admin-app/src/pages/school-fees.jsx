import React, { useEffect, useState, useMemo } from 'react';
import DataTable from 'shared/components/DataTable.jsx';
import StatsCard from 'shared/components/StatsCard.jsx';
import { formatCurrency, formatDate } from 'shared/utils/index.js';
import { getCurrentSchool, getSchoolStudents, getSchoolFees, createSchoolFeePayment, getSchoolFeesReport, getAcademicSessions, recordManualSchoolFeePayment } from 'shared/utils/api.js';

const SchoolFeesManagement = () => {
    const [school, setSchool] = useState(null);
    const [students, setStudents] = useState([]);
    const [fees, setFees] = useState([]);
    const [academicSessions, setAcademicSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feeAmount, setFeeAmount] = useState(0);
    const [manualPaymentAmount, setManualPaymentAmount] = useState(0);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('manual');
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const schoolData = await getCurrentSchool();
            setSchool(schoolData);
            
            const studentsData = await getSchoolStudents();
            setStudents(Array.isArray(studentsData) ? studentsData : []);
            
            const feesData = await getSchoolFees();
            setFees(Array.isArray(feesData) ? feesData : []);
            
            const sessionsData = await getAcademicSessions();
            setAcademicSessions(Array.isArray(sessionsData) ? sessionsData : []);
            
            if (schoolData.currentTerm && schoolData.currentSession) {
                setSelectedTerm(schoolData.currentTerm);
                setSelectedSession(schoolData.currentSession);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setStudents([]);
            setFees([]);
            setAcademicSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredFees = useMemo(() => {
        return fees.filter(fee => {
            if (selectedTerm && fee.term !== selectedTerm) return false;
            if (selectedSession && fee.session !== selectedSession) return false;
            return true;
        });
    }, [fees, selectedTerm, selectedSession]);

    const stats = useMemo(() => {
        const totalStudents = students.length || 0;
        const paidStudents = filteredFees.filter(fee => fee.status === 'paid').length;
        const unpaidStudents = totalStudents - paidStudents;
        const totalCollected = filteredFees
            .filter(fee => fee.status === 'paid')
            .reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
        const totalExpected = totalStudents * (Number(school?.schoolFeeAmount) || 0);
        const platformFees = totalCollected * 0.019; // 1.9% platform fee
        const cappedPlatformFees = Math.min(platformFees, 2500);

        return {
            totalStudents,
            paidStudents,
            unpaidStudents,
            totalCollected,
            totalExpected,
            platformFees: cappedPlatformFees,
            netRevenue: totalCollected - cappedPlatformFees,
            paymentRate: totalStudents > 0 ? (paidStudents / totalStudents) * 100 : 0
        };
    }, [students, filteredFees, school]);

    const handlePaymentInitiation = async (student) => {
        setSelectedStudent(student);
        setFeeAmount(school?.schoolFeeAmount || 0);
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        if (!selectedStudent || !feeAmount) return;
        
        setProcessingPayment(true);
        try {
            const paymentData = {
                studentId: selectedStudent.$id,
                amount: feeAmount,
                term: selectedTerm,
                session: selectedSession,
                platformFee: Math.min(feeAmount * 0.019, 2500)
            };
            
            const result = await createSchoolFeePayment(paymentData);
            
            if (result.success) {
                // Redirect to payment gateway or show payment modal
                window.open(result.data.checkoutUrl, '_blank');
                setShowPaymentModal(false);
                loadData(); // Refresh data
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

    const handleManualPayment = async () => {
        if (!selectedStudent || !manualPaymentAmount || !selectedTerm || !selectedSession) return;
        
        setProcessingPayment(true);
        try {
            const paymentData = {
                studentId: selectedStudent.$id,
                amount: manualPaymentAmount,
                term: selectedTerm,
                session: selectedSession,
                paymentMethod,
                notes: paymentNotes
            };
            
            const result = await recordManualSchoolFeePayment(paymentData);
            
            if (result.success) {
                alert('Payment recorded successfully');
                setShowManualPaymentModal(false);
                setManualPaymentAmount(0);
                setPaymentNotes('');
                setPaymentMethod('manual');
                loadData(); // Refresh data
            } else {
                alert('Payment recording failed: ' + result.error);
            }
        } catch (error) {
            console.error('Manual payment error:', error);
            alert('Payment recording failed');
        } finally {
            setProcessingPayment(false);
        }
    };

    const exportToPDF = async () => {
        try {
            const reportData = await getSchoolFeesReport({
                term: selectedTerm,
                session: selectedSession
            });
            
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            const htmlContent = generatePDFHTML(reportData);
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export report');
        }
    };

    const generatePDFHTML = (data) => {
        const paidByClass = {};
        const unpaidByClass = {};
        
        data.paidStudents.forEach(student => {
            if (!paidByClass[student.className]) {
                paidByClass[student.className] = [];
            }
            paidByClass[student.className].push(student);
        });
        
        data.unpaidStudents.forEach(student => {
            if (!unpaidByClass[student.className]) {
                unpaidByClass[student.className] = [];
            }
            unpaidByClass[student.className].push(student);
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>School Fees Report - ${school?.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .class-section { margin-bottom: 30px; page-break-inside: avoid; }
                    .class-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .paid { background-color: #d4edda; }
                    .unpaid { background-color: #f8d7da; }
                    .summary { margin-top: 30px; padding: 20px; border: 2px solid #333; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${school?.name || 'School'}</h1>
                    <h2>School Fees Report</h2>
                    <p>Term: ${selectedTerm} | Session: ${selectedSession}</p>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="summary">
                    <h3>Summary</h3>
                    <p>Total Students: ${stats.totalStudents}</p>
                    <p>Paid Students: ${stats.paidStudents}</p>
                    <p>Unpaid Students: ${stats.unpaidStudents}</p>
                    <p>Payment Rate: ${stats.paymentRate.toFixed(1)}%</p>
                    <p>Total Collected: ${formatCurrency(stats.totalCollected)}</p>
                    <p>Platform Fees (1.9% capped at ₦2,500): ${formatCurrency(stats.platformFees)}</p>
                    <p>Net Revenue: ${formatCurrency(stats.netRevenue)}</p>
                </div>
                
                <h2>Students Who Have Paid</h2>
                ${Object.keys(paidByClass).map(className => `
                    <div class="class-section">
                        <div class="class-title">${className}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Admission No</th>
                                    <th>Name</th>
                                    <th>Amount Paid</th>
                                    <th>Payment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paidByClass[className].map(student => `
                                    <tr class="paid">
                                        <td>${student.admissionNumber}</td>
                                        <td>${student.firstName} ${student.lastName}</td>
                                        <td>${formatCurrency(student.amount)}</td>
                                        <td>${formatDate(student.paidAt)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
                
                <h2>Students Who Haven't Paid</h2>
                ${Object.keys(unpaidByClass).map(className => `
                    <div class="class-section">
                        <div class="class-title">${className}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Admission No</th>
                                    <th>Name</th>
                                    <th>Parent Email</th>
                                    <th>Parent Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${unpaidByClass[className].map(student => `
                                    <tr class="unpaid">
                                        <td>${student.admissionNumber}</td>
                                        <td>${student.firstName} ${student.lastName}</td>
                                        <td>${student.parentEmail || 'N/A'}</td>
                                        <td>${student.parentPhone || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
    };

    const studentColumns = [
        { key: 'admissionNumber', label: 'Admission No' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'className', label: 'Class' },
        { key: 'parentEmail', label: 'Parent Email' },
        { key: 'parentPhone', label: 'Parent Phone' },
        { 
            key: 'feeStatus', 
            label: 'Fee Status',
            render: (value, row) => {
                const feeRecord = filteredFees.find(fee => fee.studentId === row.$id);
                const status = feeRecord?.status || 'unpaid';
                return (
                    <span className={`badge badge-${status === 'paid' ? 'success' : 'warning'}`}>
                        {status === 'paid' ? `Paid (${formatCurrency(feeRecord.amount)})` : 'Unpaid'}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value, row) => {
                const feeRecord = filteredFees.find(fee => fee.studentId === row.$id);
                return (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePaymentInitiation(row)}
                            disabled={feeRecord?.status === 'paid'}
                        >
                            Initiate Payment
                        </button>
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                setSelectedStudent(row);
                                setManualPaymentAmount(school?.schoolFeeAmount || 0);
                                setShowManualPaymentModal(true);
                            }}
                        >
                            Record Payment
                        </button>
                    </div>
                );
            }
        }
    ];

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">School Fees Management</h1>
                <p className="page-subtitle">Track and manage student school fees payments</p>
            </div>

            {/* Fee Structure Notice */}
            <div className="alert alert-info" style={{ marginBottom: 24 }}>
                <h4>Fee Structure Information</h4>
                <p><strong>Platform Fee:</strong> 1.9% of transaction amount (capped at ₦2,500 per transaction)</p>
                <p><strong>Breakdown:</strong> 1.2% goes to SquadCo (GTBank) platform, 0.7% goes to AcademicX</p>
                <p><strong>Note:</strong> This is an optional feature. Schools can continue to manage fees manually if preferred.</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-body">
                    <div className="grid grid-3" style={{ gap: 16 }}>
                        <div>
                            <label className="form-label">Session</label>
                            <select 
                                className="form-control"
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                            >
                                <option value="">Select Session</option>
                                {[...new Set(academicSessions.map(s => s.session))].map(session => (
                                    <option key={session} value={session}>{session}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Term</label>
                            <select 
                                className="form-control"
                                value={selectedTerm}
                                onChange={(e) => setSelectedTerm(e.target.value)}
                            >
                                <option value="">Select Term</option>
                                {[...new Set(academicSessions.map(s => s.term))].map(term => (
                                    <option key={term} value={term}>{term}</option>
                                ))}
                            </select>
                        </div>
                        <div className="d-flex align-items-end">
                            <button 
                                className="btn btn-primary"
                                onClick={exportToPDF}
                                disabled={!selectedTerm || !selectedSession}
                            >
                                Export PDF Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard 
                    icon="·" 
                    label="Total Students" 
                    value={stats.totalStudents || 0} 
                    color="#3B82F6" 
                />
                <StatsCard 
                    icon="·" 
                    label="Paid Students" 
                    value={stats.paidStudents || 0} 
                    color="#10B981" 
                />
                <StatsCard 
                    icon="·" 
                    label="Unpaid Students" 
                    value={stats.unpaidStudents || 0} 
                    color="#F59E0B" 
                />
                <StatsCard 
                    icon="·" 
                    label="Total Collected" 
                    value={formatCurrency(stats.totalCollected || 0)} 
                    color="#8B5CF6" 
                />
            </div>

            <div className="grid grid-2" style={{ marginBottom: 32 }}>
                <StatsCard 
                    icon="·" 
                    label="Payment Rate" 
                    value={`${(stats.paymentRate || 0).toFixed(1)}%`} 
                    color="#06B6D4" 
                />
                <StatsCard 
                    icon="·" 
                    label="Platform Fees" 
                    value={formatCurrency(stats.platformFees || 0)} 
                    color="#EF4444" 
                />
            </div>

            {/* WhatsApp Reminder Notice */}
            <div className="alert alert-success" style={{ marginBottom: 24 }}>
                <h4>Automated Reminders</h4>
                <p>Bi-weekly WhatsApp reminders are automatically sent to parents about unpaid fees.</p>
                <p>Next reminder date: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>

            {/* Students Table */}
            <div className="card">
                <div className="card-header">
                    <h3>Students Fee Status</h3>
                </div>
                <div className="card-body">
                    <DataTable 
                        columns={studentColumns} 
                        data={students} 
                        searchable={true}
                        pagination={true}
                    />
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedStudent && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Process School Fee Payment</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Student</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={`${selectedStudent.firstName} ${selectedStudent.lastName} (${selectedStudent.admissionNumber})`}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Class</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={selectedStudent.className}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Fee Amount (₦)</label>
                                <input 
                                    type="number" 
                                    className="form-control"
                                    value={feeAmount}
                                    onChange={(e) => setFeeAmount(Number(e.target.value))}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Platform Fee (1.9% capped at ₦2,500)</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={formatCurrency(Math.min(feeAmount * 0.019, 2500))}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Total Amount Payable</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={formatCurrency(feeAmount + Math.min(feeAmount * 0.019, 2500))}
                                    disabled
                                    style={{ fontWeight: 'bold', fontSize: '18px' }}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setShowPaymentModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={processPayment}
                                disabled={processingPayment || feeAmount <= 0}
                            >
                                {processingPayment ? 'Processing...' : 'Initiate Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Payment Modal */}
            {showManualPaymentModal && selectedStudent && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Record Manual Payment</h3>
                            <button className="modal-close" onClick={() => setShowManualPaymentModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Student</label>
                                <input type="text" className="form-control" value={`${selectedStudent.firstName} ${selectedStudent.lastName}`} disabled />
                            </div>
                            <div className="form-group">
                                <label>Amount Paid (₦)</label>
                                <input type="number" className="form-control" value={manualPaymentAmount} onChange={(e) => setManualPaymentAmount(Number(e.target.value))} min="0" />
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <option value="manual">Manual (Cash)</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea className="form-control" value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows="3" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowManualPaymentModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleManualPayment} disabled={processingPayment || manualPaymentAmount <= 0}>
                                {processingPayment ? 'Recording...' : 'Record Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolFeesManagement;
