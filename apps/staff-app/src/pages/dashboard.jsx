import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, ClipboardList, CheckSquare, Edit3 } from 'lucide-react';
import StatsCard from '../shared/components/StatsCard.jsx';
import LiquidGlassPanel from '../shared/components/LiquidGlassPanel.jsx';
import { getStaffPortalData } from '../shared/utils/api.js';
import { useAuth } from '../shared/utils/auth.jsx';

export default function Dashboard() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [portalData, setPortalData] = useState(null);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            try {
                const response = await getStaffPortalData();
                if (active) setPortalData(response);
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => {
            active = false;
        };
    }, []);

    const classMetrics = useMemo(() => {
        const assignedClasses = portalData?.assignedClasses || [];
        const students = portalData?.students || [];
        const subjects = portalData?.subjects || [];
        const results = portalData?.results || [];

        return assignedClasses.map((className) => {
            const classStudents = students.filter((item) => item.className === className);
            const classSubject = subjects.find((item) => item.className === className);
            const pendingResults = results.filter((item) => item.className === className && item.status !== 'approved').length;
            return {
                name: className,
                students: classStudents.length,
                subject: classSubject?.name || 'Assigned Subject',
                pendingResults,
            };
        });
    }, [portalData]);

    const attendanceToday = (portalData?.staffAttendance || []).find((item) => item.date === new Date().toISOString().slice(0, 10));

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Staff Dashboard</h1>
                <p className="page-subtitle">Welcome back, {profile?.firstName || 'Teacher'}. Here are your assigned classes.</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<BookOpen size={24} color="var(--color-primary-600)" />} label="Assigned Classes" value={loading ? '...' : (portalData?.assignedClasses?.length || 0)} />
                <StatsCard icon={<Users size={24} color="#8B5CF6" />} label="Total Students" value={loading ? '...' : (portalData?.students?.length || 0)} color="#8B5CF6" />
                <StatsCard icon={<ClipboardList size={24} color="#F59E0B" />} label="Pending Results" value={loading ? '...' : (portalData?.results?.filter((item) => item.status !== 'approved').length || 0)} trend="Awaiting approvals" trendUp={false} color="#F59E0B" />
                <StatsCard icon={<CheckSquare size={24} color="#10B981" />} label="Attendance Today" value={attendanceToday?.checkIn ? 'Checked In' : 'Not Marked'} trend={attendanceToday?.checkIn || 'Pending'} trendUp={Boolean(attendanceToday?.checkIn)} color="#10B981" />
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Your Classes</h3>
            <div className="grid grid-3">
                {classMetrics.map((c, i) => (
                    <LiquidGlassPanel key={i} style={{ padding: 24, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-gray-900)', fontFamily: 'var(--font-heading)' }}>{c.name}</div>
                            {c.pendingResults > 0 && <span className="badge badge-warning">{c.pendingResults} pending</span>}
                            {c.pendingResults === 0 && <span className="badge badge-success">Submitted</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>{c.subject}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 4 }}>{c.students} students</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button className="btn btn-glass btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Edit3 size={14} /> Results</button>
                            <button className="btn btn-glass btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CheckSquare size={14} /> Attendance</button>
                        </div>
                    </LiquidGlassPanel>
                ))}
                {!loading && classMetrics.length === 0 && (
                    <LiquidGlassPanel style={{ padding: 24 }}>
                        <div style={{ color: 'var(--color-gray-500)', fontSize: 14 }}>No class assignment found yet. Ask admin to assign your classes.</div>
                    </LiquidGlassPanel>
                )}
            </div>
        </div>
    );
}
