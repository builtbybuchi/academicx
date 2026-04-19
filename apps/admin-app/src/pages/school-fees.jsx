import React, { useEffect, useState, useMemo } from 'react';
import DataTable from 'shared/components/DataTable.jsx';
import Modal from 'shared/components/Modal.jsx';
import StatsCard from 'shared/components/StatsCard.jsx';
import { formatCurrency, formatDate } from 'shared/utils/index.js';
import { getCurrentSchool, getSchoolStudents, getSchoolFees, getAcademicSessions, recordManualSchoolFeePayment } from 'shared/utils/api.js';

const SchoolFeesManagement = () => {
    const [school, setSchool] = useState(null);
    const [students, setStudents] = useState([]);
    const [fees, setFees] = useState([]);
    const [academicSessions, setAcademicSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
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

    const classFeeAmounts = useMemo(() => {
        try {
            const parsed = typeof school?.data === 'string' ? JSON.parse(school.data) : (school?.data || {});
            return parsed.classFeeAmounts || {};
        } catch { return {}; }
    }, [school]);

    const getClassFee = (className) => Number(classFeeAmounts[className]) || 0;

    const stats = useMemo(() => {
        const totalStudents = students.length || 0;
        const paidStudents = filteredFees.filter(fee => fee.status === 'paid').length;
        const unpaidStudents = totalStudents - paidStudents;
        const totalCollected = filteredFees
            .filter(fee => fee.status === 'paid')
            .reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
        const totalExpected = students.reduce((sum, s) => sum + getClassFee(s.className), 0);

        return {
            totalStudents,
            paidStudents,
            unpaidStudents,
            totalCollected,
            totalExpected,
            paymentRate: totalStudents > 0 ? (paidStudents / totalStudents) * 100 : 0
        };
    }, [students, filteredFees, classFeeAmounts]);

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
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            const htmlContent = generatePDFHTML();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export report');
        }
    };

    const generatePDFHTML = () => {
        const feeMap = filteredFees.reduce((acc, fee) => {
            acc[fee.studentId] = fee;
            return acc;
        }, {});

        const classNames = Array.from(new Set([
            ...Object.keys(classFeeAmounts || {}),
            ...students.map((s) => s.className).filter(Boolean),
        ])).sort((a, b) => String(a).localeCompare(String(b)));

        const byClass = classNames.reduce((acc, className) => {
            const classStudents = students
                .filter((s) => s.className === className)
                .map((student) => {
                    const fee = feeMap[student.$id] || null;
                    const expected = getClassFee(className);
                    return {
                        admissionNumber: student.admissionNumber,
                        fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
                        parentEmail: student.parentEmail || 'N/A',
                        feeStatus: fee?.status || 'unpaid',
                        expected,
                        amountPaid: Number(fee?.amountPaid || 0),
                        outstanding: Math.max(0, Number((expected - Number(fee?.amountPaid || 0)).toFixed(2))),
                        paidAt: fee?.paidAt || '',
                    };
                })
                .sort((a, b) => String(a.admissionNumber || '').localeCompare(String(b.admissionNumber || '')));
            acc[className] = classStudents;
            return acc;
        }, {});

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
                    <p>Total Expected: ${formatCurrency(stats.totalExpected)}</p>
                </div>

                <h2>Class-by-Class Fee Status</h2>
                ${classNames.map(className => `
                    <div class="class-section">
                        <div class="class-title">${className}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Admission No</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Expected Fee</th>
                                    <th>Amount Paid</th>
                                    <th>Outstanding</th>
                                    <th>Parent Email</th>
                                    <th>Payment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${byClass[className].length === 0 ? `
                                    <tr>
                                        <td colspan="8" style="text-align:center; color:#64748b;">No students in this class.</td>
                                    </tr>
                                ` : byClass[className].map(student => `
                                    <tr class="${student.feeStatus === 'paid' ? 'paid' : 'unpaid'}">
                                        <td>${student.admissionNumber}</td>
                                        <td>${student.fullName}</td>
                                        <td>${student.feeStatus}</td>
                                        <td>${formatCurrency(student.expected)}</td>
                                        <td>${formatCurrency(student.amountPaid)}</td>
                                        <td>${formatCurrency(student.outstanding)}</td>
                                        <td>${student.parentEmail}</td>
                                        <td>${formatDate(student.paidAt)}</td>
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
        { 
            key: 'feeAmount', 
            label: 'Fee Amount',
            render: (value, row) => formatCurrency(getClassFee(row.className))
        },
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
                        {status === 'paid' ? `Paid (${formatCurrency(feeRecord.amount)})` : `Unpaid (${formatCurrency(getClassFee(row.className))})`}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value, row) => {
                return (
                    <div className="fees-action-buttons">
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                setSelectedStudent(row);
                                setManualPaymentAmount(getClassFee(row.className));
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
        <div className="school-fees-page">
            <style>{`
                .school-fees-page .fees-filters-grid { gap: 16px; }
                .school-fees-page .fees-action-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
                .school-fees-page .fees-export-wrap { display: flex; align-items: flex-end; }
                .school-fees-page .modal { width: min(92vw, 560px); max-height: 92vh; overflow: auto; }
                @media (max-width: 768px) {
                    .school-fees-page .grid.grid-4,
                    .school-fees-page .grid.grid-3,
                    .school-fees-page .grid.grid-2 { grid-template-columns: 1fr; }
                    .school-fees-page .fees-export-wrap .btn { width: 100%; }
                    .school-fees-page .fees-action-buttons .btn { width: 100%; }
                    .school-fees-page .card-body { padding: 12px; }
                }
            `}</style>
            <div className="page-header">
                <h1 className="page-title">School Fees Management</h1>
                <p className="page-subtitle">Track and manage student school fees payments</p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-body">
                    <div className="grid grid-3 fees-filters-grid">
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
                        <div className="fees-export-wrap">
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
                <StatsCard 
                    icon="·" 
                    label="Payment Rate" 
                    value={`${(stats.paymentRate || 0).toFixed(1)}%`} 
                    color="#06B6D4" 
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

            {/* Manual Payment Modal */}
            <Modal
                open={showManualPaymentModal && Boolean(selectedStudent)}
                onClose={() => setShowManualPaymentModal(false)}
                title="Record Manual Payment"
                footer={(
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowManualPaymentModal(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleManualPayment} disabled={processingPayment || manualPaymentAmount <= 0}>
                            {processingPayment ? 'Recording...' : 'Record Payment'}
                        </button>
                    </>
                )}
            >
                <div className="form-group">
                    <label>Student</label>
                    <input type="text" className="form-control" value={`${selectedStudent?.firstName || ''} ${selectedStudent?.lastName || ''}`.trim()} disabled />
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
            </Modal>
        </div>
    );
};

export default SchoolFeesManagement;
