import React, { useMemo, useState, useEffect } from 'react';
import LiquidGlassPanel from '../shared/components/LiquidGlassPanel.jsx';
import { getStudentPortalData } from '../shared/utils/api.js';

const statusEmoji = { present: '✅', absent: '❌', late: '⏰', excused: '📝' };
const statusColors = { present: '#10B981', absent: '#EF4444', late: '#F59E0B', excused: '#3B82F6' };

export default function AttendanceView() {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        getStudentPortalData().then((response) => {
            setRows(response.attendance || []);
        });
    }, []);

    const total = rows.length || 1;
    const presentCount = rows.filter((item) => item.status === 'present').length;
    const pct = ((presentCount / total) * 100).toFixed(1);

    const groupedWeeks = useMemo(() => {
        const byWeek = {};
        rows.forEach((item) => {
            const date = new Date(item.date);
            const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
            if (!byWeek[weekKey]) byWeek[weekKey] = [];
            byWeek[weekKey].push(item);
        });
        return Object.entries(byWeek).map(([week, items]) => ({ week, items }));
    }, [rows]);

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Attendance</h1><p className="page-subtitle">First Term 2025/2026 · Your attendance record</p></div>

            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {['present', 'absent', 'late', 'excused'].map(s => {
                    const count = rows.filter((item) => item.status === s).length;
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
                        <thead><tr><th>Week</th><th>Records</th></tr></thead>
                        <tbody>
                            {groupedWeeks.map((w, i) => (
                                <tr key={i}>
                                    <td style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{w.week}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {w.items.map((item) => (
                                                <span key={item.$id} title={`${item.date} - ${item.status}`} style={{ fontSize: 18 }}>
                                                    {statusEmoji[item.status] || '•'}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {groupedWeeks.length === 0 && (
                                <tr><td colSpan={2} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>No attendance records available yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
