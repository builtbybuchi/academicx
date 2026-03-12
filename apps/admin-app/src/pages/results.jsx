import React, { useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const sampleResults = [
    { id: 'r1', student: 'Adebayo Oluwaseun', class: 'JSS1A', subject: 'Mathematics', cat: 18, mock: 16, exam: 52, total: 86, grade: 'A', status: 'approved' },
    { id: 'r2', student: 'Chidinma Okafor', class: 'JSS1B', subject: 'English', cat: 15, mock: 14, exam: 45, total: 74, grade: 'A', status: 'pending' },
    { id: 'r3', student: 'Musa Ibrahim', class: 'SS1A', subject: 'Physics', cat: 12, mock: 10, exam: 38, total: 60, grade: 'B', status: 'pending' },
    { id: 'r4', student: 'Fatima Abubakar', class: 'SS2A', subject: 'Biology', cat: 10, mock: 8, exam: 30, total: 48, grade: 'D', status: 'approved' },
];

const columns = [
    { key: 'student', label: 'Student' },
    { key: 'class', label: 'Class' },
    { key: 'subject', label: 'Subject' },
    { key: 'cat', label: 'CAT' },
    { key: 'mock', label: 'Mock' },
    { key: 'exam', label: 'Exam' },
    { key: 'total', label: 'Total' },
    { key: 'grade', label: 'Grade', render: (v) => <span className="badge badge-primary">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'approved' ? 'success' : 'warning'}`}>{v}</span> },
];

export default function Results() {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? sampleResults : sampleResults.filter(r => r.status === filter);

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Results</h1><p className="page-subtitle">Review and approve student results</p></div>
                <div className="flex gap-2">
                    <button className="btn btn-success btn-sm">✓ Approve Selected</button>
                    <button className="btn btn-glass btn-sm">📄 Generate Broadsheet</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['all', 'pending', 'approved'].map(f => (
                    <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${sampleResults.filter(r => f === 'all' || r.status === f).length})`}
                    </button>
                ))}
            </div>

            <DataTable columns={columns} data={filtered} />
        </div>
    );
}
