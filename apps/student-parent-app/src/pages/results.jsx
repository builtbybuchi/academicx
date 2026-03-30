import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { getStudentPortalData, listSubjects } from 'shared/utils/api.js';

const gradeColors = { A: '#10B981', B: '#3B82F6', C: '#F59E0B', D: '#F97316', E: '#EF4444', F: '#DC2626' };

export default function Results() {
    const [data, setData] = useState(null);
    const [subjectsById, setSubjectsById] = useState({});

    useEffect(() => {
        let active = true;
        async function load() {
            const response = await getStudentPortalData();
            if (!active) return;
            setData(response);

            const subjectRes = await listSubjects(response.school?.$id, response.student?.className);
            if (!active) return;
            const map = subjectRes.documents.reduce((acc, subject) => ({ ...acc, [subject.$id]: subject.name }), {});
            setSubjectsById(map);
        }
        load();
        return () => {
            active = false;
        };
    }, []);

    const results = data?.results || [];
    const avg = results.length ? (results.reduce((s, r) => s + Number(r.totalScore || 0), 0) / results.length).toFixed(1) : '0.0';

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Results</h1>
                <p className="page-subtitle">{data?.term || '-'} {data?.session || ''} · {data?.student?.className || '-'}</p>
            </div>

            <div className="grid grid-3" style={{ marginBottom: 24 }}>
                <LiquidGlassPanel hover={false} style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{avg}%</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Term Average</div>
                </LiquidGlassPanel>
                <LiquidGlassPanel hover={false} style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#10B981' }}>5th</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Class Position</div>
                </LiquidGlassPanel>
                <LiquidGlassPanel hover={false} style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#3B82F6' }}>{results.length}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Subjects</div>
                </LiquidGlassPanel>
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Subject</th><th>CAT</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500, color: '#fff' }}>{subjectsById[r.subjectId] || r.subjectId}</td>
                                    <td>{r.catScore}</td><td>{r.examScore}</td>
                                    <td style={{ fontWeight: 700, color: '#fff' }}>{r.totalScore}</td>
                                    <td><span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${gradeColors[r.grade] || '#9CA3AF'}22`, color: gradeColors[r.grade] || '#9CA3AF' }}>{r.grade || '-'}</span></td>
                                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{r.remark || '-'}</td>
                                </tr>
                            ))}
                            {results.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>No result records available yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
