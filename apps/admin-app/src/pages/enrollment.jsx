import React, { useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import Modal from '../../../../shared/components/Modal.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const sampleStudents = [
    { id: 's1', admissionNumber: 'ADM/2025/001', firstName: 'Adebayo', lastName: 'Oluwaseun', className: 'JSS1', section: 'A', status: 'active' },
    { id: 's2', admissionNumber: 'ADM/2025/002', firstName: 'Chidinma', lastName: 'Okafor', className: 'JSS1', section: 'B', status: 'active' },
    { id: 's3', admissionNumber: 'ADM/2025/003', firstName: 'Musa', lastName: 'Ibrahim', className: 'SS1', section: 'A', status: 'active' },
    { id: 's4', admissionNumber: 'ADM/2024/045', firstName: 'Fatima', lastName: 'Abubakar', className: 'SS2', section: 'A', status: 'active' },
    { id: 's5', admissionNumber: 'ADM/2024/046', firstName: 'Oluwole', lastName: 'Adeyemi', className: 'SS3', section: 'B', status: 'active' },
];

const sampleStaff = [
    { id: 'st1', staffId: 'STF/001', firstName: 'Mrs. Ngozi', lastName: 'Okonkwo', department: 'English', status: 'active' },
    { id: 'st2', staffId: 'STF/002', firstName: 'Mr. Ahmed', lastName: 'Bello', department: 'Mathematics', status: 'active' },
    { id: 'st3', staffId: 'STF/003', firstName: 'Ms. Grace', lastName: 'Eze', department: 'Sciences', status: 'active' },
];

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
    const [tab, setTab] = useState('students');
    const [modalOpen, setModalOpen] = useState(false);

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
                <DataTable columns={studentCols} data={sampleStudents} />
            ) : (
                <DataTable columns={staffCols} data={sampleStaff} />
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'students' ? 'Enroll Student' : 'Add Staff'} footer={
                <><button className="btn btn-glass" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button className="btn btn-primary">Save</button></>
            }>
                <FormField label="First Name" required placeholder="Enter first name" />
                <FormField label="Last Name" required placeholder="Enter last name" />
                <FormField label="Email" type="email" placeholder="email@example.com" />
                {tab === 'students' ? (
                    <>
                        <FormField label="Class" type="select" options={[{ value: 'JSS1', label: 'JSS1' }, { value: 'JSS2', label: 'JSS2' }, { value: 'JSS3', label: 'JSS3' }, { value: 'SS1', label: 'SS1' }, { value: 'SS2', label: 'SS2' }, { value: 'SS3', label: 'SS3' }]} />
                        <FormField label="Section" type="select" options={[{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }]} />
                    </>
                ) : (
                    <FormField label="Department" type="select" options={[{ value: 'english', label: 'English' }, { value: 'mathematics', label: 'Mathematics' }, { value: 'sciences', label: 'Sciences' }, { value: 'arts', label: 'Arts' }]} />
                )}
            </Modal>
        </div>
    );
}
