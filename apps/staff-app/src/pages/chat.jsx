import React, { useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';

const contacts = [
    { id: 'c1', name: 'John Admin', role: 'Administrator', initials: 'JA', online: true },
    { id: 'c2', name: 'Mr. Ahmed Bello', role: 'Mathematics', initials: 'AB', online: true },
    { id: 'c3', name: 'Mrs. Ngozi Okonkwo', role: 'English', initials: 'NO', online: false },
];

const sampleMessages = [
    { id: 'm1', sender: 'John Admin', text: 'Please submit SS2 results by Friday.', time: '10:30 AM', isOwn: false },
    { id: 'm2', sender: 'You', text: 'Sure, I\'ll have them ready by Thursday.', time: '10:32 AM', isOwn: true },
    { id: 'm3', sender: 'John Admin', text: 'Great. Also, there\'s a staff meeting tomorrow at 2 PM.', time: '10:35 AM', isOwn: false },
    { id: 'm4', sender: 'You', text: 'Noted, I\'ll be there. Thanks for the heads up!', time: '10:36 AM', isOwn: true },
];

export default function Chat() {
    const [activeContact, setActiveContact] = useState(contacts[0]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(sampleMessages);

    const send = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), sender: 'You', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isOwn: true }]);
        setInput('');
    };

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Chat</h1><p className="page-subtitle">Real-time messaging with staff & admin</p></div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, height: 'calc(100vh - 200px)' }}>
                {/* Contacts */}
                <LiquidGlassPanel hover={false} style={{ padding: 12, overflowY: 'auto' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', padding: '8px 8px 12px', letterSpacing: '0.05em' }}>Contacts</div>
                    {contacts.map(c => (
                        <button key={c.id} onClick={() => setActiveContact(c)} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, width: '100%',
                            border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                            background: activeContact.id === c.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                            color: activeContact.id === c.id ? '#93C5FD' : 'rgba(255,255,255,0.6)',
                            transition: 'all 200ms',
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', position: 'relative', flexShrink: 0 }}>
                                {c.initials}
                                {c.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #0F172A' }} />}
                            </div>
                            <div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 11, opacity: 0.5 }}>{c.role}</div></div>
                        </button>
                    ))}
                </LiquidGlassPanel>

                {/* Chat Area */}
                <LiquidGlassPanel hover={false} style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                            {activeContact.initials}
                        </div>
                        <div><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{activeContact.name}</div><div style={{ fontSize: 11, color: activeContact.online ? '#10B981' : 'rgba(255,255,255,0.4)' }}>{activeContact.online ? 'Online' : 'Offline'}</div></div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {messages.map(m => (
                            <div key={m.id} style={{ display: 'flex', justifyContent: m.isOwn ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
                                    background: m.isOwn ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : 'rgba(255,255,255,0.08)',
                                    borderBottomRightRadius: m.isOwn ? 4 : 16,
                                    borderBottomLeftRadius: m.isOwn ? 16 : 4,
                                }}>
                                    <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>{m.text}</div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                        <input className="input" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1 }} />
                        <button className="btn btn-primary" onClick={send}>Send</button>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
