import React, { useEffect, useState } from 'react';
import { Mail, Send, Users, Filter, Loader, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import { listClasses, sendBulkEmailToParents, sendSchoolAnnouncement } from '../../../../shared/utils/api.js';

export default function Communication() {
    const { schoolId } = useAuth();
    const toast = useToast();
    const [recipientType, setRecipientType] = useState('all_parents');
    const [selectedClass, setSelectedClass] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (!schoolId) return;
        listClasses(schoolId).then((response) => setClasses(response.documents)).catch(() => setClasses([]));
    }, [schoolId]);

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) return;
        if (recipientType === 'by_class' && !selectedClass) return;

        setSending(true);
        setResult(null);

        try {
            const response = recipientType === 'all_parents'
                ? await sendSchoolAnnouncement({ schoolId, subject, messageHtml: message })
                : await sendBulkEmailToParents({ schoolId, className: selectedClass, subject, messageHtml: message });
            setResult(response);
            toast({ type: 'success', title: 'Email dispatched', message: `${response.sent || response.totalRecipients || 0} recipient(s) processed.` });
        } catch (error) {
            toast({ type: 'error', title: 'Send failed', message: error.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Communication</h1>
                <p className="page-subtitle">Send emails to parents using the single deployed backend function URL.</p>
            </div>

            <div className="grid grid-2" style={{ gap: 24 }}>
                {/* Compose */}
                <LiquidGlassPanel hover={false} style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 24, color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={20} /> Compose Email
                    </h3>

                    {/* Recipient Type */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: 8 }}>
                            <Filter size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                            Recipients
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => { setRecipientType('all_parents'); setSelectedClass(''); }}
                                className={recipientType === 'all_parents' ? 'btn btn-primary btn-sm' : 'btn btn-glass btn-sm'}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <Users size={14} /> All Parents
                            </button>
                            <button
                                onClick={() => setRecipientType('by_class')}
                                className={recipientType === 'by_class' ? 'btn btn-primary btn-sm' : 'btn btn-glass btn-sm'}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <Filter size={14} /> Parents by Class
                            </button>
                        </div>
                    </div>

                    {/* Class selector */}
                    {recipientType === 'by_class' && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: 8 }}>Select Class</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', fontSize: 14,
                                        borderRadius: 12, border: '1px solid var(--color-gray-200)',
                                        background: 'var(--color-gray-50)', color: 'var(--color-gray-900)',
                                        appearance: 'none', cursor: 'pointer',
                                    }}
                                >
                                    <option value="">Choose a class...</option>
                                    {classes.map(c => <option key={c.$id} value={c.name}>{c.name}</option>)}
                                </select>
                                <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    )}

                    {/* Subject */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: 8 }}>Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email subject line..."
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: 14,
                                borderRadius: 12, border: '1px solid var(--color-gray-200)',
                                background: 'var(--color-gray-50)', color: 'var(--color-gray-900)',
                            }}
                        />
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: 8 }}>Message</label>
                        <textarea
                            rows={8}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here. Use {{studentName}} for the student's name and {{className}} for the class."
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: 14,
                                borderRadius: 12, border: '1px solid var(--color-gray-200)',
                                background: 'var(--color-gray-50)', color: 'var(--color-gray-900)',
                                resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
                            }}
                        />
                    </div>

                    {/* Send */}
                    <button
                        className="btn btn-primary"
                        onClick={handleSend}
                        disabled={sending || !subject.trim() || !message.trim()}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', fontSize: 15 }}
                    >
                        {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        {sending ? 'Sending...' : 'Send Email'}
                    </button>

                    {/* Result feedback */}
                    {result && (
                        <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--color-primary-700)', marginBottom: 4 }}>
                                <CheckCircle size={18} /> Emails dispatched
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                                {result.sent} sent successfully{result.failed > 0 ? `, ${result.failed} failed` : ''}
                            </div>
                        </div>
                    )}
                </LiquidGlassPanel>

                {/* Info panel */}
                <div>
                    <LiquidGlassPanel hover={false} style={{ padding: 32, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 16, color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircle size={20} style={{ color: 'var(--color-primary)' }} /> How it works
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: 'var(--color-gray-600)', lineHeight: 1.7 }}>
                            <p>Class options are loaded from the database, and emails are sent through the consolidated backend function using parent emails stored on student profiles.</p>
                            <p>You can use template variables in your message:</p>
                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                                <li><code style={{ background: 'var(--color-gray-100)', padding: '2px 6px', borderRadius: 4 }}>{'{{studentName}}'}</code> — Student's full name</li>
                                <li><code style={{ background: 'var(--color-gray-100)', padding: '2px 6px', borderRadius: 4 }}>{'{{className}}'}</code> — Student's class</li>
                            </ul>
                        </div>
                    </LiquidGlassPanel>

                    <LiquidGlassPanel hover={false} style={{ padding: 32 }}>
                        <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Communication Log</h3>
                        <div style={{ fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.7 }}>
                            No dedicated communication log collection is configured yet. Once you add one, this panel can read recent email history from the database instead of storing UI-only history.
                        </div>
                    </LiquidGlassPanel>
                </div>
            </div>
        </div>
    );
}
