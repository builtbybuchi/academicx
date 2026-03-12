import React, { useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import StatsCard from '../../../../shared/components/StatsCard.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { generatePIN, formatDate } from '../../../../shared/utils/index.js';

const samplePins = [
    { id: 'p1', code: 'AX7K9M2NP4', student: 'Adebayo Oluwaseun', term: 'First Term', used: false, expiresAt: '2026-04-30' },
    { id: 'p2', code: 'BQ3W8R5TY6', student: 'Chidinma Okafor', term: 'First Term', used: true, expiresAt: '2026-04-30' },
    { id: 'p3', code: 'CX1H4J7LM9', student: 'Musa Ibrahim', term: 'First Term', used: false, expiresAt: '2026-04-30' },
];

const columns = [
    { key: 'code', label: 'PIN Code', render: (v) => <code style={{ color: '#93C5FD', fontSize: 13 }}>{v}</code> },
    { key: 'student', label: 'Student' },
    { key: 'term', label: 'Term' },
    { key: 'used', label: 'Status', render: (v) => <span className={`badge badge-${v ? 'warning' : 'success'}`}>{v ? 'Used' : 'Active'}</span> },
    { key: 'expiresAt', label: 'Expires', render: (v) => formatDate(v) },
];

export default function Pins() {
    const [quantity, setQuantity] = useState('10');

    return (
        <div>
            <div className="page-header"><h1 className="page-title">PIN Codes</h1><p className="page-subtitle">Generate and manage result access PINs</p></div>

            <div className="grid grid-3" style={{ marginBottom: 32 }}>
                <StatsCard icon="🔐" label="Total PINs" value="1,000" />
                <StatsCard icon="✅" label="Active PINs" value="892" color="#10B981" />
                <StatsCard icon="⏳" label="Used PINs" value="108" color="#F59E0B" />
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Generate New PINs</h3>
                <div className="grid grid-3">
                    <FormField label="Term" type="select" options={[{ value: 'first', label: 'First Term' }, { value: 'second', label: 'Second Term' }, { value: 'third', label: 'Third Term' }]} />
                    <FormField label="Session" type="select" options={[{ value: '2025/2026', label: '2025/2026' }]} />
                    <FormField label="Quantity" type="number" value={quantity} onChange={setQuantity} />
                </div>
                <button className="btn btn-primary">🔐 Generate {quantity} PINs</button>
            </LiquidGlassPanel>

            <DataTable columns={columns} data={samplePins} />
        </div>
    );
}
