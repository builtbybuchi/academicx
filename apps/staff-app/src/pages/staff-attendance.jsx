import React, { useState } from 'react';
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

export default function StaffAttendance() {
    const [checkedIn, setCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);

    const handleCheckIn = () => {
        const now = new Date().toLocaleTimeString();
        setCheckInTime(now);
        setCheckedIn(true);
        // TODO: Wire to staffCheckIn API
    };

    const handleCheckOut = () => {
        const now = new Date().toLocaleTimeString();
        setCheckOutTime(now);
        // TODO: Wire to staffCheckOut API
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
                        <button className="btn btn-primary btn-lg" onClick={handleCheckIn} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <LogIn size={20} /> Check In
                        </button>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--color-success)', marginBottom: 16 }}>
                                <CheckCircle size={20} /> Checked in at {checkInTime}
                            </div>
                            {!checkOutTime ? (
                                <button className="btn btn-glass btn-lg" onClick={handleCheckOut} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <LogOut size={20} /> Check Out
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
                    {[
                        { day: 'Monday', checkIn: '07:45 AM', checkOut: '04:00 PM', status: 'present' },
                        { day: 'Tuesday', checkIn: '08:35 AM', checkOut: '03:45 PM', status: 'late' },
                        { day: 'Wednesday', checkIn: '07:50 AM', checkOut: '04:10 PM', status: 'present' },
                        { day: 'Thursday', checkIn: '-', checkOut: '-', status: 'absent' },
                        { day: 'Friday', checkIn: '-', checkOut: '-', status: 'pending' },
                    ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-gray-100)' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-900)' }}>{r.day}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>{r.checkIn} → {r.checkOut}</div>
                            </div>
                            <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : r.status === 'absent' ? 'badge-danger' : 'badge-primary'}`}>
                                {r.status}
                            </span>
                        </div>
                    ))}
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
