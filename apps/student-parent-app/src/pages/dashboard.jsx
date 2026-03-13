import React, { useEffect, useMemo, useState } from 'react';
import { BarChart2, CheckSquare, BookOpen, Trophy, Bell } from 'lucide-react';
import StatsCard from '../../../../shared/components/StatsCard.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import { getStudentPortalData, updateProfile } from '../../../../shared/utils/api.js';
import { useAuth } from '../../../../shared/utils/auth.jsx';

const typeColors = { important: 'var(--color-danger)', info: 'var(--color-primary)', warning: 'var(--color-warning)' };

export default function Dashboard() {
    const { profile, checkAuth } = useAuth();
    const [data, setData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saveBusy, setSaveBusy] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

    useEffect(() => {
        let active = true;
        async function load() {
            const response = await getStudentPortalData();
            if (!active) return;
            setData(response);
            setForm({
                firstName: response.user?.firstName || '',
                lastName: response.user?.lastName || '',
                phone: response.user?.phone || '',
            });
        }
        load();
        return () => {
            active = false;
        };
    }, []);

    const stats = useMemo(() => {
        const results = data?.results || [];
        const attendance = data?.attendance || [];
        const avg = results.length ? (results.reduce((sum, row) => sum + Number(row.totalScore || 0), 0) / results.length).toFixed(1) : '0.0';
        const presentCount = attendance.filter((row) => row.status === 'present').length;
        const attendancePct = attendance.length ? ((presentCount / attendance.length) * 100).toFixed(1) : '0.0';
        const subjects = new Set(results.map((row) => row.subjectId)).size;
        const sorted = [...results].sort((left, right) => Number(right.totalScore || 0) - Number(left.totalScore || 0));
        return {
            avg,
            attendancePct,
            subjects,
            rank: sorted.length ? `${Math.min(10, sorted.length)}th` : '-',
        };
    }, [data]);

    async function saveProfile() {
        if (!profile?.$id) return;
        setSaveBusy(true);
        try {
            await updateProfile({
                userId: profile.$id,
                updates: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                },
            });
            await checkAuth();
            setEditing(false);
        } finally {
            setSaveBusy(false);
        }
    }

    const announcements = [
        {
            title: data?.school?.name || 'School Updates',
            text: `Current academic period is ${data?.term || 'N/A'} ${data?.session || ''}.`,
            date: new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: 'info',
        },
        {
            title: 'PIN Access',
            text: data?.hasVerifiedPin ? 'You already verified a PIN for this term.' : 'Verify your result PIN to unlock term reports.',
            date: 'Today',
            type: data?.hasVerifiedPin ? 'important' : 'warning',
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Welcome, {data?.student?.firstName || 'Student'}!</h1>
                <p className="page-subtitle">{data?.student?.className || '-'} · Admission No: {data?.student?.admissionNumber || '-'}</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<BarChart2 size={24} color="var(--color-primary-600)" />} label="Term Average" value={`${stats.avg}%`} trend={`${data?.term || 'Current term'} results`} trendUp={true} />
                <StatsCard icon={<CheckSquare size={24} color="#10B981" />} label="Attendance" value={`${stats.attendancePct}%`} color="#10B981" />
                <StatsCard icon={<BookOpen size={24} color="#8B5CF6" />} label="Subjects" value={`${stats.subjects}`} color="#8B5CF6" />
                <StatsCard icon={<Trophy size={24} color="#F59E0B" />} label="Class Position" value={stats.rank} color="#F59E0B" />
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 20, marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, color: 'var(--color-gray-900)', margin: 0 }}>Profile</h3>
                    <button className="btn btn-sm btn-glass" onClick={() => setEditing((current) => !current)}>{editing ? 'Cancel' : 'Edit Profile'}</button>
                </div>
                {editing ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                        <input className="input" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} placeholder="First Name" />
                        <input className="input" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last Name" />
                        <input className="input" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" />
                        <button className="btn btn-primary" disabled={saveBusy} onClick={saveProfile}>{saveBusy ? 'Saving...' : 'Save Profile'}</button>
                    </div>
                ) : (
                    <div style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>{data?.user?.firstName} {data?.user?.lastName} • {data?.user?.email}</div>
                )}
            </LiquidGlassPanel>

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
