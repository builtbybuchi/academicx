import React from 'react';
import { BookOpen, Users, ClipboardList, CheckSquare, Edit3 } from 'lucide-react';
import StatsCard from '../../../../shared/components/StatsCard.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const classes = [
    { name: 'JSS1A', students: 42, subject: 'Mathematics', pendingResults: true },
    { name: 'SS1A', students: 38, subject: 'Mathematics', pendingResults: false },
    { name: 'SS2B', students: 35, subject: 'Mathematics', pendingResults: true },
];

export default function Dashboard() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Staff Dashboard</h1>
                <p className="page-subtitle">Welcome back, Jane. Here are your assigned classes.</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<BookOpen size={24} color="var(--color-primary-600)" />} label="Assigned Classes" value="3" />
                <StatsCard icon={<Users size={24} color="#8B5CF6" />} label="Total Students" value="115" color="#8B5CF6" />
                <StatsCard icon={<ClipboardList size={24} color="#F59E0B" />} label="Pending Results" value="2" trend="2 classes remaining" trendUp={false} color="#F59E0B" />
                <StatsCard icon={<CheckSquare size={24} color="#10B981" />} label="Attendance Today" value="92%" trend="+3% vs last week" trendUp={true} color="#10B981" />
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Your Classes</h3>
            <div className="grid grid-3">
                {classes.map((c, i) => (
                    <LiquidGlassPanel key={i} style={{ padding: 24, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-gray-900)', fontFamily: 'var(--font-heading)' }}>{c.name}</div>
                            {c.pendingResults && <span className="badge badge-warning">Results Due</span>}
                            {!c.pendingResults && <span className="badge badge-success">Submitted</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>{c.subject}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 4 }}>{c.students} students</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button className="btn btn-glass btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Edit3 size={14} /> Results</button>
                            <button className="btn btn-glass btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CheckSquare size={14} /> Attendance</button>
                        </div>
                    </LiquidGlassPanel>
                ))}
            </div>
        </div>
    );
}
