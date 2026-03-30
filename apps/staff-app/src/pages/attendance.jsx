import React, { useEffect, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { markStudentAttendance, getStaffPortalData } from 'shared/utils/api.js';
import { useAuth } from 'shared/utils/auth.jsx';

const statusOptions = ['present', 'absent', 'late', 'excused'];
const statusColors = { present: 'success', absent: 'danger', late: 'warning', excused: 'primary' };

export default function Attendance() {
    const { schoolId, profile } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        async function load() {
            const response = await getStaffPortalData();
            if (!active) return;
            const classNames = response.assignedClasses || [];
            setClasses(classNames);
            const firstClass = classNames[0] || '';
            setSelectedClass(firstClass);
            const roster = (response.students || []).filter((item) => item.className === firstClass || !firstClass);
            setStudents(roster);
            setAttendance(roster.reduce((acc, item) => ({ ...acc, [item.$id]: 'present' }), {}));
        }
        load();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedClass) return;
        getStaffPortalData().then((response) => {
            const roster = (response.students || []).filter((item) => item.className === selectedClass);
            setStudents(roster);
            setAttendance((previous) => ({
                ...roster.reduce((acc, item) => ({ ...acc, [item.$id]: previous[item.$id] || 'present' }), {}),
            }));
        });
    }, [selectedClass]);

    const summary = Object.values(attendance).reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {});

    async function handleSaveAttendance() {
        if (!selectedClass || students.length === 0) return;
        setSaving(true);
        try {
            await markStudentAttendance({
                schoolId,
                className: selectedClass,
                date,
                markedBy: profile?.$id,
                records: students.map((student) => ({
                    studentId: student.$id,
                    className: selectedClass,
                    status: attendance[student.$id] || 'present',
                })),
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">Mark daily attendance for your classes</p></div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <select className="input" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} style={{ width: 180 }}>
                        {classes.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 180 }} />
                </div>
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
