import React from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import StatsCard from '../../../../shared/components/StatsCard.jsx';
import { formatCurrency, formatDate } from '../../../../shared/utils/index.js';

const payments = [
    { id: 'pay1', school: 'Greenfield Academy', amount: 35000, reference: 'SQ-2026-001', status: 'success', date: '2026-03-10', description: 'Enterprise Plan - First Term' },
    { id: 'pay2', school: 'Royal Hills College', amount: 15000, reference: 'SQ-2026-002', status: 'success', date: '2026-03-08', description: 'Professional Plan - First Term' },
    { id: 'pay3', school: 'Victory Academy', amount: 5000, reference: 'SQ-2026-003', status: 'pending', date: '2026-03-12', description: 'Starter Plan - First Term' },
    { id: 'pay4', school: 'Bright Future School', amount: 15000, reference: 'SQ-2026-004', status: 'success', date: '2026-03-05', description: 'Professional Plan - First Term' },
];

const columns = [
    { key: 'reference', label: 'Reference', render: (v) => <code style={{ color: '#93C5FD', fontSize: 12 }}>{v}</code> },
    { key: 'school', label: 'School' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: (v) => <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'success' ? 'success' : 'warning'}`}>{v}</span> },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
];

export default function Payments() {
    return (
        <div>
            <div className="page-header"><h1 className="page-title">Payments</h1><p className="page-subtitle">Track all platform payments via Squad</p></div>
            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon="💰" label="Total Revenue" value="₦1.2M" trend="+18%" trendUp={true} />
                <StatsCard icon="✅" label="Successful" value="21" color="#10B981" />
                <StatsCard icon="⏳" label="Pending" value="3" color="#F59E0B" />
                <StatsCard icon="❌" label="Failed" value="1" color="#EF4444" />
            </div>
            <DataTable columns={columns} data={payments} />
        </div>
    );
}
