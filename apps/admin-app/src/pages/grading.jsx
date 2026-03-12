import React, { useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { DEFAULT_GRADING } from '../../../../shared/utils/index.js';

export default function Grading() {
    const [scheme, setScheme] = useState(DEFAULT_GRADING);

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
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm">Edit Scheme</button>
                    <button className="btn btn-glass btn-sm">+ Create New Scheme</button>
                </div>
            </LiquidGlassPanel>

            <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Score Components</h3>
                <div className="grid grid-3">
                    <FormField label="CAT Weight (%)" type="number" value="20" />
                    <FormField label="Mock Weight (%)" type="number" value="20" />
                    <FormField label="Exam Weight (%)" type="number" value="60" />
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Save Weights</button>
            </LiquidGlassPanel>
        </div>
    );
}
