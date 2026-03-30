import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, ClipboardList, KeySquare, FileText, Settings, UserCircle, Mail, PlusCircle } from 'lucide-react';
import StatsCard from 'shared/components/StatsCard.jsx';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { useAuth } from 'shared/utils/auth.jsx';
import { formatDate } from 'shared/utils/index.js';
import { getSchool, listPins, listResults, listStaff, listStudents, listUsers } from 'shared/utils/api.js';

export default function Dashboard() {
    const { schoolId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [school, setSchool] = useState(null);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [results, setResults] = useState([]);
    const [pins, setPins] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!schoolId) {
            setLoading(false);
            return;
        }

        let active = true;
        async function load() {
            setLoading(true);
            try {
                const [schoolDoc, studentRes, staffRes, resultRes, pinRes, userRes] = await Promise.all([
                    getSchool(schoolId),
                    listStudents(schoolId),
                    listStaff(schoolId),
                    listResults(schoolId),
                    listPins(schoolId),
                    listUsers(schoolId),
                ]);

                if (!active) return;
                setSchool(schoolDoc);
                setStudents(studentRes.documents);
                setStaff(staffRes.documents);
                setResults(resultRes.documents);
                setPins(pinRes.documents);
                setUsers(userRes.documents);
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [schoolId]);

    const recentActivities = useMemo(() => {
        const recentUsers = users
            .filter((item) => item.createdAt)
            .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
            .slice(0, 3)
            .map((item) => ({
                text: `${item.firstName} ${item.lastName} added as ${item.role.replace('_', ' ')}`,
                time: formatDate(item.createdAt, { month: 'short', day: 'numeric' }),
                icon: <UserPlus size={18} />,
            }));

        const recentPins = pins
            .filter((item) => item.createdAt)
            .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
            .slice(0, 2)
            .map((item) => ({
                text: `PIN ${item.code} created for ${item.term || 'current term'}`,
                time: formatDate(item.createdAt, { month: 'short', day: 'numeric' }),
                icon: <KeySquare size={18} />,
            }));

        return [...recentUsers, ...recentPins].slice(0, 5);
    }, [pins, users]);

    const pendingResults = results.filter((item) => item.status !== 'approved').length;
    const activePins = pins.filter((item) => !item.used).length;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">{school ? `Overview for ${school.name}` : 'Overview of your school records.'}</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<Users size={24} color="#1D4ED8" />} label="Total Students" value={loading ? '...' : students.length.toLocaleString()} trend={school?.currentTerm || 'Current term'} trendUp={true} />
                <StatsCard icon={<UserCircle size={24} color="#8B5CF6" />} label="Total Staff" value={loading ? '...' : staff.length.toLocaleString()} trend={school?.currentSession || 'Current session'} trendUp={true} color="#8B5CF6" />
                <StatsCard icon={<ClipboardList size={24} color="#F59E0B" />} label="Results Pending" value={loading ? '...' : pendingResults.toLocaleString()} trend="Awaiting approval" trendUp={false} color="#F59E0B" />
                <StatsCard icon={<KeySquare size={24} color="#10B981" />} label="PINs Active" value={loading ? '...' : activePins.toLocaleString()} trend={`${pins.length.toLocaleString()} total`} trendUp={true} color="#10B981" />
            </div>

            <div className="grid grid-2">
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {recentActivities.length === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>No recent database activity is available yet.</div>
                        ) : recentActivities.map((activity, index) => (
                            <div key={`${activity.text}-${index}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid var(--color-gray-100)' }}>
                                <div style={{ color: 'var(--color-primary-600)', paddingTop: 2 }}>{activity.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, color: 'var(--color-gray-700)', fontWeight: 500 }}>{activity.text}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{activity.time}</div>
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
                        <button className="btn btn-glass" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={16} /> Update Grading Scheme</button>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
