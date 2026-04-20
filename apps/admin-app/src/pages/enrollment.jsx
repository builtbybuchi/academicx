import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'shared/components/DataTable.jsx';
import Modal from 'shared/components/Modal.jsx';
import FormField from 'shared/components/FormField.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import { useAuth } from 'shared/utils/auth.jsx';
import {
    addStaff,
    assignFormTeacher,
    enrollStudent,
    listClasses,
    listFormTeachers,
    listStaff,
    listStudents,
    listSubjects,
    listUsers,
    setStaffAttendanceOfficer,
    updateProfile,
} from 'shared/utils/api.js';

function parseList(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item || '').trim()).filter(Boolean);
            }
        } catch {
            return value.split(',').map((item) => String(item || '').trim()).filter(Boolean);
        }
    }

    return [];
}

function MultiSelectChips({ label, value = [], options = [], onChange, placeholder, helperText }) {
    const selected = Array.isArray(value) ? value : [];
    const toggleValue = (nextValue) => {
        const exists = selected.includes(nextValue);
        onChange(exists ? selected.filter((item) => item !== nextValue) : [...selected, nextValue]);
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <label className="input-label">{label}</label>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                padding: 10,
                border: '1px solid rgba(148, 163, 184, 0.35)',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.72)',
                maxHeight: 220,
                overflow: 'auto',
            }}>
                {options.length === 0 ? (
                    <div style={{ color: 'var(--color-gray-500)', fontSize: 13 }}>{placeholder || 'No options available'}</div>
                ) : options.map((option) => {
                    const active = selected.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={active ? 'btn btn-primary btn-sm' : 'btn btn-glass btn-sm'}
                            onClick={() => toggleValue(option.value)}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {active ? '✓ ' : ''}{option.label}
                        </button>
                    );
                })}
            </div>
            {selected.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {selected.map((item) => (
                        <span key={item} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => toggleValue(item)}>
                            {item} ×
                        </span>
                    ))}
                </div>
            )}
            {helperText && <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 6 }}>{helperText}</div>}
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ height: 24, width: '38%', borderRadius: 999, background: 'linear-gradient(90deg, rgba(148,163,184,0.18), rgba(148,163,184,0.32), rgba(148,163,184,0.18))', backgroundSize: '200% 100%', animation: 'pulseX 1.2s ease-in-out infinite' }} />
            <div style={{ height: 18, width: '56%', borderRadius: 999, background: 'linear-gradient(90deg, rgba(148,163,184,0.12), rgba(148,163,184,0.22), rgba(148,163,184,0.12))', backgroundSize: '200% 100%', animation: 'pulseX 1.2s ease-in-out infinite' }} />
            <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[...Array(4)].map((_, index) => (
                        <div key={index} style={{ height: 88, borderRadius: 16, background: 'linear-gradient(90deg, rgba(148,163,184,0.12), rgba(148,163,184,0.2), rgba(148,163,184,0.12))', backgroundSize: '200% 100%', animation: 'pulseX 1.2s ease-in-out infinite' }} />
                    ))}
                </div>
            </div>
            <div className="card" style={{ padding: 16 }}>
                {[...Array(6)].map((_, index) => (
                    <div key={index} style={{ height: 16, borderRadius: 999, marginBottom: index === 5 ? 0 : 12, width: `${92 - index * 6}%`, background: 'linear-gradient(90deg, rgba(148,163,184,0.12), rgba(148,163,184,0.2), rgba(148,163,184,0.12))', backgroundSize: '200% 100%', animation: 'pulseX 1.2s ease-in-out infinite' }} />
                ))}
            </div>
        </div>
    );
}

export default function Enrollment() {
    const { schoolId, profile } = useAuth();
    const toast = useToast();
    const [tab, setTab] = useState('students');
    const [modalOpen, setModalOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [users, setUsers] = useState([]);
    const [formTeacherRows, setFormTeacherRows] = useState([]);
    const [assigningByClass, setAssigningByClass] = useState({});
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loadedTabs, setLoadedTabs] = useState({ students: false, staff: false, form_teachers: false });
    const [tabLoading, setTabLoading] = useState({ students: true, staff: false, form_teachers: false });
    const [saving, setSaving] = useState(false);
    const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', className: '', section: 'A', gender: '', parentName: '', parentEmail: '', parentPhone: '', dateOfBirth: '', allergies: '' });
    const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', password: '', department: [], staffType: 'academic', gender: '', dateOfBirth: '', canMarkStaffAttendance: false });
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', dateOfBirth: '', allergies: '', assignedClasses: [], assignedSubjects: [] });

    async function loadTabData(targetTab = tab, force = false) {
        if (!schoolId) return;

        if (!force && loadedTabs[targetTab]) {
            return;
        }

        setTabLoading((current) => ({ ...current, [targetTab]: true }));
        try {
            if (targetTab === 'students') {
                const [studentRes, classRes, userRes] = await Promise.all([
                    listStudents(schoolId),
                    listClasses(schoolId),
                    listUsers(schoolId),
                ]);
                setStudents(studentRes.documents || []);
                setClasses(classRes.documents || []);
                setUsers(userRes.documents || []);
            }

            if (targetTab === 'staff') {
                const [staffRes, classRes, userRes, subjectRes] = await Promise.all([
                    listStaff(schoolId),
                    listClasses(schoolId),
                    listUsers(schoolId),
                    listSubjects(schoolId),
                ]);
                setStaff(staffRes.documents || []);
                setClasses(classRes.documents || []);
                setUsers(userRes.documents || []);
                setSubjects(subjectRes.documents || []);
            }

            if (targetTab === 'form_teachers') {
                const [formTeacherRes, staffRes, classRes] = await Promise.all([
                    listFormTeachers(schoolId),
                    listStaff(schoolId),
                    listClasses(schoolId),
                ]);
                setFormTeacherRows(Array.isArray(formTeacherRes) ? formTeacherRes : []);
                setStaff(staffRes.documents || []);
                setClasses(classRes.documents || []);
            }

            setLoadedTabs((current) => ({ ...current, [targetTab]: true }));
        } catch (error) {
            toast({ type: 'error', title: 'Load failed', message: error.message || 'Unable to load profile data.' });
        } finally {
            setTabLoading((current) => ({ ...current, [targetTab]: false }));
        }
    }

    useEffect(() => {
        setLoadedTabs({ students: false, staff: false, form_teachers: false });
        setTabLoading({ students: false, staff: false, form_teachers: false });
        setStudents([]);
        setStaff([]);
        setUsers([]);
        setFormTeacherRows([]);
        setClasses([]);
        setSubjects([]);
    }, [schoolId]);

    useEffect(() => {
        if (schoolId) {
            loadTabData(tab);
        }
    }, [schoolId, tab]);

    const classOptions = useMemo(() => {
        const dbClasses = classes.map((item) => item.name);
        const studentClasses = students.map((item) => item.className).filter(Boolean);
        return [...new Set([...dbClasses, ...studentClasses])].map((name) => ({ value: name, label: name }));
    }, [classes, students]);

    const usersById = useMemo(() => Object.fromEntries(users.map((item) => [item.$id, item])), [users]);

    const studentRows = useMemo(() => students.map((item) => {
        const user = usersById[item.userId] || {};
        return {
            ...item,
            dateOfBirth: user.dateOfBirth || '',
            phone: user.phone || item.parentPhone || '',
        };
    }), [students, usersById]);

    const staffRows = useMemo(() => staff.map((item) => {
        const user = usersById[item.userId] || {};
        const formTeacherClasses = (() => {
            const parsed = parseList(item.formTeacherClasses);
            return parsed.length > 0 ? parsed : parseList(item.formTeacherClass);
        })();
        const assignedClasses = parseList(item.assignedClasses);
        const assignedSubjects = parseList(item.assignedSubjects);
        return {
            ...item,
            dateOfBirth: user.dateOfBirth || item.dateOfBirth || '',
            phone: user.phone || '',
            formTeacherClasses,
            assignedClasses,
            assignedSubjects,
        };
    }), [staff, usersById]);

    const currentTabLoading = !loadedTabs[tab] || tabLoading[tab];

    const studentCols = useMemo(() => ([
        { key: 'admissionNumber', label: 'Adm. No.' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'className', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'dateOfBirth', label: 'DOB', render: (v) => v || '-' },
        { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : 'warning'}`}>{v}</span> },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-glass btn-sm" onClick={() => {
                        setSelectedRecord({ ...row, recordType: 'student' });
                        setDetailOpen(true);
                    }}>View</button>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                        setSelectedRecord({ ...row, recordType: 'student' });
                        setEditForm({
                            firstName: row.firstName || '',
                            lastName: row.lastName || '',
                            phone: row.phone || row.parentPhone || '',
                            dateOfBirth: row.dateOfBirth || '',
                            allergies: row.allergies || '',
                        });
                        setEditOpen(true);
                    }}>Edit</button>
                </div>
            ),
        },
    ]), []);

    const staffCols = useMemo(() => ([
        { key: 'staffId', label: 'Staff ID' },
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'department', label: 'Department' },
        { key: 'formTeacherClasses', label: 'Form Classes', render: (v, row) => (Array.isArray(v) && v.length > 0 ? v.join(', ') : (row.formTeacherClass || '-')) },
        {
            key: 'attendanceRole',
            label: 'Attendance Officer',
            sortable: false,
            render: (_, row) => (
                <button
                    className={`btn btn-sm ${row.canMarkStaffAttendance ? 'btn-primary' : 'btn-glass'}`}
                    onClick={async () => {
                        try {
                            await setStaffAttendanceOfficer({
                                schoolId,
                                staffDocId: row.$id,
                                enabled: !row.canMarkStaffAttendance,
                            });
                            toast({ type: 'success', title: 'Updated', message: `${row.firstName} ${row.lastName} attendance role updated.` });
                                await loadTabData('staff', true);
                        } catch (error) {
                            toast({ type: 'error', title: 'Update failed', message: error.message });
                        }
                    }}
                >
                    {row.canMarkStaffAttendance ? 'Assigned' : 'Assign'}
                </button>
            ),
        },
        { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : 'warning'}`}>{v}</span> },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-glass btn-sm" onClick={() => {
                        setSelectedRecord({ ...row, recordType: 'staff' });
                        setDetailOpen(true);
                    }}>View</button>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                        setSelectedRecord({ ...row, recordType: 'staff' });
                        setEditForm({
                            firstName: row.firstName || '',
                            lastName: row.lastName || '',
                            phone: row.phone || '',
                            dateOfBirth: row.dateOfBirth || '',
                            allergies: '',
                            assignedClasses: row.assignedClasses || [],
                            assignedSubjects: row.assignedSubjects || [],
                        });
                        setEditOpen(true);
                    }}>Edit</button>
                </div>
            ),
        },
    ]), [schoolId, toast]);

    const formTeacherCols = useMemo(() => ([
        { key: 'name', label: 'Class' },
        { key: 'level', label: 'Level' },
        {
            key: 'formTeacher',
            label: 'Current Form Teacher',
            render: (v) => (v ? `${v.firstName || ''} ${v.lastName || ''}`.trim() : 'Unassigned'),
        },
        {
            key: 'assign',
            label: 'Assign',
            sortable: false,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                        className="input"
                        value={assigningByClass[row.$id] || ''}
                        onChange={(event) => setAssigningByClass((current) => ({ ...current, [row.$id]: event.target.value }))}
                        style={{ minWidth: 190, padding: '6px 10px' }}
                    >
                        <option value="">Select staff</option>
                        {staffRows.map((item) => (
                            <option key={item.$id} value={item.$id}>
                                {item.firstName} {item.lastName}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={async () => {
                            const staffDocId = assigningByClass[row.$id];
                            if (!staffDocId) {
                                toast({ type: 'error', title: 'Select staff', message: 'Pick a staff member first.' });
                                return;
                            }
                            try {
                                await assignFormTeacher({ schoolId, classId: row.$id, staffDocId });
                                toast({ type: 'success', title: 'Assigned', message: `Form teacher updated for ${row.name}.` });
                                await loadTabData('form_teachers', true);
                            } catch (error) {
                                toast({ type: 'error', title: 'Assignment failed', message: error.message });
                            }
                        }}
                    >
                        Save
                    </button>
                </div>
            ),
        },
    ]), [assigningByClass, schoolId, staffRows, toast]);

    const handleSave = async () => {
        if (!schoolId || !profile?.schoolCode) return;

        try {
            setSaving(true);
            if (tab === 'students') {
                if (!studentForm.className) {
                    throw new Error('Class is required. Add/select a class before saving.');
                }
                if (!studentForm.parentEmail && !studentForm.parentPhone) {
                    throw new Error('Parent email or parent phone is required for student sign-in.');
                }

                const result = await enrollStudent({ schoolId, schoolCode: profile.schoolCode, ...studentForm });
                setStudentForm({ firstName: '', lastName: '', className: '', section: 'A', gender: '', parentName: '', parentEmail: '', parentPhone: '', dateOfBirth: '', allergies: '' });
                const studentId = result?.studentId || result?.student?.admissionNumber;
                const credential = studentForm.parentPhone || studentForm.parentEmail;
                toast({
                    type: 'success',
                    title: 'Student enrolled',
                    message: `Student created. Login uses Student ID ${studentId || '-'} and parent phone/email (${credential || '-'})`,
                });
            } else {
                const assignedSubjects = Array.isArray(staffForm.department) ? staffForm.department : [];
                await addStaff({
                    schoolId,
                    schoolCode: profile.schoolCode,
                    ...staffForm,
                    department: assignedSubjects,
                    assignedSubjects,
                });
                setStaffForm({ firstName: '', lastName: '', email: '', password: '', department: [], staffType: 'academic', gender: '', dateOfBirth: '', canMarkStaffAttendance: false });
                toast({ type: 'success', title: 'Staff added', message: 'Staff record and login were created successfully.' });
            }

            setModalOpen(false);
            await loadTabData(tab, true);
        } catch (error) {
            toast({ type: 'error', title: 'Save failed', message: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleEditSave = async () => {
        if (!selectedRecord?.userId) return;
        try {
            setSaving(true);
            await updateProfile({
                schoolId,
                userId: selectedRecord.userId,
                updates: {
                    firstName: editForm.firstName,
                    lastName: editForm.lastName,
                    phone: editForm.phone,
                    dateOfBirth: editForm.dateOfBirth,
                    allergies: selectedRecord.recordType === 'student' ? editForm.allergies : undefined,
                    assignedClasses: selectedRecord.recordType === 'staff' ? editForm.assignedClasses : undefined,
                    assignedSubjects: selectedRecord.recordType === 'staff' ? editForm.assignedSubjects : undefined,
                    department: selectedRecord.recordType === 'staff' ? editForm.assignedSubjects : undefined,
                },
            });
            toast({ type: 'success', title: 'Profile updated', message: `${editForm.firstName} ${editForm.lastName} was updated.` });
            setEditOpen(false);
            await loadTabData(tab, true);
        } catch (error) {
            toast({ type: 'error', title: 'Update failed', message: error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Manage student and staff profiles, plus form teacher assignments.</p>
                </div>
                {(tab === 'students' || tab === 'staff') && <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    + Add {tab === 'students' ? 'Student' : 'Staff'}
                </button>}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`btn ${tab === 'students' ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setTab('students')}>Students</button>
                <button className={`btn ${tab === 'staff' ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setTab('staff')}>Staff</button>
                <button className={`btn ${tab === 'form_teachers' ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setTab('form_teachers')}>Form Teachers</button>
            </div>

            {currentTabLoading ? (
                <div className="card" style={{ padding: 20 }}>
                    <ProfileSkeleton />
                </div>
            ) : (
                <>
                    {tab === 'students' && <DataTable columns={studentCols} data={studentRows} />}
                    {tab === 'staff' && <DataTable columns={staffCols} data={staffRows} />}
                    {tab === 'form_teachers' && <DataTable columns={formTeacherCols} data={formTeacherRows} emptyMessage="No classes found for this school." />}
                </>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'students' ? 'Enroll Student' : 'Add Staff'} footer={<><button className="btn btn-glass" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
                {tab === 'students' ? (
                    <>
                        <FormField label="First Name" required placeholder="Enter first name" value={studentForm.firstName} onChange={(value) => setStudentForm((current) => ({ ...current, firstName: value }))} />
                        <FormField label="Last Name" required placeholder="Enter last name" value={studentForm.lastName} onChange={(value) => setStudentForm((current) => ({ ...current, lastName: value }))} />
                        <FormField label="Class" required type="select" options={classOptions} placeholder="Select class" value={studentForm.className} onChange={(value) => setStudentForm((current) => ({ ...current, className: value }))} />
                        <FormField label="Section" type="select" options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }]} value={studentForm.section} onChange={(value) => setStudentForm((current) => ({ ...current, section: value }))} />
                        <FormField label="Gender" type="select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} value={studentForm.gender} onChange={(value) => setStudentForm((current) => ({ ...current, gender: value }))} />
                        <FormField label="Date of Birth" type="date" value={studentForm.dateOfBirth} onChange={(value) => setStudentForm((current) => ({ ...current, dateOfBirth: value }))} />
                        <FormField label="Allergies" type="textarea" rows={2} placeholder="Optional allergy or medical notes" value={studentForm.allergies} onChange={(value) => setStudentForm((current) => ({ ...current, allergies: value }))} />
                        <FormField label="Parent Name" placeholder="Parent or guardian name" value={studentForm.parentName} onChange={(value) => setStudentForm((current) => ({ ...current, parentName: value }))} />
                        <FormField label="Parent Email" type="email" placeholder="parent@example.com" value={studentForm.parentEmail} onChange={(value) => setStudentForm((current) => ({ ...current, parentEmail: value }))} />
                        <FormField label="Parent Phone" placeholder="+234..." value={studentForm.parentPhone} onChange={(value) => setStudentForm((current) => ({ ...current, parentPhone: value }))} />
                        <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: -2 }}>
                            Student sign-in uses Student ID plus parent phone or parent email.
                        </div>
                    </>
                ) : (
                    <>
                        <FormField label="First Name" required placeholder="Enter first name" value={staffForm.firstName} onChange={(value) => setStaffForm((current) => ({ ...current, firstName: value }))} />
                        <FormField label="Last Name" required placeholder="Enter last name" value={staffForm.lastName} onChange={(value) => setStaffForm((current) => ({ ...current, lastName: value }))} />
                        <FormField label="Email" type="email" placeholder="staff@example.com" value={staffForm.email} onChange={(value) => setStaffForm((current) => ({ ...current, email: value }))} />
                        <FormField label="Temporary Password" type="password" placeholder="Temporary login password" value={staffForm.password} onChange={(value) => setStaffForm((current) => ({ ...current, password: value }))} />
                        <div style={{ marginBottom: 16 }}>
                            <label className="input-label">Department / Subjects</label>
                            <select
                                className="input"
                                multiple
                                value={staffForm.department}
                                onChange={(event) => {
                                    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
                                    setStaffForm((current) => ({ ...current, department: values }));
                                }}
                                style={{ minHeight: 120 }}
                            >
                                {[...new Set(subjects.map((item) => item.name).filter(Boolean))].map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 6 }}>
                                Hold Ctrl/Cmd to select multiple subjects.
                            </div>
                        </div>
                        <FormField label="Staff Type" type="select" options={[{ value: 'academic', label: 'Academic' }, { value: 'non_academic', label: 'Non Academic' }]} value={staffForm.staffType} onChange={(value) => setStaffForm((current) => ({ ...current, staffType: value }))} />
                        <FormField label="Gender" type="select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} value={staffForm.gender} onChange={(value) => setStaffForm((current) => ({ ...current, gender: value }))} />
                        <FormField label="Date of Birth" type="date" value={staffForm.dateOfBirth} onChange={(value) => setStaffForm((current) => ({ ...current, dateOfBirth: value }))} />
                        <FormField label="Assign as Attendance Officer" type="checkbox" value={staffForm.canMarkStaffAttendance} onChange={(value) => setStaffForm((current) => ({ ...current, canMarkStaffAttendance: value }))} />
                    </>
                )}
            </Modal>

            <Modal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                title={`${selectedRecord?.firstName || ''} ${selectedRecord?.lastName || ''}`.trim() || 'Profile Details'}
                footer={<button className="btn btn-glass" onClick={() => setDetailOpen(false)}>Close</button>}
            >
                {selectedRecord && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><strong>Role:</strong> {selectedRecord.recordType}</div>
                        <div><strong>Status:</strong> {selectedRecord.status || '-'}</div>
                        <div><strong>Email:</strong> {usersById[selectedRecord.userId]?.email || '-'}</div>
                        <div><strong>Phone:</strong> {selectedRecord.phone || selectedRecord.parentPhone || '-'}</div>
                        <div><strong>Date of Birth:</strong> {selectedRecord.dateOfBirth || '-'}</div>
                        <div><strong>Class/Dept:</strong> {selectedRecord.className || selectedRecord.department || '-'}</div>
                        {selectedRecord.recordType === 'student' && <div><strong>Allergies:</strong> {selectedRecord.allergies || '-'}</div>}
                        {selectedRecord.recordType === 'student' && <div><strong>Parent Contact:</strong> {selectedRecord.parentEmail || selectedRecord.parentPhone || '-'}</div>}
                        {selectedRecord.recordType === 'staff' && <div><strong>Form Classes:</strong> {(selectedRecord.formTeacherClasses || []).length ? selectedRecord.formTeacherClasses.join(', ') : (selectedRecord.formTeacherClass || '-')}</div>}
                        {selectedRecord.recordType === 'staff' && <div><strong>Assigned Classes:</strong> {(selectedRecord.assignedClasses || []).length ? selectedRecord.assignedClasses.join(', ') : '-'}</div>}
                        {selectedRecord.recordType === 'staff' && <div><strong>Assigned Subjects:</strong> {(selectedRecord.assignedSubjects || []).length ? selectedRecord.assignedSubjects.join(', ') : '-'}</div>}
                    </div>
                )}
            </Modal>

            <Modal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                title="Edit Profile"
                footer={<><button className="btn btn-glass" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}
            >
                <FormField label="First Name" required value={editForm.firstName} onChange={(value) => setEditForm((current) => ({ ...current, firstName: value }))} />
                <FormField label="Last Name" required value={editForm.lastName} onChange={(value) => setEditForm((current) => ({ ...current, lastName: value }))} />
                <FormField label="Phone" value={editForm.phone} onChange={(value) => setEditForm((current) => ({ ...current, phone: value }))} />
                <FormField label="Date of Birth" type="date" value={editForm.dateOfBirth} onChange={(value) => setEditForm((current) => ({ ...current, dateOfBirth: value }))} />
                {selectedRecord?.recordType === 'student' && (
                    <FormField label="Allergies" type="textarea" rows={3} value={editForm.allergies} onChange={(value) => setEditForm((current) => ({ ...current, allergies: value }))} />
                )}
                {selectedRecord?.recordType === 'staff' && (
                    <>
                        <MultiSelectChips
                            label="Classes Handled"
                            value={editForm.assignedClasses}
                            options={classOptions}
                            onChange={(value) => setEditForm((current) => ({ ...current, assignedClasses: value }))}
                            placeholder="No classes available"
                            helperText="Select every class this teacher can handle."
                        />
                        <MultiSelectChips
                            label="Subjects Handled"
                            value={editForm.assignedSubjects}
                            options={[...new Set(subjects.map((item) => item.name).filter(Boolean))].sort().map((name) => ({ value: name, label: name }))}
                            onChange={(value) => setEditForm((current) => ({ ...current, assignedSubjects: value }))}
                            placeholder="No subjects available"
                            helperText="Only subjects already configured in Academics can be selected here."
                        />
                    </>
                )}
            </Modal>
        </div>
    );
}
