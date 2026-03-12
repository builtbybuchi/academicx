import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import Modal from '../../../../shared/components/Modal.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import { createSubject, listClasses, listStaff, listSubjects } from '../../../../shared/utils/api.js';

export default function Academics() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', className: '', staffId: '' });

    async function loadData() {
        if (!schoolId) return;
        const [subjectRes, classRes, staffRes] = await Promise.all([
            listSubjects(schoolId),
            listClasses(schoolId),
            listStaff(schoolId),
        ]);
        setSubjects(subjectRes.documents);
        setClasses(classRes.documents);
        setStaff(staffRes.documents);
    }

    useEffect(() => {
        loadData();
    }, [schoolId]);

    const teacherMap = useMemo(() => Object.fromEntries(staff.map((item) => [item.$id, `${item.firstName} ${item.lastName}`])), [staff]);
    const classNames = useMemo(() => [...new Set(classes.map((item) => item.name).filter(Boolean))], [classes]);
    const columns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Subject Name' },
        { key: 'className', label: 'Class' },
        { key: 'staffId', label: 'Assigned Teacher', render: (value) => teacherMap[value] || '-' },
    ];

    const handleSave = async () => {
        try {
            setSaving(true);
            await createSubject({ schoolId, ...form });
            setForm({ name: '', code: '', className: '', staffId: '' });
            setModalOpen(false);
            await loadData();
            toast({ type: 'success', title: 'Subject saved', message: 'The subject now uses live database data.' });
        } catch (error) {
            toast({ type: 'error', title: 'Save failed', message: error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Academics</h1><p className="page-subtitle">Manage sections, classes & subjects</p></div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Register Subject</button>
            </div>

            <div className="grid grid-3" style={{ marginBottom: 32 }}>
                {classNames.map(c => (
                    <LiquidGlassPanel key={c} style={{ padding: '16px 20px', cursor: 'pointer' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>{c}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                            {subjects.filter(s => s.className === c).length} subjects
                        </div>
                    </LiquidGlassPanel>
                ))}
            </div>

            <DataTable columns={columns} data={subjects} />

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Subject" footer={<><button className="btn btn-glass" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
                <FormField label="Subject Name" required placeholder="e.g. Mathematics" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
                <FormField label="Subject Code" required placeholder="e.g. MTH" value={form.code} onChange={(value) => setForm((current) => ({ ...current, code: value.toUpperCase() }))} />
                <FormField label="Class" type="select" required options={classNames.map(c => ({ value: c, label: c }))} value={form.className} onChange={(value) => setForm((current) => ({ ...current, className: value }))} />
                <FormField label="Assign Teacher" type="select" options={staff.map((item) => ({ value: item.$id, label: `${item.firstName} ${item.lastName}` }))} value={form.staffId} onChange={(value) => setForm((current) => ({ ...current, staffId: value }))} />
            </Modal>
        </div>
    );
}
