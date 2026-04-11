import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X, Edit2, Trash2, BookOpen, Calendar, Users, ChevronRight, Check, School, UserCheck, AlertCircle } from 'lucide-react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import FormField from 'shared/components/FormField.jsx';
import Modal from 'shared/components/Modal.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import { useAuth } from 'shared/utils/auth.jsx';
import {
    createAcademicSession,
    createSubject,
    deleteAcademicSession,
    listAcademicSessions,
    listClasses,
    listStaff,
    listSubjects,
    updateAcademicSession,
    upsertClassNames,
    upsertSubjects,
    updateSchool,
    updateSchoolBackend,
    updateSubject,
    deleteSubject,
    getSchool,
} from 'shared/utils/api.js';

const TERM_LABELS = ['First Term', 'Second Term', 'Third Term', 'Fourth Term'];

const SCHOOL_CLASS_TEMPLATES = {
    primary: ['Prenursery', 'Nursery 1', 'Nursery 2', 'Nursery 3', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
    secondary: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'],
    combined: [
        'Prenursery', 'Nursery 1', 'Nursery 2', 'Nursery 3',
        'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
        'JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'
    ],
};

const DEFAULT_TEMPLATES = [
    { 
        name: 'General Subjects', 
        classPrefix: '', 
        subjects: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies', 'Civic Education'] 
    },
    { 
        name: 'Sciences', 
        classPrefix: 'SS', 
        subjects: ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics'] 
    },
    { 
        name: 'Arts', 
        classPrefix: 'SS', 
        subjects: ['Mathematics', 'English Language', 'Literature in English', 'Government', 'CRS', 'Civic Education'] 
    },
    { 
        name: 'Social Sciences', 
        classPrefix: 'SS', 
        subjects: ['Mathematics', 'English Language', 'Economics', 'Commerce', 'Government', 'Civic Education'] 
    },
];

function makeSubjectCode(name) {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const code = words.map((item) => item.slice(0, 1).toUpperCase()).join('');
    return code.slice(0, 10);
}

// Enhanced Tag Input Component
function TagInput({ value, onChange, placeholder, suggestions = [] }) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentTags, setCurrentTags] = useState(value || []);

    useEffect(() => {
        setCurrentTags(value || []);
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !currentTags.includes(newTag)) {
                const updatedTags = [...currentTags, newTag];
                setCurrentTags(updatedTags);
                onChange(updatedTags);
            }
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setShowSuggestions(value.length > 0);
    };

    const removeTag = (tagToRemove) => {
        const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
        setCurrentTags(updatedTags);
        onChange(updatedTags);
    };

    const addSuggestion = (suggestion) => {
        if (!currentTags.includes(suggestion)) {
            const updatedTags = [...currentTags, suggestion];
            setCurrentTags(updatedTags);
            onChange(updatedTags);
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const filteredSuggestions = suggestions.filter(s => 
        s.toLowerCase().includes(inputValue.toLowerCase()) && !currentTags.includes(s)
    );

    return (
        <div style={{ position: 'relative', zIndex: showSuggestions ? 40 : 1 }}>
            <div style={{
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: 8,
                minHeight: 44,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                alignItems: 'center',
                backgroundColor: 'white',
                transition: 'border-color 0.2s',
                cursor: 'text'
            }}>
                {currentTags.map((tag, index) => (
                    <span key={index} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        backgroundColor: '#EBF5FF',
                        color: '#1E40AF',
                        borderRadius: 16,
                        fontSize: 13,
                        fontWeight: 500,
                        border: '1px solid #BFDBFE'
                    }}>
                        {tag}
                        <button
                            onClick={() => removeTag(tag)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1E40AF',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '50%'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={currentTags.length === 0 ? placeholder : ''}
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
            
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #D1D5DB',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 999
                }}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => addSuggestion(suggestion)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#374151',
                                borderBottom: '1px solid #F3F4F6'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Academics() {
    const { schoolId } = useAuth();
    const toast = useToast();

    // View states
    const [viewMode, setViewMode] = useState('home'); // home, create, edit
    const [activeTab, setActiveTab] = useState('sessions');
    const [editingSession, setEditingSession] = useState(null);

    // Data
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');

    // Term Details
    const [classFeeAmounts, setClassFeeAmounts] = useState({});
    const [termDetailsCurrentSession, setTermDetailsCurrentSession] = useState('');
    const [termDetailsCurrentTerm, setTermDetailsCurrentTerm] = useState('');

    // Session Form
    const [sessionForm, setSessionForm] = useState({
        session: '',
        termsCount: '3',
        schoolType: 'primary',
    });

    // Classes Form
    const [baseClasses, setBaseClasses] = useState([]);
    const [classArms, setClassArms] = useState(['A', 'B', 'C']);

    // Subjects Form
    const [subjectView, setSubjectView] = useState('bulk');
    const [subjectForm, setSubjectForm] = useState({ name: '', code: '', className: '', staffId: '' });
    const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
    const [comboClassTargets, setComboClassTargets] = useState([]);

    // Loading states
    const [saving, setSaving] = useState(false);

    // Modal states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', code: '', className: '', staffId: '' });
    const [processingAction, setProcessingAction] = useState(false);
    const [sessionDeleteModalOpen, setSessionDeleteModalOpen] = useState(false);
    const [sessionDeleteInput, setSessionDeleteInput] = useState('');
    const [pendingDeleteSession, setPendingDeleteSession] = useState('');

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
        if (schoolId) {
            loadSchoolData();
        }
    }, [schoolId]);

    async function loadSchoolData() {
        try {
            const schoolData = await getSchool(schoolId);
            if (schoolData) {
                const schoolDataParsed = typeof schoolData.data === 'string' ? JSON.parse(schoolData.data) : (schoolData.data || {});
                setClassFeeAmounts(schoolDataParsed.classFeeAmounts || {});
                setTermDetailsCurrentSession(schoolData.currentSession || '');
                setTermDetailsCurrentTerm(schoolData.currentTerm || '');
            }
        } catch (error) {
            console.error('Error loading school data:', error);
        }
    }

    useEffect(() => {
        setBaseClasses(SCHOOL_CLASS_TEMPLATES[sessionForm.schoolType] || []);
    }, [sessionForm.schoolType]);

    // Generate session options
    const sessionOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let i = 0; i < 5; i++) {
            const startYear = currentYear + i;
            const endYear = startYear + 1;
            options.push({
                value: `${startYear}/${endYear}`,
                label: `${startYear}/${endYear} Academic Session`
            });
        }
        return options;
    }, []);

    // Generate class combinations
    const generatedClasses = useMemo(() => {
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
        return combinations;
    }, [baseClasses, classArms]);

    const sessionGroups = useMemo(() => {
        const map = new Map();
        for (const item of sessions) {
            const key = item.session;
            const existing = map.get(key) || { session: key, terms: [], isCurrent: false };
            existing.terms.push(item.term);
            if (item.isCurrent) existing.isCurrent = true;
            map.set(key, existing);
        }
        return Array.from(map.values())
            .map((item) => ({ ...item, terms: [...new Set(item.terms)] }))
            .sort((a, b) => b.session.localeCompare(a.session));
    }, [sessions]);

    const currentSession = sessionGroups.find(s => s.isCurrent) || sessionGroups[0];

    const classNames = useMemo(() => [...new Set(classes.map((item) => item.name).filter(Boolean))], [classes]);

    const uniqueSubjectCount = useMemo(() => {
        const names = new Set(
            subjects
                .map((item) => String(item.name || '').trim().toLowerCase())
                .filter(Boolean)
        );
        return names.size;
    }, [subjects]);

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

    // Reconstruct templates from saved subjects (for editing mode)
    function reconstructTemplatesFromSubjects() {
        const templateMap = new Map();
        
        for (const subject of subjects) {
            const templateName = subject.templateName || 'General';
            if (!templateMap.has(templateName)) {
                templateMap.set(templateName, {
                    name: templateName,
                    classPrefix: '',
                    subjects: [],
                });
            }
            const template = templateMap.get(templateName);
            if (!template.subjects.includes(subject.name)) {
                template.subjects.push(subject.name);
            }
        }

        // If templates were reconstructed, determine class prefixes
        const reconstructed = Array.from(templateMap.values());
        for (const template of reconstructed) {
            if (template.name === 'General') {
                template.classPrefix = '';
            } else if (['Sciences', 'Arts', 'Social Sciences'].includes(template.name)) {
                template.classPrefix = 'SS';
            }
        }

        return reconstructed.length > 0 ? reconstructed : DEFAULT_TEMPLATES;
    }

    const kpiData = [
        { label: 'Academic Sessions', value: sessionGroups.length, icon: Calendar, color: '#3B82F6' },
        { label: 'Class Arms', value: classNames.length, icon: Users, color: '#10B981' },
        { label: 'Unique Subjects', value: uniqueSubjectCount, icon: BookOpen, color: '#F59E0B' },
    ];

    async function handleCreateSession() {
        if (!sessionForm.session) {
            toast({ type: 'error', title: 'Session required', message: 'Please select an academic session.' });
            return;
        }
        setActiveTab('classes');
    }

    async function handleSaveClasses() {
        if (generatedClasses.length === 0) {
            toast({ type: 'error', title: 'No classes generated', message: 'Add base classes and arms to generate combinations.' });
            return;
        }
        setComboClassTargets(generatedClasses);
        setActiveTab('subjects');
    }

    async function handleApplyTemplates() {
        if (comboClassTargets.length === 0) {
            toast({ type: 'error', title: 'No target classes', message: 'Select target classes for subject templates.' });
            return;
        }

        const subjectRows = [];
        const usedCodes = new Set();

        for (const template of templates) {
            const allowedClasses = template.classPrefix 
                ? comboClassTargets.filter((name) => name.startsWith(template.classPrefix))
                : comboClassTargets;
            
            for (const className of allowedClasses) {
                for (const subjectName of template.subjects) {
                    let code = makeSubjectCode(subjectName);
                    let counter = 1;
                    while (usedCodes.has(code)) {
                        code = `${makeSubjectCode(subjectName)}${counter}`;
                        counter++;
                    }
                    usedCodes.add(code);
                    
                    subjectRows.push({
                        className,
                        name: subjectName,
                        code,
                        staffId: '',
                        templateName: template.name
                    });
                }
            }
        }

        setSaving(true);
        try {
            const result = await upsertSubjects(schoolId, subjectRows);
            toast({
                type: 'success',
                title: 'Subject templates applied',
                message: `${result.created.length} subject record(s) created.`,
            });
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Template application failed', message: error.message });
        } finally {
            setSaving(false);
        }
    }

    async function handleCreateSubject() {
        if (!subjectForm.name || !subjectForm.code || !subjectForm.className) {
            toast({ type: 'error', title: 'Missing subject fields', message: 'Name, code, and class are required.' });
            return;
        }

        setSaving(true);
        try {
            await createSubject({ schoolId, ...subjectForm, code: subjectForm.code.toUpperCase() });
            toast({ type: 'success', title: 'Subject created', message: 'Subject added successfully.' });
            setSubjectForm({ name: '', code: '', className: '', staffId: '' });
            await loadData();
        } catch (error) {
            toast({ type: 'error', title: 'Subject save failed', message: error.message });
        } finally {
            setSaving(false);
        }
    }

    function handleAddTemplate() {
        const newTemplate = {
            name: `Custom Template ${templates.length + 1}`,
            classPrefix: '',
            subjects: []
        };
        setTemplates([...templates, newTemplate]);
    }

    function handleUpdateTemplate(index, field, value) {
        const updated = [...templates];
        updated[index] = { ...updated[index], [field]: value };
        setTemplates(updated);
    }

    function handleRemoveTemplate(index) {
        if (templates.length <= 1) return;
        const updated = templates.filter((_, i) => i !== index);
        setTemplates(updated);
    }

    function handleEditSession(session) {
        setEditingSession(session);
        setSessionForm({
            session: session.session,
            termsCount: session.terms.length.toString(),
            schoolType: 'primary', // Default, should be determined from existing data
        });
        
        // Reconstruct templates from previously saved subjects
        const reconstructed = reconstructTemplatesFromSubjects();
        setTemplates(reconstructed);
        
        // Set combo class targets to existing classes
        setComboClassTargets(classNames);
        
        // Auto-generate base classes and arms from existing class names
        const baseClassMap = new Map();
        for (const className of classNames) {
            // Split class name into base and arm (e.g., "JSS1A" -> "JSS1" + "A")
            const match = String(className || '').match(/^(.+?)([A-Z]?)$/);
            if (match) {
                const baseClass = match[1];
                const arm = match[2] || '';
                if (!baseClassMap.has(baseClass)) {
                    baseClassMap.set(baseClass, []);
                }
                if (arm && !baseClassMap.get(baseClass).includes(arm)) {
                    baseClassMap.get(baseClass).push(arm);
                }
            }
        }
        
        // If we can parse classes, set them
        if (baseClassMap.size > 0) {
            const arms = Array.from(new Set(
                Array.from(baseClassMap.values()).flat()
            )).sort();
            const bases = Array.from(baseClassMap.keys()).sort();
            if (bases.length > 0 && arms.length > 0) {
                setBaseClasses(bases);
                setClassArms(arms.length > 0 ? arms : ['A', 'B', 'C']);
            }
        }
        
        setViewMode('edit');
        setActiveTab('sessions');
    }

    function handleCancelEdit() {
        setEditingSession(null);
        setViewMode('home');
        setSessionForm({ session: '', termsCount: '3', schoolType: 'primary' });
        setBaseClasses([]);
        setClassArms(['A', 'B', 'C']);
        setActiveTab('sessions');
    }

    function requestDeleteSession(sessionValue) {
        const targetSession = String(sessionValue || '').trim();
        if (!targetSession) return;
        setPendingDeleteSession(targetSession);
        setSessionDeleteModalOpen(true);
    }

    async function handleUpdateSessionDate(sessionId, field, value) {
        try {
            setSaving(true);
            await updateAcademicSession(sessionId, { [field]: value });
            await loadData();
            toast({ type: 'success', title: 'Success', message: 'Term date updated successfully' });
        } catch (error) {
            console.error('Error updating session date:', error);
            toast({ type: 'error', title: 'Error', message: 'Failed to update term date' });
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveTermDetails() {
        try {
            setSaving(true);
            await updateSchoolBackend({
                classFeeAmounts,
                currentSession: termDetailsCurrentSession,
                currentTerm: termDetailsCurrentTerm
            });
            toast({ type: 'success', title: 'Success', message: 'Term details saved successfully' });
        } catch (error) {
            console.error('Error saving term details:', error);
            toast({ type: 'error', title: 'Error', message: 'Failed to save term details' });
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteSession(sessionValue) {
        const targetSession = String(sessionValue || '').trim();
        if (!targetSession) return;

        setSaving(true);
        try {
            const matching = sessions.filter((item) => item.session === targetSession);
            if (matching.length === 0) {
                toast({ type: 'error', title: 'Not found', message: 'No records found for that session.' });
                return;
            }

            for (const row of matching) {
                await deleteAcademicSession(row.$id);
            }

            const nextSessionsRes = await listAcademicSessions(schoolId);
            const nextSessions = nextSessionsRes.documents || [];

            // Keep school pointers in sync after deletion.
            if (nextSessions.length === 0) {
                await updateSchool(schoolId, { currentSession: '', currentTerm: '' });
            } else {
                const currentRow = nextSessions.find((row) => row.isCurrent) || nextSessions[0];
                await updateSchool(schoolId, {
                    currentSession: currentRow.session || '',
                    currentTerm: currentRow.term || '',
                });
            }

            toast({
                type: 'success',
                title: 'Session deleted',
                message: `${targetSession} and its term records were removed successfully.`,
            });

            setSessionDeleteModalOpen(false);
            setPendingDeleteSession('');
            setSessionDeleteInput('');
            await loadData();
            handleCancelEdit();
        } catch (error) {
            toast({ type: 'error', title: 'Delete failed', message: error.message || 'Unable to delete session.' });
        } finally {
            setSaving(false);
        }
    }

    async function handleFinalizeSession() {
        if (!sessionForm.session) {
            toast({ type: 'error', title: 'Session required', message: 'Please select an academic session.' });
            return;
        }

        if (viewMode === 'edit' && !editingSession?.session) {
            toast({ type: 'error', title: 'No session selected', message: 'Please select a valid session to update.' });
            return;
        }

        if (generatedClasses.length === 0) {
            toast({ type: 'error', title: 'No classes generated', message: 'Add base classes and arms to generate combinations.' });
            return;
        }

        setSaving(true);
        try {
            const targetSession = viewMode === 'edit' ? editingSession.session : sessionForm.session;
            const existingForSession = sessions.filter((item) => item.session === targetSession);
            const nextTermCount = Math.max(1, Math.min(4, Number(sessionForm.termsCount || 3)));
            const nextTerms = TERM_LABELS.slice(0, nextTermCount);
            const existingByTerm = new Map(existingForSession.map((item) => [item.term, item]));

            // Keep previously current session current, unless this is explicitly marked current later.
            for (const term of nextTerms) {
                if (existingByTerm.has(term)) continue;
                await createAcademicSession({
                    schoolId,
                    session: sessionForm.session,
                    term,
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    resultPublished: false,
                });
            }

            // Remove terms no longer selected only while editing an existing session.
            if (viewMode === 'edit') {
                for (const oldItem of existingForSession) {
                    if (!nextTerms.includes(oldItem.term)) {
                        await deleteAcademicSession(oldItem.$id);
                    }
                }
            }

            await upsertClassNames(schoolId, generatedClasses);

            if (comboClassTargets.length > 0) {
                const subjectRows = [];
                const existingNameKeys = new Set(subjects.map((item) => `${item.className}::${String(item.name || '').trim().toLowerCase()}`));
                const usedCodes = new Set(subjects.map((item) => `${item.className}::${String(item.code || '').toUpperCase()}`));

                for (const template of templates) {
                    const allowedClasses = template.classPrefix
                        ? comboClassTargets.filter((name) => name.startsWith(template.classPrefix))
                        : comboClassTargets;

                    for (const className of allowedClasses) {
                        for (const subjectName of template.subjects) {
                            const trimmedName = String(subjectName || '').trim();
                            if (!trimmedName) continue;
                            const nameKey = `${className}::${trimmedName.toLowerCase()}`;
                            if (existingNameKeys.has(nameKey)) continue;

                            const baseCode = makeSubjectCode(trimmedName);
                            let code = baseCode;
                            let counter = 1;
                            while (usedCodes.has(`${className}::${code}`)) {
                                code = `${baseCode}${counter}`;
                                counter += 1;
                            }
                            usedCodes.add(`${className}::${code}`);

                            subjectRows.push({
                                className,
                                name: trimmedName,
                                code,
                                staffId: '',
                                templateName: template.name,
                            });
                            existingNameKeys.add(nameKey);
                        }
                    }
                }

                if (subjectRows.length > 0) {
                    await upsertSubjects(schoolId, subjectRows);
                }
            }

            // Keep school currentSession/currentTerm aligned with active records.
            const updatedSessions = await listAcademicSessions(schoolId);
            const rows = updatedSessions.documents || [];
            const anyCurrent = rows.find((item) => item.isCurrent);
            if (!anyCurrent && rows.length > 0) {
                await updateAcademicSession(rows[0].$id, { isCurrent: true });
            }

            toast({
                type: 'success',
                title: viewMode === 'create' ? 'Academic session created' : 'Academic settings saved',
                message: `Updated ${sessionForm.session} with ${nextTerms.length} term(s), classes, and subject mappings.`,
            });

            await loadData();
            handleCancelEdit();
        } catch (error) {
            toast({ type: 'error', title: 'Save failed', message: error.message || 'Unable to save academic setup changes.' });
        } finally {
            setSaving(false);
        }
    }

    // Home view - No sessions
    if (viewMode === 'home' && sessionGroups.length === 0) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '60vh',
                padding: '40px'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#EBF5FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <School size={40} color="#3B82F6" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937', marginBottom: '12px' }}>
                        Create Your First Academic Session
                    </h2>
                    <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '32px', lineHeight: 1.5 }}>
                        Get started by setting up your first academic session. This will be the foundation for managing your school's academic structure.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setViewMode('create')}
                        style={{ padding: '14px 32px', fontSize: '16px', fontWeight: 500 }}
                    >
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        Create Academic Session
                    </button>
                </div>
            </div>
        );
    }

    // Home view - With sessions
    if (viewMode === 'home') {
        return (
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#1F2937' }}>
                        Academics Management
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280', margin: '8px 0 0 0' }}>
                        Overview of your academic structure and settings.
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

                {/* Current Session Card */}
                {currentSession && (
                    <LiquidGlassPanel hover={false} style={{ padding: '32px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                                        {currentSession.session}
                                    </h3>
                                    {currentSession.isCurrent && (
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor: '#10B98120',
                                            color: '#059669',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 500
                                        }}>
                                            Current
                                        </span>
                                    )}
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 8px 0' }}>
                                        <strong>Terms:</strong> {currentSession.terms.join(', ')}
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '0' }}>
                                        <strong>Classes:</strong> {classNames.length} • <strong>Unique Subjects:</strong> {uniqueSubjectCount}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleEditSession(currentSession)}
                                        style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 500 }}
                                    >
                                        <Edit2 size={16} style={{ marginRight: '6px' }} />
                                        Edit Session
                                    </button>
                                </div>
                            </div>
                        </div>
                    </LiquidGlassPanel>
                )}

                {/* Create New Session Button */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => setViewMode('create')}
                        style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
                    >
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Create New Academic Session
                    </button>
                </div>
            </div>
        );
    }

    // Create/Edit view
    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#1F2937' }}>
                        {viewMode === 'create' ? 'Create Academic Session' : `Edit ${editingSession?.session}`}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280', margin: '8px 0 0 0' }}>
                        {viewMode === 'create' 
                            ? 'Set up your academic structure in three simple steps'
                            : 'Modify your academic session settings'
                        }
                    </p>
                </div>
                <button
                    className="btn btn-glass"
                    onClick={handleCancelEdit}
                    style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 500 }}
                >
                    Cancel
                </button>
            </div>

            {/* Progress Indicator */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                    {[
                        { id: 'sessions', label: 'Session Setup' },
                        { id: 'classes', label: 'Classes & Arms' },
                        { id: 'subjects', label: 'Subjects & Mappings' },
                        { id: 'terms-details', label: 'Terms Details' },
                    ].map((tab, index) => (
                        <React.Fragment key={tab.id}>
                            <button
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 20px',
                                    border: 'none',
                                    background: activeTab === tab.id ? '#3B82F6' : '#F3F4F6',
                                    color: activeTab === tab.id ? 'white' : '#6B7280',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                            {index < 3 && (
                                <ChevronRight size={16} color="#D1D5DB" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div style={{ minHeight: '500px' }}>
                {/* Tab 1: Sessions & Terms */}
                {activeTab === 'sessions' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Academic Session Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <FormField
                                    label="Academic Session"
                                    type="select"
                                    options={sessionOptions}
                                    value={sessionForm.session}
                                    onChange={(value) => setSessionForm((current) => ({ ...current, session: value }))}
                                    disabled={viewMode === 'edit'}
                                />
                                <FormField
                                    label="Number of Terms"
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
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleCreateSession} 
                                    disabled={saving}
                                    style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    Next
                                </button>
                                {viewMode === 'edit' && (
                                    <button
                                        className="btn btn-glass"
                                        onClick={() => requestDeleteSession(editingSession?.session)}
                                        disabled={saving}
                                        style={{ color: '#B91C1C' }}
                                    >
                                        <Trash2 size={16} style={{ marginRight: 6 }} />
                                        Delete Session
                                    </button>
                                )}
                            </div>
                        </LiquidGlassPanel>

                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Session Preview
                            </h3>
                            <div style={{ 
                                padding: '20px', 
                                backgroundColor: '#F9FAFB', 
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB'
                            }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Session</div>
                                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
                                        {sessionForm.session || 'Not selected'}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Terms</div>
                                    <div style={{ fontSize: '14px', color: '#374151' }}>
                                        {sessionForm.termsCount ? TERM_LABELS.slice(0, parseInt(sessionForm.termsCount)).join(', ') : 'Not set'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>School Type</div>
                                    <div style={{ fontSize: '14px', color: '#374151' }}>
                                        {sessionForm.schoolType === 'primary' ? 'Primary School' : 
                                         sessionForm.schoolType === 'secondary' ? 'Secondary School' : 
                                         'Combined (Primary + Secondary)'}
                                    </div>
                                </div>
                            </div>
                        </LiquidGlassPanel>
                    </div>
                )}

                {/* Tab 2: Classes & Arms */}
                {activeTab === 'classes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Generate Class Arms
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                        Base Classes
                                    </label>
                                    <TagInput
                                        value={baseClasses}
                                        onChange={setBaseClasses}
                                        placeholder="Type class name and press Enter (e.g., JSS1)"
                                        suggestions={SCHOOL_CLASS_TEMPLATES[sessionForm.schoolType]}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                        Class Arms / Categories
                                    </label>
                                    <TagInput
                                        value={classArms}
                                        onChange={setClassArms}
                                        placeholder="Type arm and press Enter (e.g., A)"
                                        suggestions={['A', 'B', 'C', 'D', 'E', 'F']}
                                    />
                                </div>
                            </div>
                        </LiquidGlassPanel>

                        {/* Preview */}
                        {generatedClasses.length > 0 && (
                            <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                    Class Preview ({generatedClasses.length} classes)
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                    gap: '12px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    marginBottom: '20px'
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
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleSaveClasses} 
                                    disabled={saving}
                                    style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    Next
                                </button>
                            </LiquidGlassPanel>
                        )}
                    </div>
                )}

                {/* Tab 3: Subjects & Mappings */}
                {activeTab === 'subjects' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Target Classes */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Target Classes
                            </h3>
                            <TagInput
                                value={comboClassTargets}
                                onChange={setComboClassTargets}
                                placeholder="Select classes to apply subjects to"
                                suggestions={classNames}
                            />
                        </LiquidGlassPanel>

                        {/* Subject Templates */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 600 }}>
                                    Subject Templates
                                </h3>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={handleAddTemplate}
                                    style={{ padding: '8px 16px', fontSize: '13px' }}
                                >
                                    <Plus size={16} style={{ marginRight: '4px' }} />
                                    Add Template
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {templates.map((template, index) => (
                                    <div key={index} style={{
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        backgroundColor: index === 0 ? '#F0F9FF' : 'white'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    value={template.name}
                                                    onChange={(e) => handleUpdateTemplate(index, 'name', e.target.value)}
                                                    style={{
                                                        border: '1px solid #D1D5DB',
                                                        borderRadius: '6px',
                                                        padding: '6px 10px',
                                                        fontSize: '14px',
                                                        fontWeight: 500
                                                    }}
                                                />
                                                {index === 0 && (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        backgroundColor: '#3B82F6',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: 500
                                                    }}>
                                                        General
                                                    </span>
                                                )}
                                            </div>
                                            {index > 0 && (
                                                <button
                                                    onClick={() => handleRemoveTemplate(index)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        padding: '4px'
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#6B7280' }}>
                                                    Class Prefix (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={template.classPrefix}
                                                    onChange={(e) => handleUpdateTemplate(index, 'classPrefix', e.target.value)}
                                                    placeholder="e.g., SS"
                                                    style={{
                                                        border: '1px solid #D1D5DB',
                                                        borderRadius: '6px',
                                                        padding: '6px 10px',
                                                        fontSize: '13px',
                                                        width: '100%'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#6B7280' }}>
                                                    Subjects
                                                </label>
                                                <TagInput
                                                    value={template.subjects}
                                                    onChange={(subjects) => handleUpdateTemplate(index, 'subjects', subjects)}
                                                    placeholder="Add subjects..."
                                                    suggestions={['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Literature in English', 'Government', 'Economics', 'Commerce', 'CRS', 'Civic Education', 'Basic Science', 'Social Studies', 'Further Mathematics']}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleFinalizeSession} 
                                    disabled={saving}
                                    style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    {saving ? 'Saving...' : viewMode === 'create' ? 'Create Session' : 'Save Session'}
                                </button>
                            </div>
                        </LiquidGlassPanel>
                    </div>
                )}

                {/* Tab 4: Terms Details */}
                {activeTab === 'terms-details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Term Dates & School Fees
                            </h3>
                            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
                                Set start and end dates for each term and configure school fees.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                                {sessions.map(session => (
                                    <div key={session.$id} style={{ 
                                        border: '1px solid #E5E7EB', 
                                        borderRadius: '8px', 
                                        padding: '16px',
                                        background: session.isCurrent ? '#EFF6FF' : '#FFFFFF'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                                                {session.term} - {session.session}
                                            </h4>
                                            {session.isCurrent && (
                                                <span style={{ 
                                                    background: '#3B82F6', 
                                                    color: 'white', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 500 
                                                }}>
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#6B7280' }}>
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={session.startDate || ''}
                                                    onChange={(e) => handleUpdateSessionDate(session.$id, 'startDate', e.target.value)}
                                                    style={{
                                                        border: '1px solid #D1D5DB',
                                                        borderRadius: '6px',
                                                        padding: '6px 10px',
                                                        fontSize: '13px',
                                                        width: '100%'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#6B7280' }}>
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={session.endDate || ''}
                                                    onChange={(e) => handleUpdateSessionDate(session.$id, 'endDate', e.target.value)}
                                                    style={{
                                                        border: '1px solid #D1D5DB',
                                                        borderRadius: '6px',
                                                        padding: '6px 10px',
                                                        fontSize: '13px',
                                                        width: '100%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', background: '#F9FAFB', borderRadius: '8px' }}>
                                <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
                                    School Fee Configuration (Per Class)
                                </h4>
                                <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 12px 0' }}>
                                    Set the school fee amount for each class individually.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                                    {classNames.map(cls => (
                                        <div key={cls}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#6B7280' }}>
                                                {cls} (₦)
                                            </label>
                                            <input
                                                type="number"
                                                value={classFeeAmounts[cls] || ''}
                                                onChange={(e) => setClassFeeAmounts(prev => ({ ...prev, [cls]: Number(e.target.value) }))}
                                                min="0"
                                                placeholder="0"
                                                style={{
                                                    border: '1px solid #D1D5DB',
                                                    borderRadius: '6px',
                                                    padding: '6px 10px',
                                                    fontSize: '13px',
                                                    width: '100%'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#6B7280' }}>
                                            Current Session
                                        </label>
                                        <select
                                            value={termDetailsCurrentSession}
                                            onChange={(e) => setTermDetailsCurrentSession(e.target.value)}
                                            style={{
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                fontSize: '13px',
                                                width: '100%'
                                            }}
                                        >
                                            <option value="">Select Session</option>
                                            {[...new Set(sessions.map(s => s.session))].map(session => (
                                                <option key={session} value={session}>{session}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: '#6B7280' }}>
                                            Current Term
                                        </label>
                                        <select
                                            value={termDetailsCurrentTerm}
                                            onChange={(e) => setTermDetailsCurrentTerm(e.target.value)}
                                            style={{
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                fontSize: '13px',
                                                width: '100%'
                                            }}
                                        >
                                            <option value="">Select Term</option>
                                            {[...new Set(sessions.map(s => s.term))].map(term => (
                                                <option key={term} value={term}>{term}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleSaveTermDetails} 
                                    disabled={saving}
                                    style={{ marginTop: '16px', padding: '10px 20px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </LiquidGlassPanel>
                    </div>
                )}
            </div>

            <Modal
                open={sessionDeleteModalOpen}
                onClose={() => {
                    if (saving) return;
                    setSessionDeleteModalOpen(false);
                    setSessionDeleteInput('');
                    setPendingDeleteSession('');
                }}
                title="Confirm Session Deletion"
                footer={(
                    <>
                        <button
                            className="btn btn-glass"
                            onClick={() => {
                                setSessionDeleteModalOpen(false);
                                setSessionDeleteInput('');
                                setPendingDeleteSession('');
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger"
                            disabled={saving || sessionDeleteInput.trim() !== 'sudo delete session'}
                            onClick={() => handleDeleteSession(pendingDeleteSession)}
                        >
                            {saving ? 'Deleting...' : 'Delete Session'}
                        </button>
                    </>
                )}
            >
                <div style={{ display: 'grid', gap: 12 }}>
                    <p style={{ margin: 0, color: 'var(--color-gray-700)', fontSize: 14 }}>
                        This will permanently remove all term records for <strong>{pendingDeleteSession || 'this session'}</strong>.
                    </p>
                    <p style={{ margin: 0, color: 'var(--color-gray-600)', fontSize: 13 }}>
                        Type <strong>sudo delete session</strong> to confirm.
                    </p>
                    <input
                        className="input"
                        value={sessionDeleteInput}
                        onChange={(event) => setSessionDeleteInput(event.target.value)}
                        placeholder="sudo delete session"
                    />
                </div>
            </Modal>
        </div>
    );
}
