import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import Modal from '../../../../shared/components/Modal.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import {
    createAcademicSession,
    createSubject,
    listAcademicSessions,
    listClasses,
    listStaff,
    listSubjects,
    upsertClassNames,
    upsertSubjects,
    updateSubject,
    deleteSubject,
} from '../../../../shared/utils/api.js';

const TERM_LABELS = ['First Term', 'Second Term', 'Third Term', 'Fourth Term'];

const SCHOOL_CLASS_TEMPLATES = {
    primary: ['Prenursery', 'Nursery 1', 'Nursery 2', 'Nursery 3', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
    secondary: ['JSS1', 'JSS2', 'JSS3', 'UBE1', 'UBE2', 'UBE3', 'SS1', 'SS2', 'SS3', 'SS4', 'SS5', 'SS6'],
    combined: [
        'Prenursery', 'Nursery 1', 'Nursery 2', 'Nursery 3',
        'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
        'JSS1', 'JSS2', 'JSS3', 'UBE1', 'UBE2', 'UBE3', 'SS1', 'SS2', 'SS3', 'SS4', 'SS5', 'SS6',
    ],
};

const defaultCombinations = [
    { name: 'Science', classPrefix: 'SS', subjects: 'Mathematics, English Language, Physics, Chemistry, Biology, Further Mathematics' },
    { name: 'Arts', classPrefix: 'SS', subjects: 'Mathematics, English Language, Literature in English, Government, CRS, Civic Education' },
    { name: 'Social Science', classPrefix: 'SS', subjects: 'Mathematics, English Language, Economics, Commerce, Government, Civic Education' },
];

function normalizeSession(value) {
    return String(value || '').trim();
}

function parseList(value) {
    return String(value || '')
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function makeSubjectCode(name) {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const code = words.map((item) => item.slice(0, 1).toUpperCase()).join('');
    return code.slice(0, 10);
}

export default function Academics() {
    const { schoolId } = useAuth();
    const toast = useToast();

    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);

    const [sessionForm, setSessionForm] = useState({
        session: '',
        termsCount: '3',
        schoolType: 'combined',
        clonePrevious: true,
    });

    const [classSetup, setClassSetup] = useState({
        baseClasses: SCHOOL_CLASS_TEMPLATES.combined.join(', '),
        streams: 'A, B, C',
    });

    const [combinationRows, setCombinationRows] = useState(defaultCombinations);
    const [comboClassTargets, setComboClassTargets] = useState('SS1, SS2, SS3, SS4, SS5, SS6');

    const [subjectForm, setSubjectForm] = useState({ name: '', code: '', className: '', staffId: '' });
    const [savingSession, setSavingSession] = useState(false);
    const [savingClasses, setSavingClasses] = useState(false);
    const [savingCombos, setSavingCombos] = useState(false);
    const [savingSubject, setSavingSubject] = useState(false);

    // Edit/Delete Modal States
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', code: '', className: '', staffId: '' });
    const [processingAction, setProcessingAction] = useState(false);

    async function loadData() {
        if (!schoolId) return;
        const [sessionRes, classRes, subjectRes, staffRes] = await Promise.all([
            listAcademicSessions(schoolId),
            listClasses(schoolId),
            listSubjects(schoolId),
            listStaff(schoolId),
        ]);
        setSessions(sessionRes.documents || []);
        setClasses(classRes.documents || []);
        setSubjects(subjectRes.documents || []);
        setStaff(staffRes.documents || []);
    }

    useEffect(() => {
        loadData();
    }, [schoolId]);

    useEffect(() => {
        setClassSetup((current) => ({
            ...current,
            baseClasses: SCHOOL_CLASS_TEMPLATES[sessionForm.schoolType].join(', '),
        }));
    }, [sessionForm.schoolType]);

    const sessionGroups = useMemo(() => {
        const map = new Map();
        for (const item of sessions) {
            const key = item.session;
            const existing = map.get(key) || { session: key, terms: [] };
            existing.terms.push(item.term);
            map.set(key, existing);
        }
        return Array.from(map.values())
            .map((item) => ({ ...item, terms: [...new Set(item.terms)] }))
            .sort((a, b) => b.session.localeCompare(a.session));
    }, [sessions]);

    const classNames = useMemo(() => [...new Set(classes.map((item) => item.name).filter(Boolean))], [classes]);

    const subjectColumns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Subject Name' },
        { key: 'className', label: 'Class' },
        {
            key: 'staffId',
            label: 'Assigned Teacher',
            render: (value) => {
                const teacher = staff.find((item) => item.$id === value);
                return teacher ? `${teacher.firstName} ${teacher.lastName}` : '-';
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="btn btn-glass btn-sm"
                        onClick={() => handleEditClick(row)}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(row)}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            ),
        },
    ];

    async function handleCreateSession() {
        const value = normalizeSession(sessionForm.session);
        if (!/^\d{4}\/\d{4}$/.test(value)) {
            toast({ type: 'error', title: 'Invalid session format', message: 'Use format like 2025/2026.' });
            return;
        }

        const termCount = Math.max(1, Math.min(4, Number(sessionForm.termsCount || 3)));
        const terms = TERM_LABELS.slice(0, termCount);

        setSavingSession(true);
        try {
            const existing = new Set(sessions.map((item) => `${item.session}::${item.term}`));
            let created = 0;
            for (const term of terms) {
                const key = `${value}::${term}`;
                if (existing.has(key)) continue;
                await createAcademicSession({
                    schoolId,
                    session: value,
                    term,
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    resultPublished: false,
                });
                created += 1;
            }

            if (sessionForm.clonePrevious) {
                const existingClassesText = classNames.join(', ');
                if (existingClassesText) {
                    setClassSetup((current) => ({ ...current, baseClasses: existingClassesText }));
                }
            }

            toast({
                type: 'success',
                title: 'Academic session saved',
                message: created > 0
                    ? `${created} term record(s) created for ${value}.`
                    : `${value} terms already exist, defaults loaded for editing.`,
            });
            setSessionForm((current) => ({ ...current, session: '' }));
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Session save failed', message: error.message });
        } finally {
            setSavingSession(false);
        }
    }

    async function handleCreateClasses() {
        const bases = parseList(classSetup.baseClasses);
        const streams = parseList(classSetup.streams).map((item) => item.toUpperCase());

        if (bases.length === 0) {
            toast({ type: 'error', title: 'No classes provided', message: 'Add at least one base class.' });
            return;
        }

        const outputNames = [];
        for (const base of bases) {
            if (streams.length === 0) {
                outputNames.push(base);
                continue;
            }
            for (const stream of streams) {
                outputNames.push(`${base}${stream}`);
            }
        }

        setSavingClasses(true);
        try {
            const result = await upsertClassNames(schoolId, outputNames);
            toast({
                type: 'success',
                title: 'Class setup saved',
                message: `${result.created.length} new class arm(s) created, ${outputNames.length - result.created.length} already existed.`,
            });
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Class setup failed', message: error.message });
        } finally {
            setSavingClasses(false);
        }
    }

    async function handleApplyCombinations() {
        const targets = parseList(comboClassTargets);
        if (targets.length === 0) {
            toast({ type: 'error', title: 'No target classes', message: 'Specify target classes for subject combinations.' });
            return;
        }

        const resolvedClasses = classNames.filter((name) => targets.some((target) => name.startsWith(target)));
        if (resolvedClasses.length === 0) {
            toast({ type: 'error', title: 'No class match', message: 'Create matching classes first, e.g. SS1A/SS1B.' });
            return;
        }

        const subjectRows = [];
        for (const row of combinationRows) {
            const subjectsForTrack = parseList(row.subjects);
            const allowedClasses = resolvedClasses.filter((name) => name.startsWith(row.classPrefix || ''));
            for (const className of allowedClasses) {
                for (const subjectName of subjectsForTrack) {
                    subjectRows.push({
                        className,
                        name: subjectName,
                        code: makeSubjectCode(subjectName),
                        staffId: '',
                    });
                }
            }
        }

        setSavingCombos(true);
        try {
            const result = await upsertSubjects(schoolId, subjectRows);
            toast({
                type: 'success',
                title: 'Subject combinations applied',
                message: `${result.created.length} subject record(s) created across ${resolvedClasses.length} class arm(s).`,
            });
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Combination setup failed', message: error.message });
        } finally {
            setSavingCombos(false);
        }
    }

    async function handleCreateSubject() {
        if (!subjectForm.name || !subjectForm.code || !subjectForm.className) {
            toast({ type: 'error', title: 'Missing subject fields', message: 'Name, code, and class are required.' });
            return;
        }

        setSavingSubject(true);
        try {
            await createSubject({ schoolId, ...subjectForm, code: subjectForm.code.toUpperCase() });
            toast({ type: 'success', title: 'Subject created', message: 'Subject added successfully.' });
            setSubjectForm({ name: '', code: '', className: '', staffId: '' });
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Subject save failed', message: error.message });
        } finally {
            setSavingSubject(false);
        }
    }

    function handleEditClick(subject) {
        setSelectedSubject(subject);
        setEditForm({
            name: subject.name,
            code: subject.code,
            className: subject.className,
            staffId: subject.staffId || ''
        });
        setEditModalOpen(true);
    }

    function handleDeleteClick(subject) {
        setSelectedSubject(subject);
        setDeleteModalOpen(true);
    }

    async function handleSaveEdit() {
        if (!editForm.name || !editForm.code || !editForm.className) {
            toast({ type: 'error', title: 'Missing fields', message: 'Name, code, and class are required.' });
            return;
        }

        setProcessingAction(true);
        try {
            await updateSubject(selectedSubject.$id, {
                name: editForm.name,
                code: editForm.code.toUpperCase(),
                className: editForm.className,
                staffId: editForm.staffId || ''
            });
            toast({ type: 'success', title: 'Subject updated', message: 'Subject updated successfully.' });
            setEditModalOpen(false);
            setSelectedSubject(null);
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Update failed', message: error.message });
        } finally {
            setProcessingAction(false);
        }
    }

    async function handleConfirmDelete() {
        if (!selectedSubject) return;

        setProcessingAction(true);
        try {
            await deleteSubject(selectedSubject.$id);
            toast({ type: 'success', title: 'Subject deleted', message: 'Subject deleted successfully.' });
            setDeleteModalOpen(false);
            setSelectedSubject(null);
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Delete failed', message: error.message });
        } finally {
            setProcessingAction(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Academics Setup</h1>
                <p className="page-subtitle">Create sessions, terms, class arms, and subject combinations with reusable defaults.</p>
            </div>

            <div className="grid grid-3" style={{ marginBottom: 24 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>Academic Sessions</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-gray-900)' }}>{sessionGroups.length}</div>
                </LiquidGlassPanel>
                <LiquidGlassPanel hover={false} style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>Class Arms</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-gray-900)' }}>{classNames.length}</div>
                </LiquidGlassPanel>
                <LiquidGlassPanel hover={false} style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>Subjects</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-gray-900)' }}>{subjects.length}</div>
                </LiquidGlassPanel>
            </div>

            <div className="grid grid-2" style={{ gap: 20, marginBottom: 24 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>1) Academic Session Setup</h3>
                    <FormField
                        label="Session"
                        required
                        placeholder="2025/2026"
                        value={sessionForm.session}
                        onChange={(value) => setSessionForm((current) => ({ ...current, session: value }))}
                    />
                    <FormField
                        label="Number of terms"
                        type="select"
                        options={[
                            { value: '2', label: '2 Terms' },
                            { value: '3', label: '3 Terms (Trimester)' },
                            { value: '4', label: '4 Terms' },
                        ]}
                        value={sessionForm.termsCount}
                        onChange={(value) => setSessionForm((current) => ({ ...current, termsCount: value }))}
                    />
                    <FormField
                        label="School Type"
                        type="select"
                        options={[
                            { value: 'primary', label: 'Primary School' },
                            { value: 'secondary', label: 'Secondary School' },
                            { value: 'combined', label: 'Combined (Primary + Secondary)' },
                        ]}
                        value={sessionForm.schoolType}
                        onChange={(value) => setSessionForm((current) => ({ ...current, schoolType: value }))}
                    />
                    <FormField
                        label="Use previous setup as default"
                        type="checkbox"
                        value={sessionForm.clonePrevious}
                        onChange={(value) => setSessionForm((current) => ({ ...current, clonePrevious: value }))}
                    />
                    <button className="btn btn-primary" onClick={handleCreateSession} disabled={savingSession}>
                        {savingSession ? 'Saving...' : 'Create Session'}
                    </button>
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Existing Sessions</h3>
                    <div style={{ display: 'grid', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                        {sessionGroups.map((item) => (
                            <div key={item.session} style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.65)' }}>
                                <div style={{ fontWeight: 700 }}>{item.session}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>{item.terms.join(', ')}</div>
                            </div>
                        ))}
                        {sessionGroups.length === 0 && (
                            <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>No sessions created yet.</div>
                        )}
                    </div>
                </LiquidGlassPanel>
            </div>

            <div className="grid grid-2" style={{ gap: 20, marginBottom: 24 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>2) Class + Category (Arm) Setup</h3>
                    <FormField
                        label="Base Classes"
                        type="textarea"
                        rows={6}
                        value={classSetup.baseClasses}
                        onChange={(value) => setClassSetup((current) => ({ ...current, baseClasses: value }))}
                        placeholder="JSS1, JSS2, SS1"
                    />
                    <FormField
                        label="Class Arms / Categories"
                        value={classSetup.streams}
                        onChange={(value) => setClassSetup((current) => ({ ...current, streams: value }))}
                        placeholder="A, B, C"
                    />
                    <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 12 }}>
                        Example output: JSS1A, JSS1B, JSS1C.
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateClasses} disabled={savingClasses}>
                        {savingClasses ? 'Saving...' : 'Generate / Update Class Arms'}
                    </button>
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 20 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>3) Subject Combination Templates</h3>
                    <FormField
                        label="Target Class Prefixes"
                        value={comboClassTargets}
                        onChange={setComboClassTargets}
                        placeholder="SS1, SS2, SS3"
                    />
                    {combinationRows.map((row, index) => (
                        <div key={row.name} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 10, marginBottom: 10 }}>
                            <FormField
                                label={`${row.name} - Class Prefix`}
                                value={row.classPrefix}
                                onChange={(value) => setCombinationRows((current) => current.map((item, idx) => idx === index ? { ...item, classPrefix: value } : item))}
                                placeholder="SS"
                            />
                            <FormField
                                label={`${row.name} Subjects`}
                                type="textarea"
                                rows={3}
                                value={row.subjects}
                                onChange={(value) => setCombinationRows((current) => current.map((item, idx) => idx === index ? { ...item, subjects: value } : item))}
                                placeholder="Mathematics, English Language, Physics"
                            />
                        </div>
                    ))}
                    <button className="btn btn-primary" onClick={handleApplyCombinations} disabled={savingCombos}>
                        {savingCombos ? 'Applying...' : 'Apply Subject Combinations'}
                    </button>
                </LiquidGlassPanel>
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 20, marginBottom: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Single Subject (Manual)</h3>
                <div className="grid grid-2" style={{ gap: 12 }}>
                    <FormField label="Subject Name" value={subjectForm.name} onChange={(value) => setSubjectForm((current) => ({ ...current, name: value }))} placeholder="Mathematics" />
                    <FormField label="Subject Code" value={subjectForm.code} onChange={(value) => setSubjectForm((current) => ({ ...current, code: value.toUpperCase() }))} placeholder="MTH" />
                    <FormField label="Class" type="select" options={classNames.map((item) => ({ value: item, label: item }))} value={subjectForm.className} onChange={(value) => setSubjectForm((current) => ({ ...current, className: value }))} />
                    <FormField label="Teacher" type="select" options={staff.map((item) => ({ value: item.$id, label: `${item.firstName} ${item.lastName}` }))} value={subjectForm.staffId} onChange={(value) => setSubjectForm((current) => ({ ...current, staffId: value }))} />
                </div>
                <button className="btn btn-primary" onClick={handleCreateSubject} disabled={savingSubject}>
                    {savingSubject ? 'Saving...' : 'Create Subject'}
                </button>
            </LiquidGlassPanel>

            <DataTable columns={subjectColumns} data={subjects} />

            {/* Edit Subject Modal */}
            <Modal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Subject"
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-glass btn-sm"
                            onClick={() => setEditModalOpen(false)}
                            disabled={processingAction}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveEdit}
                            disabled={processingAction}
                        >
                            {processingAction ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FormField
                        label="Subject Name"
                        value={editForm.name}
                        onChange={(value) => setEditForm((prev) => ({ ...prev, name: value }))}
                        placeholder="Mathematics"
                        required
                    />
                    <FormField
                        label="Subject Code"
                        value={editForm.code}
                        onChange={(value) => setEditForm((prev) => ({ ...prev, code: value.toUpperCase() }))}
                        placeholder="MTH"
                        required
                    />
                    <FormField
                        label="Class"
                        type="select"
                        options={classNames.map((item) => ({ value: item, label: item }))}
                        value={editForm.className}
                        onChange={(value) => setEditForm((prev) => ({ ...prev, className: value }))}
                        required
                    />
                    <FormField
                        label="Teacher"
                        type="select"
                        options={staff.map((item) => ({ value: item.$id, label: `${item.firstName} ${item.lastName}` }))}
                        value={editForm.staffId}
                        onChange={(value) => setEditForm((prev) => ({ ...prev, staffId: value }))}
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Subject"
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-glass btn-sm"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={processingAction}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={handleConfirmDelete}
                            disabled={processingAction}
                        >
                            {processingAction ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                }
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>
                        Are you sure you want to delete this subject?
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>
                        <strong>{selectedSubject?.name}</strong> ({selectedSubject?.code}) for {selectedSubject?.className}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 16 }}>
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
