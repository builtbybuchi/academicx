import React, { useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';

const students = [
    { id: 's1', name: 'Adebayo Oluwaseun', admNo: 'ADM/2025/001' },
    { id: 's2', name: 'Chidinma Okafor', admNo: 'ADM/2025/002' },
    { id: 's3', name: 'Musa Ibrahim', admNo: 'ADM/2025/003' },
    { id: 's4', name: 'Fatima Abubakar', admNo: 'ADM/2024/045' },
    { id: 's5', name: 'Oluwole Adeyemi', admNo: 'ADM/2024/046' },
];

const statusOptions = ['present', 'absent', 'late', 'excused'];
const statusColors = { present: 'success', absent: 'danger', late: 'warning', excused: 'primary' };

export default function Attendance() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState(
        students.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {})
    );

    const summary = Object.values(attendance).reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {});

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">Mark daily attendance for your classes</p></div>
                <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 200 }} />
            </div>

            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {statusOptions.map(s => (
                    <LiquidGlassPanel key={s} hover={false} style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{summary[s] || 0}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{s}</div>
                    </LiquidGlassPanel>
                ))}
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Adm. No.</th><th>Student Name</th><th>Status</th></tr></thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s.id}>
                                    <td><code style={{ color: '#93C5FD' }}>{s.admNo}</code></td>
                                    <td>{s.name}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {statusOptions.map(opt => (
                                                <button key={opt} className={`btn btn-sm ${attendance[s.id] === opt ? `btn-${statusColors[opt]}` : 'btn-glass'}`}
                                                    onClick={() => setAttendance(prev => ({ ...prev, [s.id]: opt }))}
                                                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '4px 10px' }}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary">Save Attendance</button>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
