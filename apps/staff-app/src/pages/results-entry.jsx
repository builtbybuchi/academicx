import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import FormField from 'shared/components/FormField.jsx';
import { computeTotal, computeGrade, DEFAULT_GRADING } from 'shared/utils/index.js';
import { getStaffPortalData, submitResult } from 'shared/utils/api.js';
import { useAuth } from 'shared/utils/auth.jsx';

export default function ResultsEntry() {
    const { schoolId } = useAuth();
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [term, setTerm] = useState('');
    const [session, setSession] = useState('');
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [saving, setSaving] = useState(false);
    const [scores, setScores] = useState(
        {}
    );

    useEffect(() => {
        let active = true;
        async function load() {
            const data = await getStaffPortalData();
            if (!active) return;
            setTerm(data.currentTerm || 'First Term');
            setSession(data.currentSession || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
            const className = data.assignedClasses?.[0] || '';
            setSelectedClass(className);
            const filteredStudents = (data.students || []).filter((item) => item.className === className || !className);
            const filteredSubjects = (data.subjects || []).filter((item) => item.className === className || !className);
            setStudents(filteredStudents);
            setSubjects(filteredSubjects);
            setSelectedSubjectId(filteredSubjects[0]?.$id || '');
            setScores(filteredStudents.reduce((acc, item) => ({ ...acc, [item.$id]: { cat: '', exam: '' } }), {}));
        }
        load();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedClass) return;
        getStaffPortalData().then((data) => {
            const filteredStudents = (data.students || []).filter((item) => item.className === selectedClass);
            const filteredSubjects = (data.subjects || []).filter((item) => item.className === selectedClass);
            setStudents(filteredStudents);
            setSubjects(filteredSubjects);
            if (!filteredSubjects.some((item) => item.$id === selectedSubjectId)) {
                setSelectedSubjectId(filteredSubjects[0]?.$id || '');
            }
            setScores((previous) => ({
                ...filteredStudents.reduce((acc, item) => ({ ...acc, [item.$id]: previous[item.$id] || { cat: '', exam: '' } }), {}),
            }));
        });
    }, [selectedClass, selectedSubjectId]);

    const update = (sid, field, val) => {
        setScores(prev => ({ ...prev, [sid]: { ...prev[sid], [field]: val } }));
    };

    const classOptions = useMemo(() => {
        const classes = [...new Set(students.map((item) => item.className).filter(Boolean))];
        if (selectedClass && !classes.includes(selectedClass)) classes.unshift(selectedClass);
        return classes.map((item) => ({ value: item, label: item }));
    }, [students, selectedClass]);

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

            await submitResult({ schoolId, className: selectedClass, term, session, results: rows });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Enter Results</h1><p className="page-subtitle">Enter CAT and Exam scores</p></div>
                <div className="flex gap-2">
                    <FormField label="" type="select" options={classOptions} value={selectedClass} onChange={setSelectedClass} placeholder="Select Class" />
                    <FormField label="" type="select" options={subjectOptions} value={selectedSubjectId} onChange={setSelectedSubjectId} placeholder="Select Subject" />
                </div>
            </div>

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
                            {students.map(s => {
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
                    <button className="btn btn-glass" disabled={saving} onClick={() => saveResults('draft')}>{saving ? 'Saving...' : 'Save Draft'}</button>
                    <button className="btn btn-primary" disabled={saving} onClick={() => saveResults('submitted')}>{saving ? 'Submitting...' : 'Submit Results'}</button>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
