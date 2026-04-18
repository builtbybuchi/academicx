import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { getStaffPortalData } from 'shared/utils/api.js';
import { useAuth } from 'shared/utils/auth.jsx';
import { loadPortalData } from '../utils/local-first.js';

export default function StaffAttendance() {
    const { schoolId, profile } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadData() {
        setLoading(true);
        try {
            const result = await loadPortalData({
                schoolId,
                userId: profile?.$id,
                fetcher: () => getStaffPortalData(),
            });
            setRecords(result.data?.staffAttendance || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const thisWeekRecords = useMemo(() => records.slice(0, 10), [records]);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Attendance</h1>
                <p className="page-subtitle">View your attendance records and timing history</p>
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <Clock size={18} style={{ color: 'var(--color-primary)' }} />
                    <h3 style={{ fontSize: 18, color: 'var(--color-gray-900)' }}>Attendance History</h3>
                </div>
                {loading && <div style={{ color: 'var(--color-gray-500)', fontSize: 13 }}>Loading records...</div>}
                {!loading && thisWeekRecords.map((r, i) => (
                    <div key={r.$id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-gray-100)', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-900)' }}>{r.date}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>In: {r.checkIn || '-'} | Out: {r.checkOut || '-'}</div>
                        </div>
                        <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : r.status === 'absent' ? 'badge-danger' : 'badge-primary'}`}>
                            {r.status || 'recorded'}
                        </span>
                    </div>
                ))}
                {!loading && thisWeekRecords.length === 0 && (
                    <div style={{ color: 'var(--color-gray-500)', fontSize: 13 }}>No attendance records available yet.</div>
                )}
            </LiquidGlassPanel>
        </div>
    );
}
