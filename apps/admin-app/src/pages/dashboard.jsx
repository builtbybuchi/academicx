import React from 'react';
import { Users, UserPlus, ClipboardList, KeySquare, Loader, FileText, Settings, UserCircle, Bell, Mail, PlusCircle, CheckCircle } from 'lucide-react';
import StatsCard from '../../../../shared/components/StatsCard.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const recentActivities = [
    { text: 'New student enrolled: Adebayo Oluwaseun (JSS1A)', time: '5 min ago', icon: <UserPlus size={18} /> },
    { text: 'Results submitted for SS2 Mathematics', time: '1 hour ago', icon: <ClipboardList size={18} /> },
    { text: '50 PIN codes generated for First Term 2025/2026', time: '3 hours ago', icon: <KeySquare size={18} /> },
    { text: 'Staff member added: Mrs. Okonkwo (English)', time: 'Yesterday', icon: <UserCircle size={18} /> },
    { text: 'Grading scheme updated for Senior Secondary', time: '2 days ago', icon: <Settings size={18} /> },
];

export default function Dashboard() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back. Here's an overview of your school.</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<Users size={24} color="#1D4ED8" />} label="Total Students" value="1,247" trend="+12% this term" trendUp={true} />
                <StatsCard icon={<UserCircle size={24} color="#8B5CF6" />} label="Total Staff" value="58" trend="+3 new" trendUp={true} color="#8B5CF6" />
                <StatsCard icon={<Loader size={24} color="#F59E0B" />} label="Results Pending" value="23" trend="5 classes left" trendUp={false} color="#F59E0B" />
                <StatsCard icon={<KeySquare size={24} color="#10B981" />} label="PINs Active" value="892" trend="108 remaining" trendUp={true} color="#10B981" />
            </div>

            <div className="grid grid-2">
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {recentActivities.map((a, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid var(--color-gray-100)' }}>
                                <div style={{ color: 'var(--color-primary-600)', paddingTop: 2 }}>{a.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: 'var(--color-gray-700)', fontWeight: 500 }}>{a.text}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{a.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}><UserPlus size={16} /> Enroll New Student</button>
                        <button className="btn btn-glass" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} /> Generate Broadsheet</button>
                        <button className="btn btn-glass" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}><KeySquare size={16} /> Generate PIN Codes</button>
                        <button className="btn btn-glass" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} /> Send Bulk Email</button>
                        <button className="btn btn-glass" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}><PlusCircle size={16} /> Register New Subject</button>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
