import React from 'react';

interface ReportCardProps {
    data: {
        results: any[];
        student: any;
        term: string;
        session: string;
    };
    subjectsById: Record<string, string>;
    school: any;
}

export const ReportCard: React.FC<ReportCardProps> = ({ data, subjectsById, school }) => {
    const results = data?.results || [];
    const student = data?.student || {};
    const term = data?.term || '-';
    const session = data?.session || '';
    
    const totalScore = results.reduce((sum, r) => sum + (Number(r.totalScore) || 0), 0);
    const average = results.length ? (totalScore / results.length).toFixed(2) : '0.00';
    
    const gradeColors: Record<string, string> = {
        A: '#10B981',
        B: '#3B82F6',
        C: '#F59E0B',
        D: '#F97316',
        E: '#EF4444',
        F: '#DC2626'
    };

    return (
        <div className="report-card-container" style={{
            background: '#fff',
            color: '#1f2937',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '1000px',
            margin: '0 auto',
            fontFamily: "'Inter', sans-serif"
        }}>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .report-card-container, .report-card-container * { visibility: visible; }
                    .no-print { display: none !important; }
                    header, nav, footer, .school-sub-page-header, .student-app-prompt { display: none !important; }
                    .report-card-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
                .report-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .school-info h1 { margin: 0; font-size: 24px; color: #111827; }
                .school-info p { margin: 4px 0 0; color: #6b7280; font-size: 14px; }
                .student-info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                    background: #f9fafb;
                    padding: 20px;
                    border-radius: 8px;
                }
                .info-item { display: flex; flex-direction: column; }
                .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .info-value { font-size: 16px; font-weight: 600; color: #111827; }
                .results-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .results-table th { background: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 12px; border: 1px solid #e5e7eb; }
                .results-table td { padding: 12px; border: 1px solid #e5e7eb; color: #1f2937; }
                .grade-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 700;
                    font-size: 12px;
                }
                .summary-section {
                    display: flex;
                    justify-content: flex-end;
                    gap: 40px;
                    padding: 20px;
                    background: #f9fafb;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .summary-item { text-align: right; }
                .summary-label { font-size: 14px; color: #6b7280; margin-bottom: 4px; }
                .summary-value { font-size: 24px; font-weight: 800; color: #111827; }
                .comments-section { margin-top: 30px; }
                .comment-box {
                    border: 1px solid #e5e7eb;
                    padding: 15px;
                    border-radius: 8px;
                    min-height: 80px;
                    margin-top: 10px;
                    color: #4b5563;
                    font-style: italic;
                }
            `}</style>

            <div className="report-card-header">
                <div className="school-info">
                    <h1>{school?.name || 'AcademicX School'}</h1>
                    <p>{school?.address || 'School Address'}</p>
                    <p>{school?.phone || ''} | {school?.email || ''}</p>
                </div>
                {school?.logo && (
                    <img src={school.logo} alt="School Logo" style={{ height: '80px', maxWidth: '150px', objectFit: 'contain' }} />
                )}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151' }}>Student Progress Report</h2>
                <p style={{ margin: '5px 0 0', color: '#6b7280' }}>{term} Term, {session} Academic Session</p>
            </div>

            <div className="student-info-grid">
                <div className="info-item">
                    <span className="info-label">Student Name</span>
                    <span className="info-value">{student?.firstName} {student?.lastName}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Admission Number</span>
                    <span className="info-value">{student?.admissionNumber}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Class</span>
                    <span className="info-value">{student?.className} {student?.section || ''}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Date of Issue</span>
                    <span className="info-value">{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <table className="results-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th style={{ textAlign: 'center' }}>CAT</th>
                        <th style={{ textAlign: 'center' }}>Exam</th>
                        <th style={{ textAlign: 'center' }}>Total</th>
                        <th style={{ textAlign: 'center' }}>Grade</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, i) => (
                        <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{subjectsById[r.subjectId] || r.subjectName || r.subjectId}</td>
                            <td style={{ textAlign: 'center' }}>{r.catScore}</td>
                            <td style={{ textAlign: 'center' }}>{r.examScore}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{r.totalScore}</td>
                            <td style={{ textAlign: 'center' }}>
                                <span className="grade-badge" style={{
                                    backgroundColor: `${gradeColors[r.grade] || '#9CA3AF'}22`,
                                    color: gradeColors[r.grade] || '#9CA3AF',
                                    border: `1px solid ${gradeColors[r.grade] || '#9CA3AF'}`
                                }}>
                                    {r.grade || '-'}
                                </span>
                            </td>
                            <td>{r.remark || '-'}</td>
                        </tr>
                    ))}
                    {results.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                No result records available for this term.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="summary-section">
                <div className="summary-item">
                    <div className="summary-label">Total Score</div>
                    <div className="summary-value">{totalScore}</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Average Percentage</div>
                    <div className="summary-value">{average}%</div>
                </div>
                <div className="summary-item">
                    <div className="summary-label">Attendance</div>
                    <div className="summary-value">95%</div>
                </div>
            </div>

            <div className="comments-section">
                <div className="info-label">Class Teacher's Comment</div>
                <div className="comment-box">
                    {student?.teacherComment || 'Excellent performance this term. Keep up the good work.'}
                </div>
            </div>

            <div className="comments-section">
                <div className="info-label">Principal's Comment</div>
                <div className="comment-box">
                    {student?.principalComment || 'A very good result. The student shows great potential and dedication to studies.'}
                </div>
            </div>

            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid #374151', marginBottom: '8px' }}></div>
                    <span className="info-label">Class Teacher's Signature</span>
                </div>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid #374151', marginBottom: '8px' }}></div>
                    <span className="info-label">Principal's Signature</span>
                </div>
            </div>

            <div className="no-print" style={{ marginTop: '40px', textAlign: 'center' }}>
                <button 
                    onClick={() => window.print()}
                    style={{
                        padding: '10px 24px',
                        background: '#3B82F6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>Print Report Card</span>
                </button>
            </div>
        </div>
    );
};
