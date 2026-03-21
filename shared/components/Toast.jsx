import React, { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

const toastStyles = {
    container: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '400px',
    },
    toast: {
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '16px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        animation: 'slideInRight 0.3s ease-out',
        minWidth: '300px',
    },
    icon: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        flexShrink: 0,
        marginTop: '1px',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--color-gray-900)',
        fontFamily: 'var(--font-heading)',
        marginBottom: '2px',
    },
    message: {
        fontSize: '13px',
        color: 'var(--color-gray-600)',
        lineHeight: 1.4,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--color-gray-500)',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '2px',
        flexShrink: 0,
    },
};

const typeConfig = {
    success: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: '✓' },
    error: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: '✕' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: '⚠' },
    info: { color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', icon: 'ℹ' },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, title, message }]);
        if (duration > 0) {
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div style={toastStyles.container}>
                {toasts.map(toast => {
                    const cfg = typeConfig[toast.type] || typeConfig.info;
                    return (
                        <div key={toast.id} style={{ ...toastStyles.toast, borderLeft: `3px solid ${cfg.color}` }}>
                            <div style={{ ...toastStyles.icon, background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                            <div style={toastStyles.content}>
                                {toast.title && <div style={toastStyles.title}>{toast.title}</div>}
                                <div style={toastStyles.message}>{toast.message}</div>
                            </div>
                            <button style={toastStyles.closeBtn} onClick={() => removeToast(toast.id)}>✕</button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

export default ToastProvider;
