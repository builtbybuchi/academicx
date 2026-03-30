import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Users, CreditCard, KeySquare } from 'lucide-react';
import StatsCard from '../shared/components/StatsCard.jsx';
import LiquidGlassPanel from '../shared/components/LiquidGlassPanel.jsx';
import { formatCurrency } from '../shared/utils/index.js';
import { getSuperAdminPortalData } from '../shared/utils/api.js';

export default function Dashboard() {
    const [data, setData] = useState({ schools: [], users: [], payments: [], pins: [] });

    useEffect(() => {
        getSuperAdminPortalData().then((response) => {
            setData(response);
        });
    }, []);

    const stats = useMemo(() => {
        const revenue = (data.payments || []).filter((item) => item.status === 'success').reduce((sum, item) => sum + Number(item.amount || 0), 0);
        return {
            schoolCount: data.schools?.length || 0,
            userCount: data.users?.length || 0,
            revenue,
            pins: data.pins?.length || 0,
        };
    }, [data]);

    const topSchools = useMemo(() => {
        return (data.schools || [])
            .map((school) => {
                const schoolUsers = (data.users || []).filter((item) => item.schoolId === school.$id && item.role === 'student').length;
                return { ...school, students: schoolUsers };
            })
            .sort((left, right) => right.students - left.students)
            .slice(0, 4);
    }, [data]);

    const recentActivity = useMemo(() => {
        const paymentEvents = (data.payments || []).slice(0, 3).map((item) => ({ text: `Payment ${item.reference} - ${formatCurrency(item.amount || 0)}`, time: item.createdAt || 'N/A' }));
        const schoolEvents = (data.schools || []).slice(0, 2).map((item) => ({ text: `School registered: ${item.name}`, time: item.createdAt || 'N/A' }));
        return [...paymentEvents, ...schoolEvents].slice(0, 5);
    }, [data]);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Platform Overview</h1>
                <p className="page-subtitle">System-wide statistics across all schools</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<Building2 size={24} color="var(--color-primary-600)" />} label="Total Schools" value={stats.schoolCount} trend="Live from database" trendUp={true} />
                <StatsCard icon={<Users size={24} color="#8B5CF6" />} label="Total Users" value={stats.userCount.toLocaleString()} trend="Live from database" trendUp={true} color="#8B5CF6" />
                <StatsCard icon={<CreditCard size={24} color="#10B981" />} label="Revenue (All Time)" value={formatCurrency(stats.revenue)} trend="Successful payments" trendUp={true} color="#10B981" />
                <StatsCard icon={<KeySquare size={24} color="#F59E0B" />} label="PINs Generated" value={stats.pins.toLocaleString()} trend="All terms" color="#F59E0B" />
            </div>

            <div className="grid grid-2">
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Top Schools by Students</h3>
                    {topSchools.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                            <div>
                                <div style={{ fontSize: 14, color: 'var(--color-gray-900)', fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>{s.students} students</div>
                            </div>
                            <span className="badge badge-primary">{s.paymentModel}</span>
                        </div>
                    ))}
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Recent Activity</h3>
                    {recentActivity.map((a, i) => (
                        <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                            <div style={{ fontSize: 13, color: 'var(--color-gray-700)', fontWeight: 500 }}>{a.text}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{a.time}</div>
                        </div>
                    ))}
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
