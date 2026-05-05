import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'shared/components/DataTable.jsx';
import Modal from 'shared/components/Modal.jsx';
import FormField from 'shared/components/FormField.jsx';
import { createSchoolAdmin, getSuperAdminPortalData, registerSchool, updateSchool } from 'shared/utils/api.js';

const baseColumns = [
    { key: 'name', label: 'School Name' },
    { key: 'location', label: 'Location' },
    { key: 'students', label: 'Students' },
    { key: 'staff', label: 'Staff' },
    { key: 'plan', label: 'Plan', render: (v) => <span className="badge badge-primary">{v}</span> },
    { key: 'onlineFees', label: 'Online Fees', render: (v) => <span className={`badge badge-${v ? 'success' : 'danger'}`}>{v ? 'Enabled' : 'Disabled'}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : 'warning'}`}>{v}</span> },
];

export default function Schools() {
    const [modalOpen, setModalOpen] = useState(false);
    const [adminModalOpen, setAdminModalOpen] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [loading, setLoading] = useState(false);
    const [schools, setSchools] = useState([]);
    const [users, setUsers] = useState([]);
    const [schoolForm, setSchoolForm] = useState({ schoolName: '', location: '', adminEmail: '', password: '', schoolCode: '', phone: '', plan: 'school_pays' });
    const [adminForm, setAdminForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });

    async function load() {
        setLoading(true);
        try {
            const response = await getSuperAdminPortalData();
            setSchools(response.schools || []);
            setUsers(response.users || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const tableRows = useMemo(() => {
        return schools.map((school) => {
            const schoolUsers = users.filter((item) => item.schoolId === school.$id);
            const schoolData = typeof school.data === 'string' ? JSON.parse(school.data || '{}') : (school.data || {});
            return {
                id: school.$id,
                name: school.name,
                location: school.address || '-',
                students: schoolUsers.filter((item) => item.role === 'student').length,
                staff: schoolUsers.filter((item) => item.role === 'staff').length,
                plan: school.paymentModel,
                onlineFees: schoolData.onlineFeesEnabled !== false,
                status: school.status,
            };
        });
    }, [schools, users]);

    const columns = useMemo(() => ([
        ...baseColumns,
        {
            key: 'id',
            label: 'Actions',
            render: (id, row) => (
                <div className="flex gap-2">
                    <button
                        className="btn btn-sm btn-glass"
                        onClick={() => {
                            setSelectedSchoolId(row.id);
                            setAdminModalOpen(true);
                        }}
                    >
                        Add Admin
                    </button>
                    <button
                        className={`btn btn-sm ${row.onlineFees ? 'btn-danger' : 'btn-success'}`}
                        onClick={async () => {
                            const school = schools.find(s => s.$id === row.id);
                            const currentData = typeof school.data === 'string' ? JSON.parse(school.data || '{}') : (school.data || {});
                            const nextData = { ...currentData, onlineFeesEnabled: !row.onlineFees };
                            await updateSchool(row.id, { data: JSON.stringify(nextData) });
                            await load();
                        }}
                    >
                        {row.onlineFees ? 'Disable Fees' : 'Enable Fees'}
                    </button>
                </div>
            ),
        },
    ]), [schools]);

    async function handleCreateSchool() {
        await registerSchool({
            schoolName: schoolForm.schoolName,
            schoolCode: schoolForm.schoolCode,
            address: schoolForm.location,
            adminEmail: schoolForm.adminEmail,
            adminPassword: schoolForm.password,
            firstName: 'School',
            lastName: 'Admin',
            phone: schoolForm.phone,
            paymentModel: schoolForm.plan,
        });
        setModalOpen(false);
        setSchoolForm({ schoolName: '', location: '', adminEmail: '', password: '', schoolCode: '', phone: '', plan: 'school_pays' });
        await load();
    }

    async function handleCreateAdmin() {
        await createSchoolAdmin({
            schoolId: selectedSchoolId,
            firstName: adminForm.firstName,
            lastName: adminForm.lastName,
            email: adminForm.email,
            password: adminForm.password,
            phone: adminForm.phone,
        });
        setAdminModalOpen(false);
        setAdminForm({ firstName: '', lastName: '', email: '', password: '', phone: '' });
        await load();
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Schools</h1><p className="page-subtitle">Manage all registered schools</p></div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add School</button>
            </div>
            <DataTable columns={columns} data={tableRows} loading={loading} />
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register New School" footer={
                <><button className="btn btn-glass" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreateSchool}>Create School</button></>
            }>
                <FormField label="School Name" required placeholder="e.g. Greenfield Academy" value={schoolForm.schoolName} onChange={(value) => setSchoolForm((current) => ({ ...current, schoolName: value }))} />
                <FormField label="School Code" required placeholder="e.g. GFA" value={schoolForm.schoolCode} onChange={(value) => setSchoolForm((current) => ({ ...current, schoolCode: value.toUpperCase() }))} />
                <FormField label="Location" required placeholder="City, State" value={schoolForm.location} onChange={(value) => setSchoolForm((current) => ({ ...current, location: value }))} />
                <FormField label="Admin Email" type="email" required placeholder="admin@school.com" value={schoolForm.adminEmail} onChange={(value) => setSchoolForm((current) => ({ ...current, adminEmail: value }))} />
                <FormField label="Admin Password" type="password" required placeholder="Temporary password" value={schoolForm.password} onChange={(value) => setSchoolForm((current) => ({ ...current, password: value }))} />
                <FormField label="Phone" placeholder="+234..." value={schoolForm.phone} onChange={(value) => setSchoolForm((current) => ({ ...current, phone: value }))} />
                <FormField label="Payment Model" type="select" value={schoolForm.plan} onChange={(value) => setSchoolForm((current) => ({ ...current, plan: value }))} options={[{ value: 'school_pays', label: 'School Pays' }, { value: 'student_pays', label: 'Student Pays' }]} />
            </Modal>

            <Modal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} title="Create School Admin" footer={
                <><button className="btn btn-glass" onClick={() => setAdminModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreateAdmin}>Create Admin</button></>
            }>
                <FormField label="First Name" required value={adminForm.firstName} onChange={(value) => setAdminForm((current) => ({ ...current, firstName: value }))} />
                <FormField label="Last Name" required value={adminForm.lastName} onChange={(value) => setAdminForm((current) => ({ ...current, lastName: value }))} />
                <FormField label="Email" type="email" required value={adminForm.email} onChange={(value) => setAdminForm((current) => ({ ...current, email: value }))} />
                <FormField label="Password" type="password" required value={adminForm.password} onChange={(value) => setAdminForm((current) => ({ ...current, password: value }))} />
                <FormField label="Phone" value={adminForm.phone} onChange={(value) => setAdminForm((current) => ({ ...current, phone: value }))} />
            </Modal>
        </div>
    );
}
