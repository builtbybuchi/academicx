import React, { useEffect, useRef } from 'react';

const modalStyles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
    },
    modal: {
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '24px',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.16)',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        animation: 'scaleIn 0.3s ease-out',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    },
    title: {
        fontFamily: 'var(--font-heading)',
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--color-gray-900)',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        color: 'rgba(0, 0, 0, 0.65)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        transition: 'all 200ms ease',
    },
    body: {
        padding: '24px',
        overflowY: 'auto',
        maxHeight: 'calc(90vh - 140px)',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    },
};

/**
 *  Modal dialog with liquid glass backdrop.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer]
 * @param {'sm'|'md'|'lg'} [props.size='md']
 */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    const maxWidth = size === 'sm' ? '420px' : size === 'lg' ? '720px' : '560px';

    return (
        <div
            ref={overlayRef}
            style={modalStyles.overlay}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div style={{ ...modalStyles.modal, maxWidth }}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>{title}</h3>
                    <button style={modalStyles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div style={modalStyles.body}>{children}</div>
                {footer && <div style={modalStyles.footer}>{footer}</div>}
            </div>
        </div>
    );
}
