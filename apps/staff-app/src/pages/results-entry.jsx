import React, { useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { computeTotal, computeGrade, DEFAULT_GRADING } from '../../../../shared/utils/index.js';

const students = [
    { id: 's1', name: 'Adebayo Oluwaseun', admNo: 'ADM/2025/001' },
    { id: 's2', name: 'Chidinma Okafor', admNo: 'ADM/2025/002' },
    { id: 's3', name: 'Musa Ibrahim', admNo: 'ADM/2025/003' },
    { id: 's4', name: 'Fatima Abubakar', admNo: 'ADM/2024/045' },
    { id: 's5', name: 'Oluwole Adeyemi', admNo: 'ADM/2024/046' },
];

export default function ResultsEntry() {
    const [scores, setScores] = useState(
        students.reduce((acc, s) => ({ ...acc, [s.id]: { cat: '', mock: '', exam: '' } }), {})
    );

    const update = (sid, field, val) => {
        setScores(prev => ({ ...prev, [sid]: { ...prev[sid], [field]: val } }));
    };

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Enter Results</h1><p className="page-subtitle">Enter CAT, Mock, and Exam scores</p></div>
                <div className="flex gap-2">
                    <FormField label="" type="select" options={[{ value: 'jss1a', label: 'JSS1A' }, { value: 'ss1a', label: 'SS1A' }, { value: 'ss2b', label: 'SS2B' }]} placeholder="Select Class" />
                </div>
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Adm. No.</th><th>Student Name</th>
                                <th style={{ width: 80 }}>CAT (20)</th><th style={{ width: 80 }}>Mock (20)</th>
                                <th style={{ width: 80 }}>Exam (60)</th><th style={{ width: 70 }}>Total</th>
                                <th style={{ width: 60 }}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => {
                                const sc = scores[s.id];
                                const total = computeTotal(sc.cat, sc.mock, sc.exam);
                                const { grade } = computeGrade(total, DEFAULT_GRADING);
                                return (
                                    <tr key={s.id}>
                                        <td><code style={{ color: '#93C5FD' }}>{s.admNo}</code></td>
                                        <td>{s.name}</td>
                                        <td><input className="input" type="number" min="0" max="20" value={sc.cat} onChange={e => update(s.id, 'cat', e.target.value)} style={{ padding: '6px 8px' }} /></td>
                                        <td><input className="input" type="number" min="0" max="20" value={sc.mock} onChange={e => update(s.id, 'mock', e.target.value)} style={{ padding: '6px 8px' }} /></td>
                                        <td><input className="input" type="number" min="0" max="60" value={sc.exam} onChange={e => update(s.id, 'exam', e.target.value)} style={{ padding: '6px 8px' }} /></td>
                                        <td style={{ fontWeight: 700, color: '#fff' }}>{total || '-'}</td>
                                        <td><span className="badge badge-primary">{total ? grade : '-'}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-glass">Save Draft</button>
                    <button className="btn btn-primary">Submit Results</button>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
