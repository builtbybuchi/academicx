import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import FormField from 'shared/components/FormField.jsx';
import { getSuperAdminPortalData } from 'shared/utils/api.js';

export default function System() {
    const [platformName, setPlatformName] = useState('AcademicX');
    const [supportEmail, setSupportEmail] = useState('support@academicx.com');
    const [currency, setCurrency] = useState('NGN');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [data, setData] = useState({ schools: [], users: [], payments: [] });

    useEffect(() => {
        getSuperAdminPortalData().then((response) => setData(response));
    }, []);

    const health = useMemo(() => {
        const paymentFailures = (data.payments || []).filter((item) => item.status === 'failed').length;
        return [
            { service: 'Function API', status: 'Operational', color: '#10B981' },
            { service: 'Database', status: 'Operational', color: '#10B981' },
            { service: 'Realtime', status: 'Operational', color: '#10B981' },
            { service: 'Payment Gateway', status: paymentFailures > 0 ? 'Degraded' : 'Operational', color: paymentFailures > 0 ? '#F59E0B' : '#10B981' },
            { service: 'Email Service', status: 'Monitoring', color: '#3B82F6' },
        ];
    }, [data]);

    return (
        <div>
            <div className="page-header"><h1 className="page-title">System Administration</h1><p className="page-subtitle">Platform configuration and maintenance</p></div>

            <div className="grid grid-2" style={{ marginBottom: 24 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>Platform Settings</h3>
                    <FormField label="Platform Name" value={platformName} onChange={setPlatformName} />
                    <FormField label="Support Email" value={supportEmail} onChange={setSupportEmail} />
                    <FormField label="Default Currency" type="select" value={currency} onChange={setCurrency} options={[{ value: 'NGN', label: 'Nigerian Naira (₦)' }, { value: 'USD', label: 'US Dollar ($)' }]} />
                    <FormField label="Maintenance Mode" type="checkbox" value={maintenanceMode} onChange={setMaintenanceMode} />
                    <button className="btn btn-primary btn-sm">Save Settings</button>
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>Live Runtime Snapshot</h3>
                    <div style={{ display: 'grid', gap: 8, fontSize: 13, color: 'var(--color-gray-600)' }}>
                        <div>Total Schools: <strong style={{ color: 'var(--color-gray-900)' }}>{data.schools?.length || 0}</strong></div>
                        <div>Total Users: <strong style={{ color: 'var(--color-gray-900)' }}>{data.users?.length || 0}</strong></div>
                        <div>Total Payments: <strong style={{ color: 'var(--color-gray-900)' }}>{data.payments?.length || 0}</strong></div>
                        <div>Failed Payments: <strong style={{ color: 'var(--color-gray-900)' }}>{(data.payments || []).filter((item) => item.status === 'failed').length}</strong></div>
                    </div>
                </LiquidGlassPanel>
            </div>

            <div className="grid grid-2">
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>System Health</h3>
                    {health.map((s, i) => (
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
                        <button className="btn btn-glass" style={{ width: '100%' }}>Refresh Platform Metrics</button>
                        <button className="btn btn-glass" style={{ width: '100%' }}>Export Payment Report</button>
                        <button className="btn btn-glass" style={{ width: '100%' }}>Audit School Admin Accounts</button>
                        <button className="btn btn-glass" style={{ width: '100%' }}>Review Failed Transactions</button>
                        <button className="btn btn-danger" style={{ width: '100%' }}>{maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode</button>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
