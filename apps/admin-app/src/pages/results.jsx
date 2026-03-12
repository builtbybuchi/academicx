import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../../../../shared/components/DataTable.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import { approveResults, generateBroadsheet, getSchool, listResults, listStudents, listSubjects } from '../../../../shared/utils/api.js';

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
            toast({ type: 'success', title: 'Broadsheet ready', message: `${data.students.length} student rows generated for ${classFilter}.` });
        } catch (error) {
            toast({ type: 'error', title: 'Generation failed', message: error.message });
        } finally {
            setWorking(false);
        }
    };

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

            <DataTable columns={columns} data={filtered} />
        </div>
    );
}
