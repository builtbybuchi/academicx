import React, { useEffect, useMemo, useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import { listChatMessages, sendChatMessage, subscribeToChatMessages } from '../../../../shared/utils/api.js';
import { useAuth } from '../../../../shared/utils/auth.jsx';

export default function Chat() {
    const { profile, schoolId } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [sending, setSending] = useState(false);
    const [channel, setChannel] = useState('general');

    useEffect(() => {
        let unsub = null;
        async function load() {
            const response = await listChatMessages(schoolId, channel, 100);
            const docs = response.documents || [];
            setMessages(docs.sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt)));
            unsub = subscribeToChatMessages(schoolId, channel, (message) => {
                setMessages((prev) => {
                    if (prev.some((item) => item.$id === message.$id)) return prev;
                    return [...prev, message].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
                });
            });
        }
        if (schoolId) load();
        return () => {
            if (typeof unsub === 'function') unsub();
        };
    }, [schoolId, channel]);

    const channels = useMemo(() => (['general', 'admins', 'teachers']), []);

    const send = async () => {
        if (!input.trim()) return;
        setSending(true);
        try {
            await sendChatMessage(
                schoolId,
                profile?.$id || '',
                `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User',
                profile?.role || 'staff',
                input.trim(),
                channel
            );
            setInput('');
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Chat</h1><p className="page-subtitle">Real-time messaging with staff & admin</p></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, height: 'calc(100vh - 200px)' }}>
                <LiquidGlassPanel hover={false} style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>School Channel</div>
                        <select className="input" value={channel} onChange={(event) => setChannel(event.target.value)} style={{ width: 180 }}>
                            {channels.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>

                    <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {messages.map(m => {
                            const isOwn = m.senderId === (profile?.$id || profile?.authId);
                            return (
                            <div key={m.$id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
                                    background: isOwn ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : 'rgba(255,255,255,0.08)',
                                    borderBottomRightRadius: isOwn ? 4 : 16,
                                    borderBottomLeftRadius: isOwn ? 16 : 4,
                                }}>
                                    {!isOwn && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{m.senderName}</div>}
                                    <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>{m.message}</div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        )})}
                    </div>

                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                        <input className="input" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1 }} />
                        <button className="btn btn-primary" onClick={send} disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
