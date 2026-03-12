import React from 'react';

export default function StatsCard({ icon, label, value, trend, trendUp, color = 'var(--color-primary)' }) {
    return (
        <div className="liquid-glass" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: 13, color: 'var(--color-gray-500)', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-gray-900)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                        {value}
                    </div>
                    {trend && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, fontWeight: 600, color: trendUp ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            <span>{trendUp ? '↑' : '↓'}</span>
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
