import React from 'react';
import { Building2, Users, CreditCard, KeySquare } from 'lucide-react';
import StatsCard from '../../../../shared/components/StatsCard.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

export default function Dashboard() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Platform Overview</h1>
                <p className="page-subtitle">System-wide statistics across all schools</p>
            </div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon={<Building2 size={24} color="var(--color-primary-600)" />} label="Total Schools" value="24" trend="+3 this month" trendUp={true} />
                <StatsCard icon={<Users size={24} color="#8B5CF6" />} label="Total Users" value="12,847" trend="+847 this month" trendUp={true} color="#8B5CF6" />
                <StatsCard icon={<CreditCard size={24} color="#10B981" />} label="Revenue (MTD)" value="₦1.2M" trend="+18% vs last month" trendUp={true} color="#10B981" />
                <StatsCard icon={<KeySquare size={24} color="#F59E0B" />} label="PINs Generated" value="45,200" trend="This term" color="#F59E0B" />
            </div>

            <div className="grid grid-2">
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Top Schools by Students</h3>
                    {[
                        { name: 'Greenfield Academy', students: 1247, plan: 'Enterprise' },
                        { name: 'Royal Hills College', students: 890, plan: 'Professional' },
                        { name: 'Bright Future School', students: 654, plan: 'Professional' },
                        { name: 'Victory Academy', students: 432, plan: 'Starter' },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                            <div>
                                <div style={{ fontSize: 14, color: 'var(--color-gray-900)', fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>{s.students} students</div>
                            </div>
                            <span className="badge badge-primary">{s.plan}</span>
                        </div>
                    ))}
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Recent Activity</h3>
                    {[
                        { text: 'New school registered: Harmony International', time: '2 hours ago' },
                        { text: 'Payment received: ₦35,000 from Victory Academy', time: '5 hours ago' },
                        { text: 'System update deployed: v2.4.1', time: '1 day ago' },
                        { text: 'New admin created at Bright Future School', time: '2 days ago' },
                    ].map((a, i) => (
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
