import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../shared/components/DataTable.jsx';
import LiquidGlassPanel from '../shared/components/LiquidGlassPanel.jsx';
import StatsCard from '../shared/components/StatsCard.jsx';
import FormField from '../shared/components/FormField.jsx';
import { useToast } from '../shared/components/Toast.jsx';
import { useAuth } from '../shared/utils/auth.jsx';
import { formatDate } from '../shared/utils/index.js';
import { generateSchoolPins, getSchool, listPins, listStudents } from '../shared/utils/api.js';

export default function Pins() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [pins, setPins] = useState([]);
    const [students, setStudents] = useState([]);
    const [quantity, setQuantity] = useState('10');
    const [term, setTerm] = useState('');
    const [session, setSession] = useState('');
    const [working, setWorking] = useState(false);

    async function loadData() {
        if (!schoolId) return;
        const [schoolDoc, pinRes, studentRes] = await Promise.all([
            getSchool(schoolId),
            listPins(schoolId),
            listStudents(schoolId),
        ]);
        setPins(pinRes.documents);
        setStudents(studentRes.documents);
        setTerm(schoolDoc.currentTerm || 'First Term');
        setSession(schoolDoc.currentSession || '2025/2026');
    }

    useEffect(() => {
        loadData();
    }, [schoolId]);

    const studentMap = useMemo(() => Object.fromEntries(students.map((item) => [item.$id, `${item.firstName} ${item.lastName}`])), [students]);
    const columns = [
        { key: 'code', label: 'PIN Code', render: (value) => <code style={{ color: '#93C5FD', fontSize: 13 }}>{value}</code> },
        { key: 'studentId', label: 'Student', render: (value) => studentMap[value] || 'Unassigned' },
        { key: 'term', label: 'Term' },
        { key: 'used', label: 'Status', render: (value) => <span className={`badge badge-${value ? 'warning' : 'success'}`}>{value ? 'Used' : 'Active'}</span> },
        { key: 'createdAt', label: 'Created', render: (value) => formatDate(value) },
    ];

    const activePins = pins.filter((item) => !item.used).length;
    const usedPins = pins.filter((item) => item.used).length;

    const handleGenerate = async () => {
        try {
            setWorking(true);
            await generateSchoolPins({ schoolId, term, session, count: Number(quantity) });
            await loadData();
            toast({ type: 'success', title: 'PINs generated', message: `${quantity} PIN(s) were generated successfully.` });
        } catch (error) {
            toast({ type: 'error', title: 'Generation failed', message: error.message });
        } finally {
            setWorking(false);
        }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">PIN Codes</h1><p className="page-subtitle">Generate and manage result access PINs</p></div>

            <div className="grid grid-3" style={{ marginBottom: 32 }}>
                <StatsCard icon="🔐" label="Total PINs" value={pins.length.toLocaleString()} />
                <StatsCard icon="✅" label="Active PINs" value={activePins.toLocaleString()} color="#10B981" />
                <StatsCard icon="⏳" label="Used PINs" value={usedPins.toLocaleString()} color="#F59E0B" />
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Generate New PINs</h3>
                <div className="grid grid-3">
                    <FormField label="Term" value={term} onChange={setTerm} />
                    <FormField label="Session" value={session} onChange={setSession} />
                    <FormField label="Quantity" type="number" value={quantity} onChange={setQuantity} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                    PIN generation is routed through the single backend function URL rather than handled in the browser.
                </div>
                <button className="btn btn-primary" onClick={handleGenerate} disabled={working}>🔐 {working ? 'Generating...' : `Generate ${quantity} PINs`}</button>
            </LiquidGlassPanel>

            <DataTable columns={columns} data={pins} />
        </div>
    );
}
