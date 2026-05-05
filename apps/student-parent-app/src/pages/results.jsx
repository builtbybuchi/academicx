import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import { getStudentPortalData, listSubjects } from 'shared/utils/api.js';
import ReportCard from '../components/ReportCard.jsx';

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

    if (data && results.length === 0) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">My Results</h1>
                    <p className="page-subtitle">{data?.term || '-'} {data?.session || ''} · {data?.student?.className || '-'}</p>
                </div>
                <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 20 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
                    <h2 style={{ color: '#fff', marginBottom: 8 }}>Results Not Yet Published</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 400, margin: '0 auto' }}>
                        Your results for this term have not been published by the school administration yet. Please check back later or contact your class teacher.
                    </p>
                </div>
            </div>
        );
    }

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

            <ReportCard data={data} subjectsById={subjectsById} school={data?.school} />
        </div>
    );
}
