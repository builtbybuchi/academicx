import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import Modal from '../../../../shared/components/Modal.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import { addStaff, enrollStudent, listClasses, listStaff, listStudents } from '../../../../shared/utils/api.js';

const studentCols = [
    { key: 'admissionNumber', label: 'Adm. No.' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'className', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : 'warning'}`}>{v}</span> },
];

const staffCols = [
    { key: 'staffId', label: 'Staff ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : 'warning'}`}>{v}</span> },
];

export default function Enrollment() {
    const { schoolId, profile } = useAuth();
    const toast = useToast();
    const [tab, setTab] = useState('students');
    const [modalOpen, setModalOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [classes, setClasses] = useState([]);
    const [saving, setSaving] = useState(false);
    const [studentForm, setStudentForm] = useState({ firstName: '', lastName: '', className: '', section: 'A', gender: '', parentName: '', parentEmail: '', parentPhone: '' });
    const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', password: '', department: '', staffType: 'academic', gender: '' });

    async function loadData() {
        if (!schoolId) return;
        const [studentRes, staffRes, classRes] = await Promise.all([
            listStudents(schoolId),
            listStaff(schoolId),
            listClasses(schoolId),
        ]);
        setStudents(studentRes.documents);
        setStaff(staffRes.documents);
        setClasses(classRes.documents);
    }

    useEffect(() => {
        loadData();
    }, [schoolId]);

    const classOptions = useMemo(() => {
        const dbClasses = classes.map((item) => item.name);
        const studentClasses = students.map((item) => item.className).filter(Boolean);
        return [...new Set([...dbClasses, ...studentClasses])].map((name) => ({ value: name, label: name }));
    }, [classes, students]);

    const handleSave = async () => {
        if (!schoolId || !profile?.schoolCode) return;

        try {
            setSaving(true);
            if (tab === 'students') {
                await enrollStudent({ schoolId, schoolCode: profile.schoolCode, ...studentForm });
                setStudentForm({ firstName: '', lastName: '', className: '', section: 'A', gender: '', parentName: '', parentEmail: '', parentPhone: '' });
                toast({ type: 'success', title: 'Student enrolled', message: 'Student record and login were created successfully.' });
            } else {
                await addStaff({ schoolId, schoolCode: profile.schoolCode, ...staffForm });
                setStaffForm({ firstName: '', lastName: '', email: '', password: '', department: '', staffType: 'academic', gender: '' });
                toast({ type: 'success', title: 'Staff added', message: 'Staff record and login were created successfully.' });
            }

            setModalOpen(false);
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Save failed', message: error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Enrollment</h1>
                    <p className="page-subtitle">Manage students and staff</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    + Add {tab === 'students' ? 'Student' : 'Staff'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`btn ${tab === 'students' ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setTab('students')}>Students</button>
                <button className={`btn ${tab === 'staff' ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setTab('staff')}>Staff</button>
            </div>

            {tab === 'students' ? (
                <DataTable columns={studentCols} data={students} />
            ) : (
                <DataTable columns={staffCols} data={staff} />
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'students' ? 'Enroll Student' : 'Add Staff'} footer={<><button className="btn btn-glass" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
                {tab === 'students' ? (
                    <>
                        <FormField label="First Name" required placeholder="Enter first name" value={studentForm.firstName} onChange={(value) => setStudentForm((current) => ({ ...current, firstName: value }))} />
                        <FormField label="Last Name" required placeholder="Enter last name" value={studentForm.lastName} onChange={(value) => setStudentForm((current) => ({ ...current, lastName: value }))} />
                        <FormField label="Class" type="select" options={classOptions} value={studentForm.className} onChange={(value) => setStudentForm((current) => ({ ...current, className: value }))} />
                        <FormField label="Section" type="select" options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }]} value={studentForm.section} onChange={(value) => setStudentForm((current) => ({ ...current, section: value }))} />
                        <FormField label="Gender" type="select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} value={studentForm.gender} onChange={(value) => setStudentForm((current) => ({ ...current, gender: value }))} />
                        <FormField label="Parent Name" placeholder="Parent or guardian name" value={studentForm.parentName} onChange={(value) => setStudentForm((current) => ({ ...current, parentName: value }))} />
                        <FormField label="Parent Email" type="email" placeholder="parent@example.com" value={studentForm.parentEmail} onChange={(value) => setStudentForm((current) => ({ ...current, parentEmail: value }))} />
                        <FormField label="Parent Phone" placeholder="+234..." value={studentForm.parentPhone} onChange={(value) => setStudentForm((current) => ({ ...current, parentPhone: value }))} />
                    </>
                ) : (
                    <>
                        <FormField label="First Name" required placeholder="Enter first name" value={staffForm.firstName} onChange={(value) => setStaffForm((current) => ({ ...current, firstName: value }))} />
                        <FormField label="Last Name" required placeholder="Enter last name" value={staffForm.lastName} onChange={(value) => setStaffForm((current) => ({ ...current, lastName: value }))} />
                        <FormField label="Email" type="email" placeholder="staff@example.com" value={staffForm.email} onChange={(value) => setStaffForm((current) => ({ ...current, email: value }))} />
                        <FormField label="Temporary Password" type="password" placeholder="Temporary login password" value={staffForm.password} onChange={(value) => setStaffForm((current) => ({ ...current, password: value }))} />
                        <FormField label="Department" placeholder="e.g. Mathematics" value={staffForm.department} onChange={(value) => setStaffForm((current) => ({ ...current, department: value }))} />
                        <FormField label="Staff Type" type="select" options={[{ value: 'academic', label: 'Academic' }, { value: 'non_academic', label: 'Non Academic' }]} value={staffForm.staffType} onChange={(value) => setStaffForm((current) => ({ ...current, staffType: value }))} />
                        <FormField label="Gender" type="select" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} value={staffForm.gender} onChange={(value) => setStaffForm((current) => ({ ...current, gender: value }))} />
                    </>
                )}
            </Modal>
        </div>
    );
}
