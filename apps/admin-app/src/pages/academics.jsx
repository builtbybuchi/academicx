import React, { useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import Modal from '../../../../shared/components/Modal.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const sampleSubjects = [
    { id: 'sb1', name: 'Mathematics', code: 'MTH', className: 'SS1', teacher: 'Mr. Ahmed Bello' },
    { id: 'sb2', name: 'English Language', code: 'ENG', className: 'SS1', teacher: 'Mrs. Ngozi Okonkwo' },
    { id: 'sb3', name: 'Physics', code: 'PHY', className: 'SS2', teacher: 'Mr. Chidi Nwankwo' },
    { id: 'sb4', name: 'Biology', code: 'BIO', className: 'SS2', teacher: 'Ms. Grace Eze' },
    { id: 'sb5', name: 'Chemistry', code: 'CHM', className: 'SS1', teacher: 'Dr. Yusuf Maina' },
];

const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Subject Name' },
    { key: 'className', label: 'Class' },
    { key: 'teacher', label: 'Assigned Teacher' },
];

const classes = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

export default function Academics() {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Academics</h1><p className="page-subtitle">Manage sections, classes & subjects</p></div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Register Subject</button>
            </div>

            <div className="grid grid-3" style={{ marginBottom: 32 }}>
                {classes.map(c => (
                    <LiquidGlassPanel key={c} style={{ padding: '16px 20px', cursor: 'pointer' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{c}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                            {sampleSubjects.filter(s => s.className === c).length} subjects
                        </div>
                    </LiquidGlassPanel>
                ))}
            </div>

            <DataTable columns={columns} data={sampleSubjects} />

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Subject" footer={
                <><button className="btn btn-glass" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary">Save</button></>
            }>
                <FormField label="Subject Name" required placeholder="e.g. Mathematics" />
                <FormField label="Subject Code" required placeholder="e.g. MTH" />
                <FormField label="Class" type="select" required options={classes.map(c => ({ value: c, label: c }))} />
                <FormField label="Assign Teacher" type="select" options={[{ value: 'st1', label: 'Mr. Ahmed Bello' }, { value: 'st2', label: 'Mrs. Ngozi Okonkwo' }, { value: 'st3', label: 'Ms. Grace Eze' }]} />
            </Modal>
        </div>
    );
}
