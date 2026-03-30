import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, X, Edit2, Trash2, BookOpen, Calendar, Users, ChevronRight, Check, School, UserPlus, Settings } from 'lucide-react';
import LiquidGlassPanel from '../shared/components/LiquidGlassPanel.jsx';
import FormField from '../shared/components/FormField.jsx';
import Modal from '../shared/components/Modal.jsx';
import { useToast } from '../shared/components/Toast.jsx';
import { useAuth } from '../shared/utils/auth.jsx';
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
} from '../shared/utils/api.js';

const TERM_LABELS = ['First Term', 'Second Term', 'Third Term', 'Fourth Term'];

const SCHOOL_CLASS_TEMPLATES = {
    primary: ['Prenursery', 'Nursery 1', 'Nursery 2', 'Nursery 3', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
    secondary: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'],
    combined: [
        'Prenursery', 'Nursery 1', 'Nursery 2', 'Nursery 3',
        'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
        'JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3',
    ],
};

const generateSessionOptions = () => {
    const currentYear = new Date().getFullYear();
    const sessions = [];
    for (let i = 0; i < 5; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        sessions.push({
            value: `${startYear}/${endYear}`,
            label: `${startYear}/${endYear} Academic Session`
        });
    }
    return sessions;
};

const defaultTemplates = [
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
    { 
        name: 'Humanities', 
        classPrefix: 'SS', 
        subjects: ['Mathematics', 'English Language', 'History', 'Geography', 'Government', 'Literature in English'] 
    }
];

function makeSubjectCode(name, existingCodes = new Set()) {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    
    let code = words.map((item) => item.slice(0, 1).toUpperCase()).join('');
    code = code.slice(0, 10);
    
    // If code exists, add number suffix
    let suffix = 1;
    let finalCode = code;
    while (existingCodes.has(finalCode)) {
        finalCode = `${code}${suffix}`;
        suffix++;
    }
    
    return finalCode;
}

// Enhanced Chip Input Component
function ChipInput({ value, onChange, placeholder, chips = [], suggestions = [] }) {
    const [inputValue, setInputValue] = useState('');
    const [currentChips, setCurrentChips] = useState(chips || []);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setCurrentChips(chips || []);
    }, [chips]);

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === 'Tab') && inputValue.trim()) {
            e.preventDefault();
            const newChip = inputValue.trim();
            if (!currentChips.includes(newChip)) {
                const updatedChips = [...currentChips, newChip];
                setCurrentChips(updatedChips);
                onChange(updatedChips);
            }
            setInputValue('');
            setShowSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setShowSuggestions(value.trim().length > 0);
    };

    const handleSuggestionClick = (suggestion) => {
        if (!currentChips.includes(suggestion)) {
            const updatedChips = [...currentChips, suggestion];
            setCurrentChips(updatedChips);
            onChange(updatedChips);
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const removeChip = (chipToRemove) => {
        const updatedChips = currentChips.filter(chip => chip !== chipToRemove);
        setCurrentChips(updatedChips);
        onChange(updatedChips);
    };

    const filteredSuggestions = suggestions.filter(s => 
        s.toLowerCase().includes(inputValue.toLowerCase()) && 
        !currentChips.includes(s)
    );

    return (
        <div style={{ position: 'relative' }}>
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
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
            
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    marginTop: 4,
                    maxHeight: 200,
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: 13,
                                borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #F3F4F6' : 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
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

    const [viewMode, setViewMode] = useState('home'); // home, create, edit
    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');

    // Session Form
    const [sessionForm, setSessionForm] = useState({
        session: '',
        termsCount: '3',
        schoolType: 'primary',
        isDefault: false,
    });

    // Classes Form
    const [baseClasses, setBaseClasses] = useState([]);
    const [classArms, setClassArms] = useState(['A', 'B', 'C']);
    const [generatedClasses, setGeneratedClasses] = useState([]);

    // Subjects Form
    const [subjectView, setSubjectView] = useState('bulk');
    const [subjectForm, setSubjectForm] = useState({ name: '', code: '', className: '', staffId: '' });
    const [templates, setTemplates] = useState([defaultTemplates[0]]);
    const [comboClassTargets, setComboClassTargets] = useState([]);

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
        if (sessionForm.schoolType) {
            setBaseClasses(SCHOOL_CLASS_TEMPLATES[sessionForm.schoolType] || []);
        }
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

    // Find current session
    useEffect(() => {
        const current = sessions.find(s => s.isCurrent);
        if (current) {
            setCurrentSession(current);
            setSessionForm({
                session: current.session,
                termsCount: current.terms?.length?.toString() || '3',
                schoolType: 'primary', // Default, should be determined
                isDefault: current.isCurrent
            });
        }
    }, [sessions]);

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

    const sessionOptions = generateSessionOptions();

    async function handleCreateSession() {
        if (!sessionForm.session) {
            toast({ type: 'error', title: 'Session required', message: 'Please select an academic session.' });
            return;
        }

        const termCount = Math.max(1, Math.min(4, Number(sessionForm.termsCount || 3)));
        const terms = TERM_LABELS.slice(0, termCount);

        setSavingSession(true);
        try {
            const existing = new Set(sessions.map((item) => `${item.session}::${item.term}`));
            let created = 0;
            for (const term of terms) {
                const key = `${sessionForm.session}::${term}`;
                if (existing.has(key)) continue;
                await createAcademicSession({
                    schoolId,
                    session: sessionForm.session,
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
                title: 'Academic session created',
                message: `${created} term record(s) created for ${sessionForm.session}.`,
            });
            
            await loadData();
            setActiveTab('classes'); // Auto-navigate to classes tab
        } catch (error) {
            toast({ type: 'error', title: 'Session creation failed', message: error.message });
        } finally {
            setSavingSession(false);
        }
    }

    async function handleUpdateSession() {
        // Update existing session logic
        toast({ type: 'info', title: 'Coming soon', message: 'Session editing will be available soon.' });
    }

    async function handleSaveClasses() {
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
            setActiveTab('subjects'); // Auto-navigate to subjects tab
        } catch (error) {
            toast({ type: 'error', title: 'Class setup failed', message: error.message });
        } finally {
            setSavingClasses(false);
        }
    }

    async function handleApplyCombinations() {
        if (comboClassTargets.length === 0) {
            toast({ type: 'error', title: 'No target classes', message: 'Select target classes for subject combinations.' });
            return;
        }

        const resolvedClasses = classNames.filter((name) => 
            comboClassTargets.some((target) => name.startsWith(target))
        );
        if (resolvedClasses.length === 0) {
            toast({ type: 'error', title: 'No class match', message: 'Create matching classes first.' });
            return;
        }

        // Get existing subject codes to ensure uniqueness
        const existingCodes = new Set(subjects.map(s => s.code));
        
        const subjectRows = [];
        for (const template of templates) {
            const allowedClasses = template.classPrefix 
                ? resolvedClasses.filter((name) => name.startsWith(template.classPrefix))
                : resolvedClasses;
                
            for (const className of allowedClasses) {
                for (const subjectName of template.subjects) {
                    subjectRows.push({
                        className,
                        name: subjectName,
                        code: makeSubjectCode(subjectName, existingCodes),
                        staffId: '',
                    });
                    existingCodes.add(makeSubjectCode(subjectName, existingCodes));
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

    function addTemplate(templateType = 'custom') {
        const baseTemplates = defaultTemplates.filter(t => t.name !== 'General Subjects');
        const template = baseTemplates.find(t => t.name.toLowerCase().includes(templateType.toLowerCase())) || {
            name: 'Custom Template',
            classPrefix: '',
            subjects: []
        };
        setTemplates([...templates, { ...template, subjects: [...template.subjects] }]);
    }

    function removeTemplate(index) {
        setTemplates(templates.filter((_, i) => i !== index));
    }

    function updateTemplate(index, field, value) {
        setTemplates(templates.map((template, i) => 
            i === index ? { ...template, [field]: value } : template
        ));
    }

    // Home View - Current Session Display
    if (viewMode === 'home') {
        if (sessionGroups.length === 0) {
            return (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '60vh',
                    padding: '40px'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <School size={48} color="#3B82F6" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0, marginBottom: '12px' }}>
                        Create Your First Academic Session
                    </h2>
                    <p style={{ fontSize: '16px', color: '#6B7280', textAlign: 'center', marginBottom: '32px', maxWidth: '400px' }}>
                        Get started by creating your first academic session. This will be the foundation for managing your school's academic structure.
                    </p>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setViewMode('create')}
                        style={{ padding: '12px 32px', fontSize: '16px', fontWeight: 500 }}
                    >
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        Create Academic Session
                    </button>
                </div>
            );
        }

        return (
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#1F2937' }}>
                        Academics Setup
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280', margin: '8px 0 0 0' }}>
                        Manage your school's academic structure and settings.
                    </p>
                </div>

                {currentSession && (
                    <LiquidGlassPanel hover={false} style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, marginBottom: '8px' }}>
                                    {currentSession.session} Academic Session
                                </h2>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, marginBottom: '16px' }}>
                                    {currentSession.term} • {currentSession.isCurrent ? 'Active Session' : 'Inactive'}
                                </p>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>{classNames.length}</div>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Classes</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>{subjects.length}</div>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Subjects</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>{staff.length}</div>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Teachers</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    className="btn btn-glass"
                                    onClick={() => {
                                        setViewMode('edit');
                                        setActiveTab('sessions');
                                    }}
                                    style={{ padding: '8px 16px', fontSize: '14px' }}
                                >
                                    <Edit2 size={16} style={{ marginRight: '6px' }} />
                                    Edit Session
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setViewMode('create')}
                                    style={{ padding: '8px 16px', fontSize: '14px' }}
                                >
                                    <Plus size={16} style={{ marginRight: '6px' }} />
                                    New Session
                                </button>
                            </div>
                        </div>
                    </LiquidGlassPanel>
                )}

                <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                        All Academic Sessions
                    </h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {sessionGroups.map((session) => (
                            <div key={session.session} style={{
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                                        {session.session}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                                        {session.terms.join(', ')}
                                    </div>
                                </div>
                                {currentSession?.session === session.session && (
                                    <span style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#10B98120',
                                        color: '#10B981',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}>
                                        Current
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </LiquidGlassPanel>
            </div>
        );
    }

    // Create/Edit View
    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#1F2937' }}>
                        {viewMode === 'edit' ? 'Edit Academic Session' : 'Create Academic Session'}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#6B7280', margin: '8px 0 0 0' }}>
                        {viewMode === 'edit' ? 'Modify your academic structure and settings.' : 'Set up your academic structure in 3 simple steps.'}
                    </p>
                </div>
                <button 
                    className="btn btn-glass"
                    onClick={() => setViewMode('home')}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                    Cancel
                </button>
            </div>

            {/* Progress Indicator */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '32px',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#E5E7EB',
                    zIndex: 0
                }}>
                    <div style={{
                        width: activeTab === 'sessions' ? '0%' : activeTab === 'classes' ? '50%' : '100%',
                        height: '100%',
                        backgroundColor: '#3B82F6',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                {[
                    { id: 'sessions', label: 'Session', icon: Calendar },
                    { id: 'classes', label: 'Classes', icon: Users },
                    { id: 'subjects', label: 'Subjects', icon: BookOpen },
                ].map((step, index) => (
                    <div key={step.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 1,
                        backgroundColor: 'white',
                        padding: '0 8px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: activeTab === step.id ? '#3B82F6' : '#E5E7EB',
                            color: activeTab === step.id ? 'white' : '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px'
                        }}>
                            <step.icon size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: activeTab === step.id ? '#3B82F6' : '#6B7280' }}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ minHeight: '500px' }}>
                {/* Tab 1: Sessions & Terms */}
                {activeTab === 'sessions' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Create/Edit Session Form */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                {viewMode === 'edit' ? 'Session Details' : 'Create Academic Session'}
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
                                {viewMode === 'create' && (
                                    <FormField
                                        label="Set as current academic session"
                                        type="checkbox"
                                        value={sessionForm.isDefault}
                                        onChange={(value) => setSessionForm((current) => ({ ...current, isDefault: value }))}
                                    />
                                )}
                                <button 
                                    className="btn btn-primary" 
                                    onClick={viewMode === 'edit' ? handleUpdateSession : handleCreateSession} 
                                    disabled={savingSession}
                                    style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    {savingSession ? 'Saving...' : (viewMode === 'edit' ? 'Save Changes' : 'Create Session')}
                                </button>
                            </div>
                        </LiquidGlassPanel>

                        {/* Preview */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
                                Session Preview
                            </h3>
                            <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Session:</span>
                                    <span style={{ fontSize: '14px', fontWeight: 500, marginLeft: '8px' }}>
                                        {sessionForm.session || 'Not selected'}
                                    </span>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Terms:</span>
                                    <span style={{ fontSize: '14px', fontWeight: 500, marginLeft: '8px' }}>
                                        {sessionForm.termsCount || '3'} Terms
                                    </span>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>School Type:</span>
                                    <span style={{ fontSize: '14px', fontWeight: 500, marginLeft: '8px' }}>
                                        {sessionForm.schoolType === 'primary' ? 'Primary School' : 
                                         sessionForm.schoolType === 'secondary' ? 'Secondary School' : 'Combined'}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Terms to be created:</span>
                                    <div style={{ marginTop: '8px' }}>
                                        {TERM_LABELS.slice(0, parseInt(sessionForm.termsCount) || 3).map((term, index) => (
                                            <span key={index} style={{
                                                display: 'inline-block',
                                                padding: '4px 8px',
                                                backgroundColor: '#E5E7EB',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                marginRight: '6px',
                                                marginBottom: '4px'
                                            }}>
                                                {term}
                                            </span>
                                        ))}
                                    </div>
                                </div>
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
                                Configure Classes
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                        Base Classes
                                    </label>
                                    <ChipInput
                                        value={baseClasses}
                                        onChange={setBaseClasses}
                                        placeholder="Type class name and press Enter or Tab (e.g., JSS1)"
                                        suggestions={SCHOOL_CLASS_TEMPLATES[sessionForm.schoolType] || []}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                                        Class Arms / Categories
                                    </label>
                                    <ChipInput
                                        value={classArms}
                                        onChange={setClassArms}
                                        placeholder="Type arm and press Enter or Tab (e.g., A)"
                                        suggestions={['A', 'B', 'C', 'D', 'E']}
                                    />
                                </div>
                            </div>
                        </LiquidGlassPanel>

                        {/* Preview */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                                    Generated Classes ({generatedClasses.length})
                                </h3>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleSaveClasses} 
                                    disabled={savingClasses || generatedClasses.length === 0}
                                    style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 500 }}
                                >
                                    {savingClasses ? 'Saving...' : 'Save Classes'}
                                </button>
                            </div>
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
                                        color: '#374151',
                                        border: '1px solid #E5E7EB'
                                    }}>
                                        {className}
                                    </div>
                                ))}
                                {generatedClasses.length === 0 && (
                                    <div style={{ 
                                        gridColumn: '1 / -1', 
                                        textAlign: 'center', 
                                        padding: '40px', 
                                        color: '#9CA3AF' 
                                    }}>
                                        Add base classes and arms to generate combinations
                                    </div>
                                )}
                            </div>
                        </LiquidGlassPanel>
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
                            <ChipInput
                                value={comboClassTargets}
                                onChange={setComboClassTargets}
                                placeholder="Select classes to apply subjects to"
                                suggestions={classNames}
                            />
                        </LiquidGlassPanel>

                        {/* Subject Templates */}
                        <LiquidGlassPanel hover={false} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                                    Subject Templates
                                </h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        className="btn btn-glass btn-sm"
                                        onClick={() => addTemplate('sciences')}
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        + Sciences
                                    </button>
                                    <button 
                                        className="btn btn-glass btn-sm"
                                        onClick={() => addTemplate('arts')}
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        + Arts
                                    </button>
                                    <button 
                                        className="btn btn-glass btn-sm"
                                        onClick={() => addTemplate('social')}
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        + Social
                                    </button>
                                    <button 
                                        className="btn btn-glass btn-sm"
                                        onClick={() => addTemplate('humanities')}
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        + Humanities
                                    </button>
                                    <button 
                                        className="btn btn-glass btn-sm"
                                        onClick={() => addTemplate('custom')}
                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                    >
                                        + Custom
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {templates.map((template, index) => (
                                    <div key={index} style={{
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <input
                                                type="text"
                                                value={template.name}
                                                onChange={(e) => updateTemplate(index, 'name', e.target.value)}
                                                style={{
                                                    border: 'none',
                                                    outline: 'none',
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    backgroundColor: 'transparent'
                                                }}
                                            />
                                            {templates.length > 1 && (
                                                <button
                                                    onClick={() => removeTemplate(index)}
                                                    className="btn btn-glass btn-sm"
                                                    style={{ padding: '4px 8px' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#6B7280' }}>
                                                    Class Prefix (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={template.classPrefix}
                                                    onChange={(e) => updateTemplate(index, 'classPrefix', e.target.value)}
                                                    placeholder="e.g., SS"
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '6px',
                                                        fontSize: '13px'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#6B7280' }}>
                                                    Subjects
                                                </label>
                                                <ChipInput
                                                    value={template.subjects}
                                                    onChange={(subjects) => updateTemplate(index, 'subjects', subjects)}
                                                    placeholder="Add subjects"
                                                    suggestions={['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'Literature in English', 'Government', 'Economics', 'Commerce', 'CRS', 'Civic Education', 'History', 'Geography']}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                className="btn btn-primary" 
                                onClick={handleApplyCombinations} 
                                disabled={savingCombos || comboClassTargets.length === 0}
                                style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 500', marginTop: '20px' }}
                            >
                                {savingCombos ? 'Applying...' : 'Apply Subject Combinations'}
                            </button>
                        </LiquidGlassPanel>
                    </div>
                )}
            </div>
        </div>
    );
}
