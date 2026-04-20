import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import FormField from 'shared/components/FormField.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import { computeTotal, computeGrade, DEFAULT_GRADING } from 'shared/utils/index.js';
import { getStaffPortalData, submitResult } from 'shared/utils/api.js';
import { useAuth } from 'shared/utils/auth.jsx';
import { enqueueAction, flushQueue, getQueue, loadPortalData } from '../utils/local-first.js';

export default function ResultsEntry() {
    const toast = useToast();
    const { schoolId, profile } = useAuth();
    const [portalData, setPortalData] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [term, setTerm] = useState('');
    const [session, setSession] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncInfo, setSyncInfo] = useState({ pending: 0, lastSyncedAt: '' });
    const [scores, setScores] = useState({});

    const queueContext = useMemo(() => ({
        schoolId: schoolId || 'school',
        userId: profile?.$id || 'staff',
    }), [schoolId, profile?.$id]);

    const assignedClasses = useMemo(() => {
        const classes = [
            ...(portalData?.assignedClasses || []),
            ...(portalData?.formTeacherClasses || []),
            ...((portalData?.subjects || []).map((item) => item.className)),
        ];
        return [...new Set(classes)].filter(Boolean);
    }, [portalData]);

    const subjects = useMemo(() => {
        const rows = portalData?.subjects || [];
        if (!selectedClass) return [];
        return rows.filter((item) => item.className === selectedClass);
    }, [portalData, selectedClass]);

    const students = useMemo(() => {
        const rows = portalData?.students || [];
        if (!selectedClass || !selectedSubjectId) return [];
        return rows.filter((item) => item.className === selectedClass);
    }, [portalData, selectedClass, selectedSubjectId]);

    const loadingSkeleton = (
        <LiquidGlassPanel hover={false} style={{ padding: 20, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ height: 22, width: '42%', borderRadius: 999, background: 'rgba(148,163,184,0.16)' }} />
                <div style={{ height: 16, width: '58%', borderRadius: 999, background: 'rgba(148,163,184,0.12)' }} />
                {[...Array(5)].map((_, index) => (
                    <div key={index} style={{ height: 44, borderRadius: 12, background: 'rgba(148,163,184,0.1)' }} />
                ))}
            </div>
        </LiquidGlassPanel>
    );

    const refreshQueueInfo = () => {
        const pending = getQueue('results', queueContext).length;
        setSyncInfo((current) => ({ ...current, pending }));
    };

    async function syncQueuedResults() {
        if (!navigator.onLine) {
            refreshQueueInfo();
            return;
        }

        const outcome = await flushQueue('results', queueContext, async (payload) => {
            await submitResult(payload);
        });

        if (outcome.processed > 0) {
            setSyncInfo({ pending: outcome.remaining, lastSyncedAt: new Date().toISOString() });
            toast({
                type: 'success',
                title: 'Results synced',
                message: `${outcome.processed} queued result batch${outcome.processed > 1 ? 'es were' : ' was'} uploaded.`,
            });
            return;
        }

        refreshQueueInfo();
    }

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            try {
                const result = await loadPortalData({
                    schoolId,
                    userId: profile?.$id,
                    fetcher: () => getStaffPortalData(),
                });
                if (!active) return;
                setPortalData(result.data || null);
                setTerm(result.data?.currentTerm || 'First Term');
                setSession(result.data?.currentSession || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
                refreshQueueInfo();
                await syncQueuedResults();
            } catch (error) {
                if (!active) return;
                toast({ type: 'error', title: 'Could not load results form', message: error.message || 'Try again when network is available.' });
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => {
            active = false;
        };
    }, [schoolId, profile?.$id]);

    useEffect(() => {
        if (!selectedClass || subjects.some((item) => item.$id === selectedSubjectId)) return;
        setSelectedSubjectId('');
    }, [selectedClass, selectedSubjectId, subjects]);

    useEffect(() => {
        if (!selectedClass || !selectedSubjectId) {
            setScores({});
            return;
        }
        setScores((previous) => ({
            ...students.reduce((acc, item) => ({ ...acc, [item.$id]: previous[item.$id] || { cat: '', exam: '' } }), {}),
        }));
    }, [students, selectedClass, selectedSubjectId]);

    useEffect(() => {
        const handleOnline = () => {
            syncQueuedResults().catch(() => refreshQueueInfo());
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [queueContext.schoolId, queueContext.userId]);

    const update = (sid, field, val) => {
        setScores(prev => ({ ...prev, [sid]: { ...prev[sid], [field]: val } }));
    };

    const classOptions = assignedClasses.map((item) => ({ value: item, label: item }));

    const subjectOptions = subjects.map((item) => ({ value: item.$id, label: item.name }));

    async function saveResults(status) {
        if (!selectedClass || !selectedSubjectId) return;
        setSaving(true);
        try {
            const selectedSubject = subjects.find((item) => item.$id === selectedSubjectId);
            const rows = students
                .filter((item) => {
                    const sc = scores[item.$id] || {};
                    return sc.cat !== '' || sc.exam !== '';
                })
                .map((item) => {
                    const sc = scores[item.$id] || {};
                    const total = computeTotal(sc.cat, 0, sc.exam);
                    const gradeResult = computeGrade(total, DEFAULT_GRADING);
                    return {
                        studentId: item.$id,
                        subjectId: selectedSubjectId,
                        className: selectedClass,
                        term,
                        session,
                        catScore: Number(sc.cat || 0),
                        examScore: Number(sc.exam || 0),
                        totalScore: total,
                        grade: gradeResult.grade,
                        remark: gradeResult.remark,
                        status,
                        subjectName: selectedSubject?.name || '',
                    };
                });

            if (rows.length === 0) {
                toast({ type: 'error', title: 'No scores entered', message: 'Enter at least one CAT or Exam score before saving.' });
                return;
            }

            const payload = {
                schoolId,
                className: selectedClass,
                term,
                session,
                queuedAt: new Date().toISOString(),
                results: rows,
            };

            enqueueAction('results', queueContext, payload);
            refreshQueueInfo();
            await syncQueuedResults();

            if (!navigator.onLine) {
                toast({ type: 'success', title: 'Saved offline', message: 'Results are stored locally and will upload when network is back.' });
            } else {
                toast({ type: 'success', title: 'Results saved', message: status === 'submitted' ? 'Scores submitted successfully.' : 'Draft saved successfully.' });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Enter Results</h1><p className="page-subtitle">Enter CAT and Exam scores</p></div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap', width: 'min(100%, 460px)' }}>
                    <div style={{ minWidth: 200, flex: 1 }}>
                        <FormField label="" type="select" options={classOptions} value={selectedClass} onChange={setSelectedClass} placeholder="Select Class" />
                    </div>
                    <div style={{ minWidth: 220, flex: 1 }}>
                        <FormField label="" type="select" options={subjectOptions} value={selectedSubjectId} onChange={setSelectedSubjectId} placeholder="Select Subject" />
                    </div>
                </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 12 }}>
                {syncInfo.pending > 0 ? `${syncInfo.pending} result batch${syncInfo.pending > 1 ? 'es' : ''} waiting to sync.` : 'All result updates synced.'}
                {syncInfo.lastSyncedAt ? ` Last sync: ${new Date(syncInfo.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : ''}
            </div>

            {loading ? loadingSkeleton : (
                <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table className="table">
                        <thead>
                            <tr>
                                <th>Adm. No.</th><th>Student Name</th>
                                <th style={{ width: 80 }}>CAT (40)</th>
                                <th style={{ width: 80 }}>Exam (60)</th><th style={{ width: 70 }}>Total</th>
                                <th style={{ width: 60 }}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!selectedClass || !selectedSubjectId) && (
                                <tr>
                                    <td colSpan={6} style={{ color: 'var(--color-gray-500)', textAlign: 'center' }}>
                                        Select class and subject to load students.
                                    </td>
                                </tr>
                            )}
                            {selectedClass && selectedSubjectId && !loading && students.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ color: 'var(--color-gray-500)', textAlign: 'center' }}>
                                        No students found for the selected class.
                                    </td>
                                </tr>
                            )}
                            {students.map((s) => {
                                const sc = scores[s.$id] || { cat: '', exam: '' };
                                const total = computeTotal(sc.cat, 0, sc.exam);
                                const { grade } = computeGrade(total, DEFAULT_GRADING);
                                return (
                                    <tr key={s.$id}>
                                        <td><code style={{ color: '#93C5FD' }}>{s.admissionNumber}</code></td>
                                        <td>{s.firstName} {s.lastName}</td>
                                        <td><input className="input" type="number" min="0" max="40" value={sc.cat} onChange={e => update(s.$id, 'cat', e.target.value)} style={{ padding: '6px 8px' }} /></td>
                                        <td><input className="input" type="number" min="0" max="60" value={sc.exam} onChange={e => update(s.$id, 'exam', e.target.value)} style={{ padding: '6px 8px' }} /></td>
                                        <td style={{ fontWeight: 700, color: '#fff' }}>{total || '-'}</td>
                                        <td><span className="badge badge-primary">{total ? grade : '-'}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-glass" disabled={saving || !selectedClass || !selectedSubjectId} onClick={() => saveResults('draft')}>{saving ? 'Saving...' : 'Save Draft'}</button>
                        <button className="btn btn-primary" disabled={saving || !selectedClass || !selectedSubjectId} onClick={() => saveResults('submitted')}>{saving ? 'Submitting...' : 'Submit Results'}</button>
                    </div>
                </LiquidGlassPanel>
            )}
        </div>
    );
}
