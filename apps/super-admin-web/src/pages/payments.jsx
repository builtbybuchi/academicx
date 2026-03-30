import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'shared/components/DataTable.jsx';
import StatsCard from 'shared/components/StatsCard.jsx';
import { formatCurrency, formatDate } from 'shared/utils/index.js';
import { getSuperAdminPortalData } from 'shared/utils/api.js';

const columns = [
    { key: 'reference', label: 'Reference', render: (v) => <code style={{ color: '#93C5FD', fontSize: 12 }}>{v}</code> },
    { key: 'school', label: 'School' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: (v) => <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'success' ? 'success' : 'warning'}`}>{v}</span> },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
];

export default function Payments() {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        getSuperAdminPortalData().then((response) => {
            const schoolById = (response.schools || []).reduce((acc, school) => ({ ...acc, [school.$id]: school.name }), {});
            const mapped = (response.payments || []).map((payment) => ({
                id: payment.$id,
                reference: payment.reference,
                school: schoolById[payment.schoolId] || payment.schoolId,
                description: payment.description || payment.type,
                amount: Number(payment.amount || 0),
                status: payment.status,
                date: payment.createdAt,
            }));
            setRows(mapped);
        });
    }, []);

    const stats = useMemo(() => {
        const totalRevenue = rows.filter((item) => item.status === 'success').reduce((sum, item) => sum + item.amount, 0);
        return {
            totalRevenue,
            success: rows.filter((item) => item.status === 'success').length,
            pending: rows.filter((item) => item.status === 'pending').length,
            failed: rows.filter((item) => item.status === 'failed').length,
        };
    }, [rows]);

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Payments</h1><p className="page-subtitle">Track all platform payments via Squad</p></div>
            <div className="grid grid-4" style={{ marginBottom: 32 }}>
                <StatsCard icon="💰" label="Total Revenue" value={formatCurrency(stats.totalRevenue)} trend="Successful payments" trendUp={true} />
                <StatsCard icon="✅" label="Successful" value={stats.success} color="#10B981" />
                <StatsCard icon="⏳" label="Pending" value={stats.pending} color="#F59E0B" />
                <StatsCard icon="❌" label="Failed" value={stats.failed} color="#EF4444" />
            </div>
            <DataTable columns={columns} data={rows} />
        </div>
    );
}
