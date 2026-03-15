import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

export default function WebAppDropdown({ style, className, variant = 'primary', hideIcon = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const buttonStyle = variant === 'glass' 
        ? {
            padding: '10px 16px',
            border: '1px solid var(--color-gray-200)',
            background: '#fff',
            color: 'var(--color-gray-900)',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            ...style
        }
        : {
            padding: '10px 16px',
            fontSize: 14,
            ...style
        };

    const buttonClass = variant === 'glass' ? "btn btn-glass" : "btn btn-primary";

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
            <button
                className={`${buttonClass} ${className || ''}`}
                style={buttonStyle}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {!hideIcon && <Globe size={16} />} Use on Web <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: hideIcon ? 2 : 4 }} />
                </span>
            </button>
            <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid var(--color-gray-200)',
                overflow: 'hidden',
                minWidth: 180,
                zIndex: 100,
                display: isOpen ? 'block' : 'none',
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.2s, transform 0.2s',
            }}>
                <a href="https://academicx.ng/student" style={{ display: 'block', padding: '12px 16px', color: 'var(--color-gray-800)', textDecoration: 'none', fontSize: 14, borderBottom: '1px solid var(--color-gray-100)', fontWeight: 500 }} onMouseEnter={e => e.target.style.background = '#f9fafb'} onMouseLeave={e => e.target.style.background = 'transparent'}>Students & Parents</a>
                <a href="https://academicx.ng/staff" style={{ display: 'block', padding: '12px 16px', color: 'var(--color-gray-800)', textDecoration: 'none', fontSize: 14, borderBottom: '1px solid var(--color-gray-100)', fontWeight: 500 }} onMouseEnter={e => e.target.style.background = '#f9fafb'} onMouseLeave={e => e.target.style.background = 'transparent'}>Staff</a>
                <a href="https://academicx.ng/admin" style={{ display: 'block', padding: '12px 16px', color: 'var(--color-gray-800)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }} onMouseEnter={e => e.target.style.background = '#f9fafb'} onMouseLeave={e => e.target.style.background = 'transparent'}>Admins</a>
            </div>
        </div>
    );
}