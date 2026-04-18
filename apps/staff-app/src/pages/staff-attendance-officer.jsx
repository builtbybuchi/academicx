import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import {
    getStaffPortalData,
    listStaff,
    listStaffAttendanceRecords,
    markStaffAttendance,
} from 'shared/utils/api.js';
import { useAuth } from 'shared/utils/auth.jsx';
import {
    enqueueAction,
    flushQueue,
    getQueue,
    loadPortalData,
    readLocal,
    writeLocal,
} from '../utils/local-first.js';

const statusOptions = ['present', 'absent', 'late', 'excused'];
const statusColors = { present: 'success', absent: 'danger', late: 'warning', excused: 'primary' };

function toStatusMap(records = []) {
    return records.reduce((acc, item) => ({
        ...acc,
        [item.staffDocId]: {
            status: item.status || 'present',
            checkIn: item.checkIn || '',
            checkOut: item.checkOut || '',
            excuseReason: item.excuseReason || '',
        },
    }), {});
}

export default function StaffAttendanceOfficer() {
    const toast = useToast();
    const { schoolId, profile } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [canManage, setCanManage] = useState(false);
    const [staffRows, setStaffRows] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [attendance, setAttendance] = useState({});
    const [syncInfo, setSyncInfo] = useState({ pending: 0, lastSyncedAt: '' });

    const queueContext = useMemo(() => ({
        schoolId: schoolId || 'school',
        userId: profile?.$id || 'staff',
    }), [schoolId, profile?.$id]);

    const refreshQueueInfo = () => {
        setSyncInfo((current) => ({ ...current, pending: getQueue('staff-attendance', queueContext).length }));
    };

    async function syncQueuedStaffAttendance() {
        if (!navigator.onLine) {
            refreshQueueInfo();
            return;
        }

        const outcome = await flushQueue('staff-attendance', queueContext, async (payload) => {
            await markStaffAttendance(payload);
        });

        if (outcome.processed > 0) {
            setSyncInfo({ pending: outcome.remaining, lastSyncedAt: new Date().toISOString() });
            toast({
                type: 'success',
                title: 'Staff attendance synced',
                message: `${outcome.processed} queued batch${outcome.processed > 1 ? 'es' : ''} uploaded.`,
            });
            return;
        }

        refreshQueueInfo();
    }

    async function loadRosterAndRecords(targetDate) {
        const cacheContext = { schoolId, userId: profile?.$id };
        try {
            const [staffResponse, attendanceResponse] = await Promise.all([
                listStaff(schoolId),
                listStaffAttendanceRecords({ schoolId, date: targetDate, limit: 500 }),
            ]);

            const staffDocs = staffResponse.documents || [];
            const records = attendanceResponse.documents || attendanceResponse.data?.documents || [];

            setStaffRows(staffDocs);
            setAttendance((current) => {
                const incoming = toStatusMap(records);
                return staffDocs.reduce((acc, item) => ({
                    ...acc,
                    [item.$id]: current[item.$id] || incoming[item.$id] || { status: 'present', checkIn: '', checkOut: '', excuseReason: '' },
                }), {});
            });

            writeLocal('staff-roster', cacheContext, staffDocs);
            writeLocal(`staff-attendance-day.${targetDate}`, cacheContext, records);
        } catch {
            const localRoster = readLocal('staff-roster', cacheContext, []);
            const localRecords = readLocal(`staff-attendance-day.${targetDate}`, cacheContext, []);
            setStaffRows(localRoster);
            setAttendance((current) => {
                const incoming = toStatusMap(localRecords);
                return localRoster.reduce((acc, item) => ({
                    ...acc,
                    [item.$id]: current[item.$id] || incoming[item.$id] || { status: 'present', checkIn: '', checkOut: '', excuseReason: '' },
                }), {});
            });
        }
    }

    useEffect(() => {
        let active = true;

        async function load() {
            setLoading(true);
            try {
                const portal = await loadPortalData({
                    schoolId,
                    userId: profile?.$id,
                    fetcher: () => getStaffPortalData(),
                });
                if (!active) return;

                const allowed = Boolean(portal.data?.staff?.canMarkStaffAttendance || portal.data?.staff?.attendanceRole === 'officer');
                setCanManage(allowed);

                refreshQueueInfo();
                await syncQueuedStaffAttendance();

                if (allowed) {
                    await loadRosterAndRecords(date);
                }
            } catch (error) {
                if (!active) return;
                toast({ type: 'error', title: 'Staff attendance unavailable', message: error.message || 'Unable to load staff attendance page.' });
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [schoolId, profile?.$id]);

    useEffect(() => {
        if (!canManage || !schoolId) return;
        loadRosterAndRecords(date);
    }, [date, canManage, schoolId]);

    useEffect(() => {
        const handleOnline = () => {
            syncQueuedStaffAttendance().catch(() => refreshQueueInfo());
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [queueContext.schoolId, queueContext.userId]);

    const summary = Object.values(attendance).reduce((acc, item) => {
        const status = item?.status || 'present';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const updateStatus = (staffDocId, status) => {
        const now = new Date().toTimeString().slice(0, 8);
        setAttendance((current) => {
            const previous = current[staffDocId] || { status: 'present', checkIn: '', checkOut: '', excuseReason: '' };
            const next = {
                ...previous,
                status,
                checkIn: status === 'present' || status === 'late' ? (previous.checkIn || now) : '',
                checkOut: status === 'present' || status === 'late' ? previous.checkOut : '',
                excuseReason: status === 'excused' ? (previous.excuseReason || 'Excused') : '',
            };
            return { ...current, [staffDocId]: next };
        });
    };

    const saveAttendance = async () => {
        if (!canManage || staffRows.length === 0) return;
        setSaving(true);
        try {
            const payload = {
                schoolId,
                date,
                markedBy: profile?.$id,
                records: staffRows.map((staff) => {
                    const row = attendance[staff.$id] || { status: 'present', checkIn: '', checkOut: '', excuseReason: '' };
                    return {
                        staffDocId: staff.$id,
                        status: row.status,
                        checkIn: row.checkIn,
                        checkOut: row.checkOut,
                        excuseReason: row.excuseReason,
                    };
                }),
            };

            enqueueAction('staff-attendance', queueContext, {
                ...payload,
                queuedAt: new Date().toISOString(),
            });

            refreshQueueInfo();
            await syncQueuedStaffAttendance();

            if (!navigator.onLine) {
                toast({ type: 'success', title: 'Saved offline', message: 'Staff attendance is stored locally and will sync when online.' });
            } else {
                toast({ type: 'success', title: 'Staff attendance saved', message: 'Attendance records submitted successfully.' });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: 16 }}>Loading...</div>;
    }

    if (!canManage) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Staff Attendance</h1>
                    <p className="page-subtitle">Only assigned attendance officers can mark staff attendance.</p>
                </div>
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <p style={{ color: 'var(--color-gray-600)' }}>
                        Access is limited to attendance officers and admins.
                    </p>
                </LiquidGlassPanel>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Staff Attendance</h1>
                    <p className="page-subtitle">Mark present, absent, late or excused for staff members</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ width: 180 }} />
                </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 12 }}>
                {syncInfo.pending > 0 ? `${syncInfo.pending} attendance batch${syncInfo.pending > 1 ? 'es' : ''} waiting to sync.` : 'All staff attendance updates synced.'}
                {syncInfo.lastSyncedAt ? ` Last sync: ${new Date(syncInfo.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : ''}
            </div>

            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {statusOptions.map((status) => (
                    <LiquidGlassPanel key={status} hover={false} style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{summary[status] || 0}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{status}</div>
                    </LiquidGlassPanel>
                ))}
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Staff ID</th>
                                <th>Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffRows.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ color: 'var(--color-gray-500)', textAlign: 'center' }}>
                                        No staff records available.
                                    </td>
                                </tr>
                            )}
                            {staffRows.map((staff) => (
                                <tr key={staff.$id}>
                                    <td><code style={{ color: '#93C5FD' }}>{staff.staffId || staff.$id}</code></td>
                                    <td>{staff.firstName} {staff.lastName}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {statusOptions.map((status) => (
                                                <button
                                                    key={status}
                                                    className={`btn btn-sm ${attendance[staff.$id]?.status === status ? `btn-${statusColors[status]}` : 'btn-glass'}`}
                                                    onClick={() => updateStatus(staff.$id, status)}
                                                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '4px 10px' }}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={saveAttendance} disabled={saving || staffRows.length === 0}>
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
