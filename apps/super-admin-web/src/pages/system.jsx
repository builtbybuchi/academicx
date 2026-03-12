import React from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';

export default function System() {
    return (
        <div>
            <div className="page-header"><h1 className="page-title">System Administration</h1><p className="page-subtitle">Platform configuration and maintenance</p></div>

            <div className="grid grid-2" style={{ marginBottom: 24 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>Platform Settings</h3>
                    <FormField label="Platform Name" value="AcademicX" />
                    <FormField label="Support Email" value="support@academicx.com" />
                    <FormField label="Default Currency" type="select" value="NGN" options={[{ value: 'NGN', label: 'Nigerian Naira (₦)' }, { value: 'USD', label: 'US Dollar ($)' }]} />
                    <FormField label="Maintenance Mode" type="checkbox" />
                    <button className="btn btn-primary btn-sm">Save Settings</button>
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>Squad Payment Config</h3>
                    <FormField label="API Base URL" value="https://api.squadco.com" />
                    <FormField label="Secret Key" type="password" value="sk_test_..." placeholder="Squad secret key" />
                    <FormField label="Public Key" value="pk_test_..." placeholder="Squad public key" />
                    <FormField label="Webhook URL" value="https://api.academicx.com/webhooks/squad" />
                    <button className="btn btn-primary btn-sm">Update Payment Config</button>
                </LiquidGlassPanel>
            </div>

            <div className="grid grid-2">
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>System Health</h3>
                    {[
                        { service: 'API Server', status: 'Operational', color: '#10B981' },
                        { service: 'Database', status: 'Operational', color: '#10B981' },
                        { service: 'Appwrite Realtime', status: 'Operational', color: '#10B981' },
                        { service: 'Squad Payment Gateway', status: 'Operational', color: '#10B981' },
                        { service: 'Email Service', status: 'Degraded', color: '#F59E0B' },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{s.service}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                                <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.status}</span>
                            </div>
                        </div>
                    ))}
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button className="btn btn-glass" style={{ width: '100%' }}>🔄 Clear Platform Cache</button>
                        <button className="btn btn-glass" style={{ width: '100%' }}>📧 Test Email Service</button>
                        <button className="btn btn-glass" style={{ width: '100%' }}>📊 Export Platform Report</button>
                        <button className="btn btn-glass" style={{ width: '100%' }}>🔐 Rotate API Keys</button>
                        <button className="btn btn-danger" style={{ width: '100%' }}>⚠️ Enable Maintenance Mode</button>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
