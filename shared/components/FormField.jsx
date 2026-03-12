import React from 'react';

export default function FormField({
    label, type = 'text', placeholder = '', value = '', onChange,
    error, required = false, options = [], rows = 3, name, disabled = false,
}) {
    const id = name || label.toLowerCase().replace(/\s+/g, '-');
    const handleChange = (e) => {
        if (onChange) onChange(type === 'checkbox' ? e.target.checked : e.target.value, e);
    };

    if (type === 'checkbox') {
        return (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" name={id} checked={!!value} onChange={handleChange} disabled={disabled}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-heading)' }}>
                    {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
                </span>
            </label>
        );
    }

    const inputClass = `input ${error ? 'input-error' : ''}`;
    return (
        <div style={{ marginBottom: 16 }}>
            <label className="input-label" htmlFor={id}>
                {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
            </label>
            {type === 'select' ? (
                <select id={id} name={id} className={inputClass} value={value} onChange={handleChange} disabled={disabled}>
                    <option value="" style={{ background: '#1E293B' }}>{placeholder || 'Select...'}</option>
                    {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1E293B' }}>{o.label}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea id={id} name={id} className={inputClass} placeholder={placeholder} value={value}
                    onChange={handleChange} rows={rows} disabled={disabled} style={{ resize: 'vertical', minHeight: 80 }} />
            ) : (
                <input id={id} name={id} type={type} className={inputClass} placeholder={placeholder}
                    value={value} onChange={handleChange} required={required} disabled={disabled} />
            )}
            {error && <div className="input-error-text">{error}</div>}
        </div>
    );
}
