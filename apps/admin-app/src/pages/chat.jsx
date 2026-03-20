import React, { useEffect, useMemo, useRef, useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import { listChatMessages, sendChatMessage, subscribeToChatMessages, listStaff } from '../../../../shared/utils/api.js';
import { useAuth } from '../../../../shared/utils/auth.jsx';
import { useRxDB } from '../utils/rxdb-hooks.jsx';
import { upsertDocument } from '../utils/rxdb.js';
import { Search, MessageSquare, X, Hash, User } from 'lucide-react';

export default function AdminChat() {
    const { profile, schoolId } = useAuth();
    const { db } = useRxDB();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [sending, setSending] = useState(false);
    const [channel, setChannel] = useState('general');
    const [staff, setStaff] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showStaffPicker, setShowStaffPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const staffPickerRef = useRef(null);
    const subscriptionRef = useRef(null);

    // Load staff list for individual messaging
    useEffect(() => {
        if (!schoolId) return;
        listStaff(schoolId).then((res) => {
            setStaff(res.documents || []);
        }).catch(() => setStaff([]));
    }, [schoolId]);

    // Close staff picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (staffPickerRef.current && !staffPickerRef.current.contains(event.target)) {
                setShowStaffPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reactive RxDB query for messages
    useEffect(() => {
        if (!db || !schoolId) return;

        // Cleanup previous subscription
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        const targetChannel = selectedRecipient 
            ? `dm:${[profile?.$id, selectedRecipient.$id].sort().join(':')}` 
            : channel;

        const collection = db.chatMessages;
        const query = collection.find({
            selector: { 
                schoolId,
                channel: targetChannel
            }
        });

        // Initial load from RxDB
        query.exec().then(docs => {
            const sorted = docs
                .map(d => d.toMutableJSON())
                .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
            setMessages(sorted);
        });

        // Subscribe to real-time changes
        subscriptionRef.current = query.$.subscribe(docs => {
            const sorted = docs
                .map(d => d.toMutableJSON())
                .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
            setMessages(sorted);
        });

        // Sync with Appwrite in background
        listChatMessages(schoolId, targetChannel, 100).then(response => {
            const docs = response.documents || [];
            const docsWithSync = docs.map(doc => ({ ...doc, synced: true }));
            if (docsWithSync.length > 0) {
                collection.bulkUpsert(docsWithSync);
            }
        }).catch(console.error);

        // Subscribe to Appwrite real-time for new messages
        const unsub = subscribeToChatMessages(schoolId, targetChannel, (message) => {
            upsertDocument('chatMessages', { ...message, synced: true });
        });

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            if (typeof unsub === 'function') unsub();
        };
    }, [db, schoolId, channel, selectedRecipient, profile?.$id]);

    const channels = useMemo(() => (['general', 'admins', 'teachers']), []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredStaff = useMemo(() => {
        if (!searchQuery.trim()) return staff.filter(s => s.$id !== profile?.$id);
        const query = searchQuery.toLowerCase();
        return staff.filter(s =>
            s.$id !== profile?.$id &&
            (`${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
             s.staffId?.toLowerCase().includes(query) ||
             s.department?.toLowerCase().includes(query))
        );
    }, [staff, searchQuery, profile?.$id]);

    const send = async () => {
        if (!input.trim() || sending || !db) return;
        const messageText = input.trim();
        setInput('');
        setSending(true);
        
        const targetChannel = selectedRecipient 
            ? `dm:${[profile?.$id, selectedRecipient.$id].sort().join(':')}` 
            : channel;
        
        // Optimistically add to RxDB immediately
        const optimisticMessage = {
            $id: `temp-${Date.now()}`,
            schoolId,
            senderId: profile?.$id || profile?.authId,
            senderName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Admin',
            senderRole: profile?.role || 'admin',
            message: messageText,
            channel: targetChannel,
            createdAt: new Date().toISOString(),
            synced: false,
        };
        
        try {
            await upsertDocument('chatMessages', optimisticMessage);
            
            await sendChatMessage(
                schoolId,
                profile?.$id || '',
                optimisticMessage.senderName,
                profile?.role || 'admin',
                messageText,
                targetChannel
            );
            
            // Mark as synced
            await upsertDocument('chatMessages', { ...optimisticMessage, synced: true });
        } catch (error) {
            console.error('Failed to send message:', error);
            // Mark as failed
            await upsertDocument('chatMessages', { ...optimisticMessage, failed: true, error: error.message });
        } finally {
            setSending(false);
        }
    };

    const isDirectMessage = !!selectedRecipient;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Chat</h1>
                <p className="page-subtitle">Real-time messaging with staff and administrators</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: 'calc(100vh - 200px)' }}>
                {/* Sidebar */}
                <LiquidGlassPanel hover={false} style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.27)' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1D4ED8', marginBottom: 12 }}>Channels</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {channels.map((ch) => (
                                <button
                                    key={ch}
                                    onClick={() => { setChannel(ch); setSelectedRecipient(null); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: !selectedRecipient && channel === ch ? '#1D4ED8' : 'transparent',
                                        color: !selectedRecipient && channel === ch ? '#fff' : 'rgba(92, 84, 84, 0.7)',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Hash size={14} />
                                    {ch}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1D4ED8', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Direct Messages</span>
                            <button
                                onClick={() => setShowStaffPicker(true)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    border: 'none',
                                    background: '#1d4fd8c7',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: 12
                                }}
                            >
                                + New
                            </button>
                        </div>

                        {/* Staff Search Picker */}
                        {showStaffPicker && (
                            <div ref={staffPickerRef} style={{
                                position: 'absolute',
                                left: 20,
                                width: 240,
                                background: 'rgba(30,30,40,0.95)',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: 12,
                                zIndex: 100,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <Search size={14} color="rgba(255,255,255,0.5)" />
                                    <input
                                        type="text"
                                        placeholder="Search staff..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            flex: 1,
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#fff',
                                            fontSize: 13,
                                            outline: 'none'
                                        }}
                                        autoFocus
                                    />
                                    <button onClick={() => setShowStaffPicker(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {filteredStaff.length === 0 ? (
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', padding: 8, textAlign: 'center' }}>
                                            No staff found
                                        </div>
                                    ) : (
                                        filteredStaff.map((s) => (
                                            <button
                                                key={s.$id}
                                                onClick={() => { setSelectedRecipient(s); setShowStaffPicker(false); setSearchQuery(''); }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '8px',
                                                    borderRadius: 6,
                                                    border: 'none',
                                                    background: selectedRecipient?.$id === s.$id ? 'rgba(59,130,246,0.3)' : 'transparent',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: 13,
                                                    width: '100%',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 11,
                                                    fontWeight: 600
                                                }}>
                                                    {s.firstName?.[0]}{s.lastName?.[0]}
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</div>
                                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.department || 'Staff'}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Selected Recipient Display */}
                        {selectedRecipient && (
                            <button
                                onClick={() => setSelectedRecipient(null)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: '#1D4ED8',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    width: '100%',
                                    textAlign: 'left',
                                    marginBottom: 8
                                }}
                            >
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 600
                                }}>
                                    {selectedRecipient.firstName?.[0]}{selectedRecipient.lastName?.[0]}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 500 }}>{selectedRecipient.firstName} {selectedRecipient.lastName}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Direct Message</div>
                                </div>
                                <X size={14} color="rgba(255,255,255,0.5)" />
                            </button>
                        )}

                        {/* Recent DMs */}
                        {staff.filter(s => s.$id !== profile?.$id).slice(0, 5).map((s) => (
                            <button
                                key={s.$id}
                                onClick={() => setSelectedRecipient(s)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: selectedRecipient?.$id === s.$id ? '#fff' : 'transparent',
                                    color: selectedRecipient?.$id === s.$id ? '#fff' : '#1D4ED8',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    width: '100%',
                                    textAlign: 'left'
                                }}
                            >
                                <User size={14} />
                                {s.firstName} {s.lastName}
                            </button>
                        ))}
                    </div>
                </LiquidGlassPanel>

                {/* Main Chat Area */}
                <LiquidGlassPanel hover={false} style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isDirectMessage ? (
                                <>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}>
                                        {selectedRecipient.firstName?.[0]}{selectedRecipient.lastName?.[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1D4ED8' }}>{selectedRecipient.firstName} {selectedRecipient.lastName}</div>
                                        <div style={{ fontSize: 12, color: '#1D4ED8' }}>Direct Message</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Hash size={18} color="#1D4ED8" />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1D4ED8' }}>{channel}</div>
                                        <div style={{ fontSize: 12, color: '#1D4ED8' }}>Channel</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 40, color: '#00000096' }}>
                                <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                <div style={{ fontSize: 14 }}>No messages yet</div>
                                <div style={{ fontSize: 12, marginTop: 4 }}>Start the conversation by sending a message</div>
                            </div>
                        )}
                        {messages.map((m) => {
                            const isOwn = m.senderId === (profile?.$id || profile?.authId);
                            return (
                                <div key={m.$id || `${m.senderId}-${m.createdAt}`} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
                                        background: isOwn ? 'linear-gradient(135deg, #1D4ED8, #2563EB)' : '#0A91F9',
                                        borderBottomRightRadius: isOwn ? 4 : 16,
                                        borderBottomLeftRadius: isOwn ? 16 : 4,
                                    }}>
                                        {!isOwn && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>{m.senderName}</div>}
                                        <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.message}</div>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'right' }}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                        <input
                            className="input"
                            placeholder={isDirectMessage ? `Message ${selectedRecipient?.firstName}...` : "Type a message..."}
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && !event.shiftKey && send()}
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-primary" onClick={send} disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
