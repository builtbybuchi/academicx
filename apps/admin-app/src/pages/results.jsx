import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'shared/components/DataTable.jsx';
import Modal from 'shared/components/Modal.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import { useAuth } from 'shared/utils/auth.jsx';
import { approveResults, generateBroadsheet, getSchool, listResults, listStudents, listSubjects, invokeBackendFunction } from 'shared/utils/api.js';

export default function Results() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [statusFilter, setStatusFilter] = useState('all');
    const [classFilter, setClassFilter] = useState('all');
    const [school, setSchool] = useState(null);
    const [results, setResults] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [working, setWorking] = useState(false);
    const [publishModalOpen, setPublishModalOpen] = useState(false);

    async function loadData() {
        if (!schoolId) return;
        const [schoolDoc, resultRes, studentRes, subjectRes] = await Promise.all([
            getSchool(schoolId),
            listResults(schoolId),
            listStudents(schoolId),
            listSubjects(schoolId),
        ]);
        setSchool(schoolDoc);
        setResults(resultRes.documents);
        setStudents(studentRes.documents);
        setSubjects(subjectRes.documents);
    }

    useEffect(() => {
        loadData();
    }, [schoolId]);

    const studentMap = useMemo(() => Object.fromEntries(students.map((item) => [item.$id, `${item.firstName} ${item.lastName}`])), [students]);
    const subjectMap = useMemo(() => Object.fromEntries(subjects.map((item) => [item.$id, item.name])), [subjects]);
    const classOptions = useMemo(() => ['all', ...new Set(results.map((item) => item.className).filter(Boolean))], [results]);
    const columns = [
        { key: 'student', label: 'Student' },
        { key: 'className', label: 'Class' },
        { key: 'subject', label: 'Subject' },
        { key: 'catScore', label: 'CAT' },
        { key: 'examScore', label: 'Exam' },
        { key: 'totalScore', label: 'Total' },
        { key: 'grade', label: 'Grade', render: (value) => <span className="badge badge-primary">{value}</span> },
        { key: 'status', label: 'Status', render: (value) => <span className={`badge badge-${value === 'approved' ? 'success' : 'warning'}`}>{value}</span> },
    ];

    const tableRows = useMemo(() => results.map((item) => ({
        id: item.$id,
        student: studentMap[item.studentId] || item.studentId,
        className: item.className,
        subject: subjectMap[item.subjectId] || item.subjectId,
        catScore: item.catScore ?? 0,
        examScore: item.examScore ?? 0,
        totalScore: item.totalScore ?? 0,
        grade: item.grade || '-',
        status: item.status,
        term: item.term,
        session: item.session,
    })), [results, studentMap, subjectMap]);

    const filtered = tableRows.filter((item) => {
        const statusMatch = statusFilter === 'all' || item.status === statusFilter;
        const classMatch = classFilter === 'all' || item.className === classFilter;
        return statusMatch && classMatch;
    });

    const handleApprove = async () => {
        const pendingGroups = [...new Set(filtered.filter((item) => item.status !== 'approved').map((item) => `${item.className}|${item.term}|${item.session}`))];
        if (pendingGroups.length === 0) {
            toast({ type: 'info', title: 'Nothing to approve', message: 'There are no pending result groups in the current view.' });
            return;
        }

        try {
            setWorking(true);
            await Promise.all(pendingGroups.map((group) => {
                const [className, term, session] = group.split('|');
                return approveResults({ schoolId, className, term, session });
            }));
            await loadData();
            toast({ type: 'success', title: 'Results approved', message: `${pendingGroups.length} result group(s) were approved.` });
        } catch (error) {
            toast({ type: 'error', title: 'Approval failed', message: error.message });
        } finally {
            setWorking(false);
        }
    };

    const handleBroadsheet = async () => {
        if (classFilter === 'all') {
            toast({ type: 'warning', title: 'Select one class', message: 'Choose a class before generating a broadsheet.' });
            return;
        }

        try {
            setWorking(true);
            const data = await generateBroadsheet({ schoolId, className: classFilter, term: school?.currentTerm || filtered[0]?.term, session: school?.currentSession || filtered[0]?.session });
            const rowCount = Array.isArray(data) ? data.length : (Array.isArray(data?.students) ? data.students.length : 0);
            toast({ type: 'success', title: 'Broadsheet ready', message: `${rowCount} student rows generated for ${classFilter}.` });
        } catch (error) {
            toast({ type: 'error', title: 'Generation failed', message: error.message });
        } finally {
            setWorking(false);
        }
    };

    const handlePublish = async () => {
        const approvedGroups = [...new Set(filtered.filter((item) => item.status === 'approved').map((item) => `${item.className}|${item.term}|${item.session}`))];
        if (approvedGroups.length === 0) {
            toast({ type: 'info', title: 'Nothing to publish', message: 'There are no approved result groups in the current view to publish.' });
            return;
        }

        try {
            setWorking(true);
            await Promise.all(approvedGroups.map((group) => {
                const [className, term, session] = group.split('|');
                return invokeBackendFunction('publishResults', { schoolId, className, term, session });
            }));
            await loadData();
            setPublishModalOpen(false);
            toast({ type: 'success', title: 'Results published', message: `${approvedGroups.length} result group(s) were published. Students can now view their results.` });
        } catch (error) {
            toast({ type: 'error', title: 'Publish failed', message: error.message });
        } finally {
            setWorking(false);
        }
    };

    // Calculate publish status for each result group
    const resultGroups = useMemo(() => {
        const groups = {};
        results.forEach((item) => {
            const key = `${item.className}|${item.term}|${item.session}`;
            if (!groups[key]) {
                groups[key] = {
                    className: item.className,
                    term: item.term,
                    session: item.session,
                    total: 0,
                    approved: 0,
                    published: Boolean(item.published || item.isPublished),
                };
            }
            groups[key].total++;
            if (item.status === 'approved') {
                groups[key].approved++;
            }
        });
        return Object.values(groups);
    }, [results]);

    const allApproved = resultGroups.length > 0 && resultGroups.every(g => g.approved === g.total);
    const anyPublished = resultGroups.some(g => g.published);

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div><h1 className="page-title">Results</h1><p className="page-subtitle">Review and approve student results</p></div>
                <div className="flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={handleApprove} disabled={working}>✓ Approve Pending</button>
                    <button className="btn btn-glass btn-sm" onClick={handleBroadsheet} disabled={working}>📄 Generate Broadsheet</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {['all', 'submitted', 'approved'].map(f => (
                    <button key={f} className={`btn ${statusFilter === f ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setStatusFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {classOptions.map((value) => (
                    <button key={value} className={`btn ${classFilter === value ? 'btn-primary' : 'btn-glass'} btn-sm`} onClick={() => setClassFilter(value)}>
                        {value === 'all' ? 'All Classes' : value}
                    </button>
                ))}
            </div>

            {/* Publish Status Panel */}
            <div style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, color: '#fff' }}>Result Publication Status</h3>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                            {resultGroups.length} result group(s) • {allApproved ? 'All approved and ready to publish' : `${resultGroups.filter(g => g.approved === g.total).length} ready for publication`}
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setPublishModalOpen(true)}
                        disabled={working || !allApproved || resultGroups.length === 0}
                        style={{ opacity: (!allApproved || resultGroups.length === 0) ? 0.5 : 1 }}
                    >
                        {anyPublished ? '🔄 Update Publication' : '📢 Publish Results'}
                    </button>
                </div>
                {resultGroups.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {resultGroups.slice(0, 5).map((group, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    background: group.published ? 'rgba(16, 185, 129, 0.2)' : group.approved === group.total ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                    color: group.published ? '#10B981' : group.approved === group.total ? '#3B82F6' : '#F59E0B',
                                    border: `1px solid ${group.published ? '#10B981' : group.approved === group.total ? '#3B82F6' : '#F59E0B'}`
                                }}
                            >
                                {group.className} • {group.approved}/{group.total} approved {group.published && '• Published'}
                            </div>
                        ))}
                        {resultGroups.length > 5 && (
                            <div style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                                +{resultGroups.length - 5} more
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DataTable columns={columns} data={filtered} />

            {/* Publish Results Modal */}
            <Modal
                open={publishModalOpen}
                onClose={() => setPublishModalOpen(false)}
                title="Publish Results"
                footer={
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button className="btn btn-glass btn-sm" onClick={() => setPublishModalOpen(false)} disabled={working}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handlePublish}
                            disabled={working || !allApproved}
                        >
                            {working ? 'Publishing...' : '📢 Publish Results'}
                        </button>
                    </div>
                }
            >
                <div style={{ padding: '10px 0' }}>
                    <p style={{ fontSize: 14, marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>
                        Publishing results will make them visible to students. Once published, students can view their results through their portal.
                    </p>
                    <div style={{ marginBottom: 16 }}>
                        <h4 style={{ fontSize: 14, marginBottom: 8, color: '#fff' }}>Result Groups to be Published:</h4>
                        {resultGroups.length === 0 ? (
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>No result groups available.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {resultGroups.map((group, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            background: 'rgba(255,255,255,0.05)',
                                            fontSize: 13
                                        }}
                                    >
                                        <span style={{ color: '#fff' }}>{group.className} • {group.term} • {group.session}</span>
                                        <span style={{
                                            color: group.approved === group.total ? '#10B981' : '#F59E0B',
                                            fontWeight: 500
                                        }}>
                                            {group.approved === group.total ? '✓ Ready' : `${group.approved}/${group.total} approved`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {!allApproved && (
                        <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#F59E0B' }}>
                                ⚠️ Some result groups are not fully approved. Please approve all results before publishing.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
