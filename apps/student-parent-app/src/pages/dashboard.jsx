import React from 'react';
import { BarChart2, CheckSquare, BookOpen, Trophy, Bell } from 'lucide-react';
import StatsCard from '../../../../shared/components/StatsCard.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const announcements = [
    { title: 'End of Term Exams', text: 'Exams commence on March 20, 2026. Ensure all assignments are submitted.', date: 'Mar 10, 2026', type: 'important' },
    { title: 'PTA Meeting', text: 'Parents-Teachers Association meeting scheduled for March 25 at 10 AM.', date: 'Mar 8, 2026', type: 'info' },
    { title: 'School Fees Reminder', text: 'Outstanding fees must be paid before exam registration closes.', date: 'Mar 5, 2026', type: 'warning' },
];

const typeColors = { important: 'var(--color-danger)', info: 'var(--color-primary)', warning: 'var(--color-warning)' };

export default function Dashboard() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Welcome, Sam!</h1>
                <p className="page-subtitle">SS1A · Admission No: ADM/2025/003</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<BarChart2 size={24} color="var(--color-primary-600)" />} label="Term Average" value="72.5%" trend="+5.2% vs last term" trendUp={true} />
                <StatsCard icon={<CheckSquare size={24} color="#10B981" />} label="Attendance" value="94%" color="#10B981" />
                <StatsCard icon={<BookOpen size={24} color="#8B5CF6" />} label="Subjects" value="9" color="#8B5CF6" />
                <StatsCard icon={<Trophy size={24} color="#F59E0B" />} label="Class Position" value="5th" color="#F59E0B" />
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={18} /> Announcements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.map((a, i) => (
                    <LiquidGlassPanel key={i} hover={false} style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[a.type] }} />
                                    <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-gray-900)' }}>{a.title}</h4>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.6 }}>{a.text}</p>
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--color-gray-400)', whiteSpace: 'nowrap', marginLeft: 16 }}>{a.date}</span>
                        </div>
                    </LiquidGlassPanel>
                ))}
            </div>
        </div>
    );
}
