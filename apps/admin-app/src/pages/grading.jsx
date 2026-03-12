import React, { useEffect, useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import { DEFAULT_GRADING } from '../../../../shared/utils/index.js';
import { getGradingScheme, saveGradingScheme } from '../../../../shared/utils/api.js';

export default function Grading() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [schemeId, setSchemeId] = useState('');
    const [scheme, setScheme] = useState(DEFAULT_GRADING);
    const [catWeight, setCatWeight] = useState('30');
    const [examWeight, setExamWeight] = useState('70');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!schoolId) return;

        let active = true;
        async function load() {
            const current = await getGradingScheme(schoolId);
            if (!active || !current) return;

            setSchemeId(current.$id);
            setCatWeight(String(current.catWeight ?? 30));
            setExamWeight(String(current.examWeight ?? 70));

            try {
                const parsed = current.ranges ? JSON.parse(current.ranges) : DEFAULT_GRADING;
                setScheme(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GRADING);
            } catch {
                setScheme(DEFAULT_GRADING);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [schoolId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await saveGradingScheme(schoolId, {
                name: 'Default Scheme',
                ranges: JSON.stringify(scheme),
                catWeight: Number(catWeight),
                examWeight: Number(examWeight),
            }, schemeId || undefined);
            toast({ type: 'success', title: 'Grading saved', message: 'The grading scheme was saved to the database.' });
        } catch (error) {
            toast({ type: 'error', title: 'Save failed', message: error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Grading Schemes</h1><p className="page-subtitle">Configure how grades are calculated</p></div>

            <LiquidGlassPanel hover={false} style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Default Grading Scheme</h3>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Min Score</th><th>Max Score</th><th>Grade</th><th>Remark</th></tr></thead>
                        <tbody>
                            {scheme.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.min}</td>
                                    <td>{r.max}</td>
                                    <td><span className="badge badge-primary">{r.grade}</span></td>
                                    <td>{r.remark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </LiquidGlassPanel>

            <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Score Components</h3>
                <div className="grid grid-2">
                    <FormField label="CAT Weight (%)" type="number" value={catWeight} onChange={setCatWeight} />
                    <FormField label="Exam Weight (%)" type="number" value={examWeight} onChange={setExamWeight} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                    The current schema stores CAT and Exam only. Mock scores were removed because they are not part of the database model.
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Weights'}</button>
            </LiquidGlassPanel>
        </div>
    );
}
