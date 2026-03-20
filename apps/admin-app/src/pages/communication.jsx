import React, { useEffect, useState } from 'react';
import { Mail, Send, Users, Filter, Loader, CheckCircle, AlertCircle, ChevronDown, XCircle, Clock } from 'lucide-react';
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
    const [emailHistory, setEmailHistory] = useState([]);

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

            // Check for delivery issues
            if (response.success === false) {
                throw new Error(response.error || 'Email sending failed');
            }

            setResult(response);

            // Add to email history
            const historyEntry = {
                id: Date.now(),
                subject,
                recipientType: recipientType === 'all_parents' ? 'All Parents' : `Class: ${selectedClass}`,
                recipients: response.sent || response.totalRecipients || 0,
                failed: response.failed || 0,
                status: response.previewOnly ? 'preview' : (response.failed > 0 ? 'partial' : 'sent'),
                timestamp: new Date().toISOString(),
                error: response.errorMessage || null,
            };
            setEmailHistory(prev => [historyEntry, ...prev]);

            if (response.previewOnly) {
                toast({ type: 'warning', title: 'Email Service Not Configured', message: 'Email service is not configured. Please contact support to set up email delivery.' });
            } else if (response.failed > 0) {
                toast({ type: 'warning', title: 'Partial Delivery', message: `${response.sent} sent, ${response.failed} failed. Check email configuration.` });
            } else {
                toast({ type: 'success', title: 'Email dispatched', message: `${response.sent || response.totalRecipients || 0} recipient(s) processed.` });
            }
        } catch (error) {
            const errorMsg = error.message || 'Failed to send emails';
            setResult({ error: errorMsg, success: false });

            // Add failed entry to history
            const historyEntry = {
                id: Date.now(),
                subject,
                recipientType: recipientType === 'all_parents' ? 'All Parents' : `Class: ${selectedClass}`,
                recipients: 0,
                failed: 0,
                status: 'failed',
                timestamp: new Date().toISOString(),
                error: errorMsg,
            };
            setEmailHistory(prev => [historyEntry, ...prev]);

            toast({ type: 'error', title: 'Send failed', message: errorMsg });
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
                        <div style={{
                            marginTop: 16,
                            padding: 16,
                            borderRadius: 12,
                            background: result.error ? '#FEE2E2' : result.previewOnly ? '#FEF3C7' : result.failed > 0 ? '#FEF3C7' : '#DCFCE7',
                            border: `1px solid ${result.error ? '#FECACA' : result.previewOnly ? '#FDE68A' : result.failed > 0 ? '#FDE68A' : '#BBF7D0'}`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontWeight: 600,
                                color: result.error ? '#DC2626' : result.previewOnly ? '#D97706' : result.failed > 0 ? '#D97706' : '#166534',
                                marginBottom: 4
                            }}>
                                {result.error ? <XCircle size={18} /> : result.previewOnly ? <AlertCircle size={18} /> : result.failed > 0 ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                {result.error ? 'Email sending failed' : result.previewOnly ? 'Preview Mode - Email not sent' : result.failed > 0 ? 'Partial Delivery' : 'Emails dispatched'}
                            </div>
                            <div style={{ fontSize: 13, color: result.error ? '#7F1D1D' : result.previewOnly ? '#92400E' : result.failed > 0 ? '#92400E' : '#166534' }}>
                                {result.error
                                    ? result.error
                                    : result.previewOnly
                                        ? 'Email service not configured. Contact support to enable email delivery.'
                                        : `${result.sent || 0} sent successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`
                                }
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
                        <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--color-gray-900)' }}>Email History</h3>
                        {emailHistory.length === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--color-gray-500)', textAlign: 'center', padding: 20 }}>
                                <Clock size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                                No emails sent yet.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                                {emailHistory.map((entry) => (
                                    <div key={entry.id} style={{
                                        padding: 12,
                                        borderRadius: 8,
                                        background: entry.status === 'failed' ? '#FEE2E2' : entry.status === 'preview' ? '#FEF3C7' : entry.status === 'partial' ? '#FEF3C7' : '#DCFCE7',
                                        border: `1px solid ${entry.status === 'failed' ? '#FECACA' : entry.status === 'preview' ? '#FDE68A' : entry.status === 'partial' ? '#FDE68A' : '#BBF7D0'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: entry.status === 'failed' ? '#7F1D1D' : entry.status === 'preview' || entry.status === 'partial' ? '#92400E' : '#166534' }}>
                                                {entry.subject}
                                            </div>
                                            <div style={{
                                                fontSize: 11,
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                background: entry.status === 'failed' ? '#FECACA' : entry.status === 'preview' ? '#FDE68A' : entry.status === 'partial' ? '#FDE68A' : '#BBF7D0',
                                                color: entry.status === 'failed' ? '#991B1B' : entry.status === 'preview' || entry.status === 'partial' ? '#92400E' : '#166534'
                                            }}>
                                                {entry.status === 'sent' ? 'Sent' : entry.status === 'partial' ? 'Partial' : entry.status === 'preview' ? 'Preview' : 'Failed'}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                                            {entry.recipientType} • {new Date(entry.timestamp).toLocaleString()}
                                        </div>
                                        {entry.status !== 'failed' && (
                                            <div style={{ fontSize: 12, color: entry.status === 'preview' ? '#92400E' : '#166534', marginTop: 4 }}>
                                                {entry.recipients} recipient{entry.recipients !== 1 ? 's' : ''}
                                                {entry.failed > 0 && ` • ${entry.failed} failed`}
                                            </div>
                                        )}
                                        {entry.error && (
                                            <div style={{ fontSize: 11, color: '#991B1B', marginTop: 4 }}>
                                                Error: {entry.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </LiquidGlassPanel>
                </div>
            </div>
        </div>
    );
}
