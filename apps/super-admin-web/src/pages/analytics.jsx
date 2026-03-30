import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from '../shared/components/LiquidGlassPanel.jsx';
import StatsCard from '../shared/components/StatsCard.jsx';
import { getSuperAdminPortalData } from '../shared/utils/api.js';

export default function Analytics() {
    const [data, setData] = useState({ schools: [], users: [], payments: [] });

    useEffect(() => {
        getSuperAdminPortalData().then((response) => setData(response));
    }, []);

    const monthlyData = useMemo(() => {
        const months = {};
        (data.payments || []).forEach((payment) => {
            const key = new Date(payment.createdAt || Date.now()).toLocaleDateString('en-NG', { month: 'short' });
            if (!months[key]) months[key] = { month: key, revenue: 0, schools: new Set() };
            months[key].revenue += Number(payment.amount || 0);
            months[key].schools.add(payment.schoolId);
        });
        return Object.values(months).map((item) => ({ month: item.month, revenue: item.revenue, schools: item.schools.size })).slice(-6);
    }, [data]);

    const maxRev = Math.max(...monthlyData.map(d => d.revenue));

    const roleCounts = useMemo(() => {
        const users = data.users || [];
        return {
            students: users.filter((item) => item.role === 'student').length,
            staff: users.filter((item) => item.role === 'staff').length,
            admins: users.filter((item) => item.role === 'admin').length,
            superAdmins: users.filter((item) => item.role === 'super_admin').length,
        };
    }, [data]);

    const schoolPlans = useMemo(() => {
        const schools = data.schools || [];
        const total = schools.length || 1;
        const schoolPays = schools.filter((item) => item.paymentModel === 'school_pays').length;
        const studentPays = schools.filter((item) => item.paymentModel === 'student_pays').length;
        return [
            { plan: 'School Pays', count: schoolPays, color: '#8B5CF6', pct: Math.round((schoolPays / total) * 100) },
            { plan: 'Student Pays', count: studentPays, color: '#3B82F6', pct: Math.round((studentPays / total) * 100) },
        ];
    }, [data]);

    const totalUsers = roleCounts.students + roleCounts.staff + roleCounts.admins + roleCounts.superAdmins || 1;

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Analytics</h1><p className="page-subtitle">Platform-wide metrics and trends</p></div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon="📈" label="Growth Trend" value={`${monthlyData.length} mo`} trend="Monthly revenue view" trendUp={true} />
                <StatsCard icon="🔄" label="Retention" value="Live" color="#10B981" />
                <StatsCard icon="📊" label="Avg. Students/School" value={Math.round(roleCounts.students / ((data.schools || []).length || 1))} color="#8B5CF6" />
                <StatsCard icon="🎯" label="Active Rate" value={`${Math.round((roleCounts.students / totalUsers) * 100)}%`} color="#06B6D4" />
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 24 }}>Revenue Trend (Last 6 Months)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200 }}>
                    {monthlyData.map((d, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                                ₦{(d.revenue / 1000).toFixed(0)}K
                            </div>
                            <div style={{
                                width: '100%', borderRadius: 8,
                                height: `${maxRev ? (d.revenue / maxRev) * 160 : 10}px`,
                                background: `linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)`,
                                transition: 'height 0.5s ease',
                                minHeight: 20,
                            }} />
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{d.month}</div>
                        </div>
                    ))}
                </div>
            </LiquidGlassPanel>

            <div className="grid grid-2">
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>Schools by Plan</h3>
                    {schoolPlans.map((p, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{p.plan}</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{p.count} ({p.pct}%)</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 3 }} />
                            </div>
                        </div>
                    ))}
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>User Distribution</h3>
                    {[
                        { role: 'Students', count: roleCounts.students, pct: Math.round((roleCounts.students / totalUsers) * 100) },
                        { role: 'Staff', count: roleCounts.staff, pct: Math.round((roleCounts.staff / totalUsers) * 100) },
                        { role: 'Admins', count: roleCounts.admins, pct: Math.round((roleCounts.admins / totalUsers) * 100) },
                        { role: 'Super Admins', count: roleCounts.superAdmins, pct: Math.round((roleCounts.superAdmins / totalUsers) * 100) },
                    ].map((r, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{r.role}</span>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{r.count.toLocaleString()}</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                                <div style={{ height: '100%', width: `${r.pct}%`, background: '#3B82F6', borderRadius: 3 }} />
                            </div>
                        </div>
                    ))}
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
