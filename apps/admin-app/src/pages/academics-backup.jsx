import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X, Edit2, Trash2, BookOpen, Calendar, Users, ChevronRight, Check } from 'lucide-react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import FormField from 'shared/components/FormField.jsx';
import Modal from 'shared/components/Modal.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import { useAuth } from 'shared/utils/auth.jsx';
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
} from 'shared/utils/api.js';

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
    { name: 'Science', classPrefix: 'SS', subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics'] },
    { name: 'Arts', classPrefix: 'SS', subjects: ['Mathematics', 'English Language', 'Literature in English', 'Government', 'CRS', 'Civic Education'] },
    { name: 'Social Science', classPrefix: 'SS', subjects: ['Mathematics', 'English Language', 'Economics', 'Commerce', 'Government', 'Civic Education'] },
];

function normalizeSession(value) {
    return String(value || '').trim();
}

function makeSubjectCode(name) {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const code = words.map((item) => item.slice(0, 1).toUpperCase()).join('');
    return code.slice(0, 10);
}

// Chip Input Component
function ChipInput({ value, onChange, placeholder, chips = [] }) {
    const [inputValue, setInputValue] = useState('');
    const [currentChips, setCurrentChips] = useState(chips || []);

    useEffect(() => {
        setCurrentChips(chips || []);
    }, [chips]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newChip = inputValue.trim();
            if (!currentChips.includes(newChip)) {
                const updatedChips = [...currentChips, newChip];
                setCurrentChips(updatedChips);
                onChange(updatedChips);
            }
            setInputValue('');
        }
    };

    const removeChip = (chipToRemove) => {
        const updatedChips = currentChips.filter(chip => chip !== chipToRemove);
        setCurrentChips(updatedChips);
        onChange(updatedChips);
    };

    return (
        <div style={{
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            padding: 8,
            minHeight: 44,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.8)'
        }}>
            {currentChips.map((chip, index) => (
                <span key={index} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-primary-700)',
                    borderRadius: 16,
                    fontSize: 13,
                    fontWeight: 500
                }}>
                    {chip}
                    <button
                        onClick={() => removeChip(chip)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={14} />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentChips.length === 0 ? placeholder : ''}
                style={{
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    minWidth: 120,
                    fontSize: 14,
                    background: 'transparent'
                }}
            />
        </div>
    );
}

export default function Academics() {
    const { schoolId } = useAuth();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');

    // Session Form
    const [sessionForm, setSessionForm] = useState({
        session: '',
        termsCount: '3',
        schoolType: 'combined',
        isDefault: false,
    });

    // Classes Form
    const [baseClasses, setBaseClasses] = useState([]);
    const [classArms, setClassArms] = useState(['A', 'B', 'C']);
    const [generatedClasses, setGeneratedClasses] = useState([]);

    // Subjects Form
    const [subjectView, setSubjectView] = useState('bulk');
    const [subjectForm, setSubjectForm] = useState({ name: '', code: '', className: '', staffId: '' });
    const [combinationRows, setCombinationRows] = useState(defaultCombinations);
    const [comboClassTargets, setComboClassTargets] = useState(['SS1', 'SS2', 'SS3']);

    // Loading states
    const [savingSession, setSavingSession] = useState(false);
    const [savingClasses, setSavingClasses] = useState(false);
    const [savingCombos, setSavingCombos] = useState(false);
    const [savingSubject, setSavingSubject] = useState(false);

    // Modal states
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
        setBaseClasses(SCHOOL_CLASS_TEMPLATES[sessionForm.schoolType] || []);
    }, [sessionForm.schoolType]);

    // Generate class combinations
    useEffect(() => {
        const combinations = [];
        for (const baseClass of baseClasses) {
            if (classArms.length === 0) {
                combinations.push(baseClass);
            } else {
                for (const arm of classArms) {
                    combinations.push(`${baseClass}${arm}`);
                }
            }
        }
        setGeneratedClasses(combinations);
    }, [baseClasses, classArms]);

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

    const filteredSubjects = useMemo(() => {
        let filtered = subjects;
        if (searchTerm) {
            filtered = filtered.filter(subject => 
                subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterClass) {
            filtered = filtered.filter(subject => subject.className === filterClass);
        }
        return filtered;
    }, [subjects, searchTerm, filterClass]);

    const kpiData = [
        { label: 'Academic Sessions', value: sessionGroups.length, icon: Calendar, color: '#3B82F6' },
        { label: 'Class Arms', value: classNames.length, icon: Users, color: '#10B981' },
        { label: 'Subjects', value: subjects.length, icon: BookOpen, color: '#F59E0B' },
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
                    isCurrent: sessionForm.isDefault,
                    resultPublished: false,
                });
                created += 1;
            }

            toast({
                type: 'success',
                title: 'Academic session saved',
                message: created > 0
                    ? `${created} term record(s) created for ${value}.`
                    : `${value} terms already exist.`,
            });
            setSessionForm({ session: '', termsCount: '3', schoolType: 'combined', isDefault: false });
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Session save failed', message: error.message });
        } finally {
            setSavingSession(false);
        }
    }

    async function handleCreateClasses() {
        if (generatedClasses.length === 0) {
            toast({ type: 'error', title: 'No classes generated', message: 'Add base classes and arms to generate combinations.' });
            return;
        }

        setSavingClasses(true);
        try {
            const result = await upsertClassNames(schoolId, generatedClasses);
            toast({
                type: 'success',
                title: 'Class setup saved',
                message: `${result.created.length} new class arm(s) created, ${generatedClasses.length - result.created.length} already existed.`,
            });
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Class setup failed', message: error.message });
        } finally {
            setSavingClasses(false);
        }
    }

    async function handleApplyCombinations() {
        const resolvedClasses = classNames.filter((name) => 
            comboClassTargets.some((target) => name.startsWith(target))
        );
        if (resolvedClasses.length === 0) {
            toast({ type: 'error', title: 'No class match', message: 'Create matching classes first.' });
            return;
        }

        const subjectRows = [];
        for (const row of combinationRows) {
            const allowedClasses = resolvedClasses.filter((name) => name.startsWith(row.classPrefix || ''));
            for (const className of allowedClasses) {
                for (const subjectName of row.subjects) {
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
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#1F2937' }}>
                    Academics Setup
                </h1>
                <p style={{ fontSize: '16px', color: '#6B7280', margin: '8px 0 0 0' }}>
                    Manage sessions, terms, classes, and subjects.
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px', 
                marginBottom: '32px' 
            }}>
                {kpiData.map((kpi, index) => (
                    <LiquidGlassPanel key={index} hover={false} style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                                    {kpi.label}
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#1F2937' }}>
                                    {kpi.value}
                                </div>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: `${kpi.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <kpi.icon size={24} color={kpi.color} />
                            </div>
                        </div>
                    </LiquidGlassPanel>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '24px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '0'
            }}>
                {[
                    { id: 'sessions', label: 'Sessions & Terms' },
                    { id: 'classes', label: 'Classes & Arms' },
                    { id: 'subjects', label: 'Subjects & Mappings' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            background: activeTab === tab.id ? '#3B82F6' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#6B7280',
                            borderRadius: '8px 8px 0 0',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ minHeight: '500px' }}>
                {/* Tab 1: Sessions & Terms */}
                {activeTab === 'sessions' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Create Session Form */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Create Academic Session
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <FormField
                                    label="Session Name"
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
                                    label="Set as default/active session"
                                    type="checkbox"
                                    value={sessionForm.isDefault}
                                    onChange={(value) => setSessionForm((current) => ({ ...current, isDefault: value }))}
                                />
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleCreateSession} 
                                    disabled={savingSession}
                                    style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    {savingSession ? 'Creating...' : 'Create Session'}
                                </button>
                            </div>
                        </LiquidGlassPanel>

                        {/* Existing Sessions */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Existing Sessions
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                                {sessionGroups.map((item) => (
                                    <div key={item.session} style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid #E5E7EB',
                                        backgroundColor: 'white',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                                                    {item.session}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                                                    {item.terms.join(', ')}
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-glass btn-sm"
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {sessionGroups.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                                        No sessions created yet.
                                    </div>
                                )}
                            </div>
                        </LiquidGlassPanel>
                    </div>
                )}

                {/* Tab 2: Classes & Arms */}
                {activeTab === 'classes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Setup Form */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Generate Class Arms
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                        Base Classes
                                    </label>
                                    <ChipInput
                                        value={baseClasses}
                                        onChange={setBaseClasses}
                                        placeholder="Type class name and press Enter (e.g., JSS1)"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                        Class Arms / Categories
                                    </label>
                                    <ChipInput
                                        value={classArms}
                                        onChange={setClassArms}
                                        placeholder="Type arm and press Enter (e.g., A)"
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleCreateClasses} 
                                    disabled={savingClasses || generatedClasses.length === 0}
                                    style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    {savingClasses ? 'Saving...' : 'Generate Class Arms'}
                                </button>
                            </div>
                        </LiquidGlassPanel>

                        {/* Preview */}
                        {generatedClasses.length > 0 && (
                            <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                    Preview ({generatedClasses.length} classes)
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                    gap: '12px',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    {generatedClasses.map((className, index) => (
                                        <div key={index} style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            backgroundColor: '#F3F4F6',
                                            textAlign: 'center',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: '#374151'
                                        }}>
                                            {className}
                                        </div>
                                    ))}
                                </div>
                            </LiquidGlassPanel>
                        )}
                    </div>
                )}

                {/* Tab 3: Subjects & Mappings */}
                {activeTab === 'subjects' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Sub-navigation */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { id: 'bulk', label: 'Bulk Subject Templates' },
                                { id: 'individual', label: 'Manage Individual Subjects' },
                            ].map((view) => (
                                <button
                                    key={view.id}
                                    onClick={() => setSubjectView(view.id)}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #E5E7EB',
                                        background: subjectView === view.id ? '#3B82F6' : 'white',
                                        color: subjectView === view.id ? 'white' : '#6B7280',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>

                        {/* Bulk Templates View */}
                        {subjectView === 'bulk' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                        Target Classes
                                    </h3>
                                    <ChipInput
                                        value={comboClassTargets}
                                        onChange={setComboClassTargets}
                                        placeholder="Type class prefix and press Enter (e.g., SS1)"
                                    />
                                </LiquidGlassPanel>

                                {combinationRows.map((template, index) => (
                                    <LiquidGlassPanel key={template.name} hover={false} style={{ padding: '24px' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
                                            {template.name} Template
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                                    Class Prefix
                                                </label>
                                                <FormField
                                                    label="Class Prefix"
                                                    value={template.classPrefix}
                                                    onChange={(value) => setCombinationRows((current) => 
                                                        current.map((item, idx) => idx === index ? { ...item, classPrefix: value } : item)
                                                    )}
                                                    placeholder="SS"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                                    Subjects
                                                </label>
                                                <ChipInput
                                                    value={template.subjects}
                                                    onChange={(subjects) => setCombinationRows((current) => 
                                                        current.map((item, idx) => idx === index ? { ...item, subjects } : item)
                                                    )}
                                                    placeholder="Type subject name and press Enter"
                                                />
                                            </div>
                                        </div>
                                    </LiquidGlassPanel>
                                ))}

                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleApplyCombinations} 
                                    disabled={savingCombos}
                                    style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500, alignSelf: 'flex-start' }}
                                >
                                    {savingCombos ? 'Applying...' : 'Apply Subject Combinations'}
                                </button>
                            </div>
                        )}

                        {/* Individual Subjects View */}
                        {subjectView === 'individual' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Create Subject Form */}
                                <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                        Create Subject
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <FormField 
                                            label="Subject Name" 
                                            value={subjectForm.name} 
                                            onChange={(value) => setSubjectForm((current) => ({ ...current, name: value }))} 
                                            placeholder="Mathematics" 
                                        />
                                        <FormField 
                                            label="Subject Code" 
                                            value={subjectForm.code} 
                                            onChange={(value) => setSubjectForm((current) => ({ ...current, code: value.toUpperCase() }))} 
                                            placeholder="MTH" 
                                        />
                                        <FormField 
                                            label="Class" 
                                            type="select" 
                                            options={classNames.map((item) => ({ value: item, label: item }))} 
                                            value={subjectForm.className} 
                                            onChange={(value) => setSubjectForm((current) => ({ ...current, className: value }))} 
                                        />
                                        <FormField 
                                            label="Teacher" 
                                            type="select" 
                                            options={staff.map((item) => ({ value: item.$id, label: `${item.firstName} ${item.lastName}` }))} 
                                            value={subjectForm.staffId} 
                                            onChange={(value) => setSubjectForm((current) => ({ ...current, staffId: value }))} 
                                        />
                                    </div>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleCreateSubject} 
                                        disabled={savingSubject}
                                        style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500, marginTop: '16px' }}
                                    >
                                        {savingSubject ? 'Saving...' : 'Create Subject'}
                                    </button>
                                </LiquidGlassPanel>

                                {/* Search and Filter */}
                                <LiquidGlassPanel hover={false} style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                            <input
                                                type="text"
                                                placeholder="Search subjects..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px 10px 40px',
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '8px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                        <select
                                            value={filterClass}
                                            onChange={(e) => setFilterClass(e.target.value)}
                                            style={{
                                                padding: '10px 12px',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <option value="">All Classes</option>
                                            {classNames.map((className) => (
                                                <option key={className} value={className}>{className}</option>
                                            ))}
                                        </select>
                                    </div>
                                </LiquidGlassPanel>

                                {/* Subjects Table */}
                                <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Code</th>
                                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Subject Name</th>
                                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Class</th>
                                                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Assigned Teacher</th>
                                                    <th style={{ textAlign: 'center', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredSubjects.map((subject) => {
                                                    const teacher = staff.find((item) => item.$id === subject.staffId);
                                                    return (
                                                        <tr key={subject.$id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                            <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>{subject.code}</td>
                                                            <td style={{ padding: '12px', fontSize: '14px', color: '#374151', fontWeight: 500 }}>{subject.name}</td>
                                                            <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>{subject.className}</td>
                                                            <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>
                                                                {teacher ? `${teacher.firstName} ${teacher.lastName}` : '-'}
                                                            </td>
                                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                                    <button
                                                                        className="btn btn-glass btn-sm"
                                                                        onClick={() => handleEditClick(subject)}
                                                                        style={{ padding: '6px 8px', fontSize: '12px' }}
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => handleDeleteClick(subject)}
                                                                        style={{ padding: '6px 8px', fontSize: '12px' }}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredSubjects.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                                                            No subjects found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </LiquidGlassPanel>
                            </div>
                        )}
                    </div>
                )}
            </div>

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
                    <p style={{ fontSize: 14, color: '#6B7280' }}>
                        <strong>{selectedSubject?.name}</strong> ({selectedSubject?.code}) for {selectedSubject?.className}
                    </p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
