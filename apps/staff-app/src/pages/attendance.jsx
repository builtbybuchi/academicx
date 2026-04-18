import React, { useEffect, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import { markStudentAttendance, getStaffPortalData } from 'shared/utils/api.js';
import { useAuth } from 'shared/utils/auth.jsx';
import { enqueueAction, flushQueue, getQueue, loadPortalData } from '../utils/local-first.js';

const statusOptions = ['present', 'absent', 'late', 'excused'];
const statusColors = { present: 'success', absent: 'danger', late: 'warning', excused: 'primary' };

export default function Attendance() {
    const toast = useToast();
    const { schoolId, profile } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [saving, setSaving] = useState(false);
    const [syncInfo, setSyncInfo] = useState({ pending: 0, lastSyncedAt: '' });
    const [portalData, setPortalData] = useState(null);

    const queueContext = {
        schoolId: schoolId || 'school',
        userId: profile?.$id || 'staff',
    };

    const refreshQueueInfo = () => {
        setSyncInfo((current) => ({ ...current, pending: getQueue('student-attendance', queueContext).length }));
    };

    async function syncQueuedAttendance() {
        if (!navigator.onLine) {
            refreshQueueInfo();
            return;
        }
        const outcome = await flushQueue('student-attendance', queueContext, async (payload) => {
            await markStudentAttendance(payload);
        });
        if (outcome.processed > 0) {
            setSyncInfo({ pending: outcome.remaining, lastSyncedAt: new Date().toISOString() });
            toast({
                type: 'success',
                title: 'Attendance synced',
                message: `${outcome.processed} queued attendance batch${outcome.processed > 1 ? 'es' : ''} uploaded.`,
            });
            return;
        }
        refreshQueueInfo();
    }

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                const result = await loadPortalData({
                    schoolId,
                    userId: profile?.$id,
                    fetcher: () => getStaffPortalData(),
                });
                if (!active) return;

                const classNames = [...new Set([
                    ...(result.data?.assignedClasses || []),
                    ...(result.data?.formTeacherClasses || []),
                    ...((result.data?.students || []).map((item) => item.className)),
                    ...((result.data?.subjects || []).map((item) => item.className)),
                ])].filter(Boolean);
                const className = classNames[0] || '';
                const roster = (result.data?.students || []).filter((item) => item.className === className);

                setPortalData(result.data || null);
                setClasses(classNames);
                setSelectedClass(className);
                setStudents(roster);
                setAttendance(roster.reduce((acc, item) => ({ ...acc, [item.$id]: 'present' }), {}));
                refreshQueueInfo();
                await syncQueuedAttendance();
            } catch (error) {
                if (!active) return;
                toast({ type: 'error', title: 'Attendance unavailable', message: error.message || 'Failed to load attendance data.' });
            }
        }
        load();
        return () => {
            active = false;
        };
    }, [schoolId, profile?.$id]);

    useEffect(() => {
        if (!selectedClass) return;
        const roster = (portalData?.students || []).filter((item) => item.className === selectedClass);
        setStudents(roster);
        setAttendance((previous) => ({
            ...roster.reduce((acc, item) => ({ ...acc, [item.$id]: previous[item.$id] || 'present' }), {}),
        }));
    }, [selectedClass, portalData]);

    useEffect(() => {
        const handleOnline = () => {
            syncQueuedAttendance().catch(() => refreshQueueInfo());
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [schoolId, profile?.$id]);

    const summary = Object.values(attendance).reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {});

    async function handleSaveAttendance() {
        if (!selectedClass || students.length === 0) return;
        setSaving(true);
        try {
            const payload = {
                schoolId,
                className: selectedClass,
                date,
                markedBy: profile?.$id,
                records: students.map((student) => ({
                    studentId: student.$id,
                    className: selectedClass,
                    status: attendance[student.$id] || 'present',
                })),
            };

            enqueueAction('student-attendance', queueContext, {
                ...payload,
                queuedAt: new Date().toISOString(),
            });

            refreshQueueInfo();
            await syncQueuedAttendance();

            if (!navigator.onLine) {
                toast({ type: 'success', title: 'Saved offline', message: 'Attendance is stored locally and will sync when network returns.' });
            } else {
                toast({ type: 'success', title: 'Attendance saved', message: 'Student attendance submitted successfully.' });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">Mark daily attendance for your classes</p></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select className="input" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} style={{ width: 180 }}>
                        {classes.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 180 }} />
                </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 12 }}>
                {syncInfo.pending > 0 ? `${syncInfo.pending} attendance batch${syncInfo.pending > 1 ? 'es' : ''} waiting to sync.` : 'All attendance updates synced.'}
                {syncInfo.lastSyncedAt ? ` Last sync: ${new Date(syncInfo.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : ''}
            </div>

            <div className="grid grid-4" style={{ marginBottom: 24 }}>
                {statusOptions.map(s => (
                    <LiquidGlassPanel key={s} hover={false} style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{summary[s] || 0}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{s}</div>
                    </LiquidGlassPanel>
                ))}
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Adm. No.</th><th>Student Name</th><th>Status</th></tr></thead>
                        <tbody>
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ color: 'var(--color-gray-500)', textAlign: 'center' }}>
                                        No students in this assigned class.
                                    </td>
                                </tr>
                            )}
                            {students.map(s => (
                                <tr key={s.$id}>
                                    <td><code style={{ color: '#93C5FD' }}>{s.admissionNumber}</code></td>
                                    <td>{s.firstName} {s.lastName}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {statusOptions.map(opt => (
                                                <button key={opt} className={`btn btn-sm ${attendance[s.$id] === opt ? `btn-${statusColors[opt]}` : 'btn-glass'}`}
                                                    onClick={() => setAttendance(prev => ({ ...prev, [s.$id]: opt }))}
                                                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '4px 10px' }}>
                                                    {opt}
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
                    <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={saving}>{saving ? 'Saving...' : 'Save Attendance'}</button>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
