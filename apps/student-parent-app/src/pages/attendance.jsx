import React from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const weeks = [
    { week: 'Week 1 (Mar 2-6)', data: ['present', 'present', 'present', 'late', 'present'] },
    { week: 'Week 2 (Mar 9-13)', data: ['present', 'absent', 'present', 'present', 'present'] },
    { week: 'Week 3 (Mar 16-20)', data: ['present', 'present', 'excused', 'present', 'present'] },
    { week: 'Week 4 (Mar 23-27)', data: ['present', 'present', 'present', 'present', 'present'] },
];

const statusEmoji = { present: '✅', absent: '❌', late: '⏰', excused: '📝' };
const statusColors = { present: '#10B981', absent: '#EF4444', late: '#F59E0B', excused: '#3B82F6' };

export default function AttendanceView() {
    const total = weeks.length * 5;
    const presentCount = weeks.flatMap(w => w.data).filter(d => d === 'present').length;
    const pct = ((presentCount / total) * 100).toFixed(1);

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Attendance</h1><p className="page-subtitle">First Term 2025/2026 · Your attendance record</p></div>

            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {['present', 'absent', 'late', 'excused'].map(s => {
                    const count = weeks.flatMap(w => w.data).filter(d => d === s).length;
                    return (
                        <LiquidGlassPanel key={s} hover={false} style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: statusColors[s] }}>{count}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{s}</div>
                        </LiquidGlassPanel>
                    );
                })}
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, margin: 0 }}>Overall Attendance</h3>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#10B981' }}>{pct}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #10B981, #3B82F6)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
            </LiquidGlassPanel>

            <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Week</th>{days.map(d => <th key={d}>{d}</th>)}</tr></thead>
                        <tbody>
                            {weeks.map((w, i) => (
                                <tr key={i}>
                                    <td style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{w.week}</td>
                                    {w.data.map((d, j) => (
                                        <td key={j} style={{ textAlign: 'center', fontSize: 18 }} title={d}>{statusEmoji[d]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
