import React from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const results = [
    { subject: 'Mathematics', cat: 18, mock: 16, exam: 52, total: 86, grade: 'A', remark: 'Excellent' },
    { subject: 'English Language', cat: 15, mock: 14, exam: 45, total: 74, grade: 'A', remark: 'Excellent' },
    { subject: 'Physics', cat: 12, mock: 10, exam: 38, total: 60, grade: 'B', remark: 'Very Good' },
    { subject: 'Biology', cat: 14, mock: 12, exam: 30, total: 56, grade: 'C', remark: 'Good' },
    { subject: 'Chemistry', cat: 10, mock: 8, exam: 30, total: 48, grade: 'D', remark: 'Fair' },
    { subject: 'Geography', cat: 16, mock: 15, exam: 42, total: 73, grade: 'A', remark: 'Excellent' },
    { subject: 'Economics', cat: 13, mock: 11, exam: 40, total: 64, grade: 'B', remark: 'Very Good' },
    { subject: 'Civic Education', cat: 17, mock: 16, exam: 50, total: 83, grade: 'A', remark: 'Excellent' },
    { subject: 'Computer Science', cat: 19, mock: 18, exam: 55, total: 92, grade: 'A', remark: 'Excellent' },
];

const gradeColors = { A: '#10B981', B: '#3B82F6', C: '#F59E0B', D: '#F97316', E: '#EF4444', F: '#DC2626' };

export default function Results() {
    const avg = (results.reduce((s, r) => s + r.total, 0) / results.length).toFixed(1);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Results</h1>
                <p className="page-subtitle">First Term 2025/2026 · SS1A</p>
            </div>

            <div className="grid grid-3" style={{ marginBottom: 24 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{avg}%</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Term Average</div>
                </LiquidGlassPanel>
                <LiquidGlassPanel hover={false} style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#10B981' }}>5th</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Class Position</div>
                </LiquidGlassPanel>
                <LiquidGlassPanel hover={false} style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#3B82F6' }}>{results.length}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Subjects</div>
                </LiquidGlassPanel>
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Subject</th><th>CAT</th><th>Mock</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500, color: '#fff' }}>{r.subject}</td>
                                    <td>{r.cat}</td><td>{r.mock}</td><td>{r.exam}</td>
                                    <td style={{ fontWeight: 700, color: '#fff' }}>{r.total}</td>
                                    <td><span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${gradeColors[r.grade]}22`, color: gradeColors[r.grade] }}>{r.grade}</span></td>
                                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{r.remark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
