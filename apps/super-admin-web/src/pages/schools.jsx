import React, { useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import Modal from '../../../../shared/components/Modal.jsx';
import FormField from '../../../../shared/components/FormField.jsx';

const schools = [
    { id: 'sc1', name: 'Greenfield Academy', location: 'Lagos', students: 1247, staff: 58, plan: 'Enterprise', status: 'active' },
    { id: 'sc2', name: 'Royal Hills College', location: 'Abuja', students: 890, staff: 42, plan: 'Professional', status: 'active' },
    { id: 'sc3', name: 'Bright Future School', location: 'Port Harcourt', students: 654, staff: 31, plan: 'Professional', status: 'active' },
    { id: 'sc4', name: 'Victory Academy', location: 'Kano', students: 432, staff: 22, plan: 'Starter', status: 'active' },
    { id: 'sc5', name: 'Harmony International', location: 'Lagos', students: 0, staff: 0, plan: 'Starter', status: 'pending' },
];

const columns = [
    { key: 'name', label: 'School Name' },
    { key: 'location', label: 'Location' },
    { key: 'students', label: 'Students' },
    { key: 'staff', label: 'Staff' },
    { key: 'plan', label: 'Plan', render: (v) => <span className="badge badge-primary">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v === 'active' ? 'success' : 'warning'}`}>{v}</span> },
];

export default function Schools() {
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Schools</h1><p className="page-subtitle">Manage all registered schools</p></div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add School</button>
            </div>
            <DataTable columns={columns} data={schools} />
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register New School" footer={
                <><button className="btn btn-glass" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary">Create School</button></>
            }>
                <FormField label="School Name" required placeholder="e.g. Greenfield Academy" />
                <FormField label="Location" required placeholder="City, State" />
                <FormField label="Admin Email" type="email" required placeholder="admin@school.com" />
                <FormField label="Phone" placeholder="+234..." />
                <FormField label="Subscription Plan" type="select" options={[{ value: 'starter', label: 'Starter' }, { value: 'professional', label: 'Professional' }, { value: 'enterprise', label: 'Enterprise' }]} />
            </Modal>
        </div>
    );
}
