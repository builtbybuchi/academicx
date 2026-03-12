import React from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import StatsCard from '../../../../shared/components/StatsCard.jsx';

const monthlyData = [
    { month: 'Oct', schools: 18, revenue: 480000 },
    { month: 'Nov', schools: 20, revenue: 620000 },
    { month: 'Dec', schools: 21, revenue: 750000 },
    { month: 'Jan', schools: 22, revenue: 890000 },
    { month: 'Feb', schools: 23, revenue: 1050000 },
    { month: 'Mar', schools: 24, revenue: 1200000 },
];

export default function Analytics() {
    const maxRev = Math.max(...monthlyData.map(d => d.revenue));

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Analytics</h1><p className="page-subtitle">Platform-wide metrics and trends</p></div>

            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon="📈" label="Growth Rate" value="+33%" trend="6 months" trendUp={true} />
                <StatsCard icon="🔄" label="Retention" value="96%" color="#10B981" />
                <StatsCard icon="📊" label="Avg. Students/School" value="535" color="#8B5CF6" />
                <StatsCard icon="🎯" label="Active Rate" value="92%" color="#06B6D4" />
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
                                height: `${(d.revenue / maxRev) * 160}px`,
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
                    {[
                        { plan: 'Enterprise', count: 4, color: '#8B5CF6', pct: 17 },
                        { plan: 'Professional', count: 12, color: '#3B82F6', pct: 50 },
                        { plan: 'Starter', count: 8, color: '#10B981', pct: 33 },
                    ].map((p, i) => (
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
                        { role: 'Students', count: 8540, pct: 66 },
                        { role: 'Parents', count: 2680, pct: 21 },
                        { role: 'Staff', count: 1350, pct: 10 },
                        { role: 'Admins', count: 277, pct: 3 },
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
