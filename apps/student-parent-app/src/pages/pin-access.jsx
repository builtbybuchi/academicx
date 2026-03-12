import React, { useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';

export default function PinAccess() {
    const [pin, setPin] = useState('');
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = () => {
        if (pin.length < 8) { setError('PIN must be at least 8 characters'); return; }
        // Stub: accept any PIN for demo
        setError('');
        setVerified(true);
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">PIN Access</h1><p className="page-subtitle">Enter your PIN code to access results</p></div>

            {!verified ? (
                <div style={{ maxWidth: 480, margin: '0 auto', marginTop: 40 }}>
                    <LiquidGlassPanel variant="strong" style={{ padding: 40, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Enter Result PIN</h3>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
                            Enter the unique PIN code provided by your school to view your results.
                        </p>
                        <FormField label="PIN Code" placeholder="e.g. AX7K9M2NP4" value={pin} onChange={setPin} error={error} />
                        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} onClick={handleVerify}>
                            Verify PIN
                        </button>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 16 }}>
                            PINs are time-bound. Contact your school admin if your PIN has expired.
                        </p>
                    </LiquidGlassPanel>
                </div>
            ) : (
                <div>
                    <LiquidGlassPanel hover={false} style={{ padding: 24, marginBottom: 24, textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                        <h3 style={{ fontSize: 18, marginBottom: 4 }}>PIN Verified Successfully</h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                            Showing results for: <strong style={{ color: '#fff' }}>Adebayo Oluwaseun</strong> · JSS1A · First Term 2025/2026
                        </p>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel hover={false} style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Subject</th><th>CAT</th><th>Mock</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead>
                                <tbody>
                                    {[
                                        { s: 'Mathematics', c: 18, m: 16, e: 52, t: 86, g: 'A' },
                                        { s: 'English', c: 15, m: 14, e: 45, t: 74, g: 'A' },
                                        { s: 'Physics', c: 12, m: 10, e: 38, t: 60, g: 'B' },
                                        { s: 'Biology', c: 14, m: 12, e: 30, t: 56, g: 'C' },
                                    ].map((r, i) => (
                                        <tr key={i}><td>{r.s}</td><td>{r.c}</td><td>{r.m}</td><td>{r.e}</td><td style={{ fontWeight: 700, color: '#fff' }}>{r.t}</td><td><span className="badge badge-primary">{r.g}</span></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </LiquidGlassPanel>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <button className="btn btn-glass" onClick={() => { setVerified(false); setPin(''); }}>Check Another PIN</button>
                    </div>
                </div>
            )}
        </div>
    );
}
