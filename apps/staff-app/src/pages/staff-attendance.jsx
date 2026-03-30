import React, { useEffect, useMemo, useState } from 'react';
import { Clock, LogIn, LogOut, CheckCircle } from 'lucide-react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { getStaffPortalData, staffCheckIn, staffCheckOut } from 'shared/utils/api.js';
import { useAuth } from 'shared/utils/auth.jsx';

export default function StaffAttendance() {
    const { schoolId } = useAuth();
    const [staffDocId, setStaffDocId] = useState('');
    const [records, setRecords] = useState([]);
    const [busy, setBusy] = useState(false);

    async function loadData() {
        const data = await getStaffPortalData();
        setStaffDocId(data.staff?.$id || '');
        setRecords(data.staffAttendance || []);
    }

    useEffect(() => {
        loadData();
    }, []);

    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = records.find((item) => item.date === today);
    const checkedIn = Boolean(todayRecord?.checkIn);
    const checkInTime = todayRecord?.checkIn || null;
    const checkOutTime = todayRecord?.checkOut || null;

    const thisWeekRecords = useMemo(() => records.slice(0, 5), [records]);

    const handleCheckIn = async () => {
        if (!staffDocId) return;
        setBusy(true);
        try {
            await staffCheckIn(schoolId, staffDocId);
            await loadData();
        } finally {
            setBusy(false);
        }
    };

    const handleCheckOut = async () => {
        if (!staffDocId) return;
        setBusy(true);
        try {
            await staffCheckOut(staffDocId);
            await loadData();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Attendance</h1>
                <p className="page-subtitle">Check in when you arrive and out when you leave</p>
            </div>

            <div className="grid grid-2" style={{ marginBottom: 32 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 32, textAlign: 'center' }}>
                    <Clock size={48} style={{ color: 'var(--color-primary)', marginBottom: 16 }} />
                    <h3 style={{ fontSize: 20, marginBottom: 8, color: 'var(--color-gray-900)' }}>Today's Status</h3>
                    <div style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 24 }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {!checkedIn ? (
                        <button className="btn btn-primary btn-lg" onClick={handleCheckIn} disabled={busy} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <LogIn size={20} /> {busy ? 'Checking In...' : 'Check In'}
                        </button>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--color-success)', marginBottom: 16 }}>
                                <CheckCircle size={20} /> Checked in at {checkInTime}
                            </div>
                            {!checkOutTime ? (
                                <button className="btn btn-glass btn-lg" onClick={handleCheckOut} disabled={busy} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <LogOut size={20} /> {busy ? 'Checking Out...' : 'Check Out'}
                                </button>
                            ) : (
                                <div style={{ color: 'var(--color-gray-600)' }}>
                                    Checked out at {checkOutTime}
                                </div>
                            )}
                        </div>
                    )}
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 20, color: 'var(--color-gray-900)' }}>This Week's Records</h3>
                    {thisWeekRecords.map((r, i) => (
                        <div key={r.$id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-900)' }}>{r.date}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>{r.checkIn || '-'} → {r.checkOut || '-'}</div>
                            </div>
                            <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : r.status === 'absent' ? 'badge-danger' : 'badge-primary'}`}>
                                {r.status}
                            </span>
                        </div>
                    ))}
                    {thisWeekRecords.length === 0 && (
                        <div style={{ color: 'var(--color-gray-500)', fontSize: 13 }}>No attendance records available yet.</div>
                    )}
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
