import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, CheckCircle } from 'lucide-react';

export default function DownloadsManagementPage() {
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: '',
        platform: '',
        downloadUrl: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');

    const roles = [
        { value: 'admin', label: 'Admin' },
        { value: 'staff', label: 'Staff' },
        { value: 'student', label: 'Student' },
        { value: 'parent', label: 'Parent' }
    ];

    const platforms = [
        { value: 'windows', label: 'Windows (.exe)' },
        { value: 'macos', label: 'macOS (.dmg)' },
        { value: 'android', label: 'Android (.apk)' },
        { value: 'ios', label: 'iOS (.ipa)' }
    ];

    useEffect(() => {
        // Initialize with mock data
        setUploads([
            { $id: '1', role: 'admin', platform: 'windows', downloadUrl: 'https://example.com/admin-win.exe', createdAt: new Date().toISOString() },
            { $id: '2', role: 'admin', platform: 'macos', downloadUrl: 'https://example.com/admin-mac.dmg', createdAt: new Date().toISOString() },
            { $id: '3', role: 'admin', platform: 'android', downloadUrl: 'https://example.com/admin-and.apk', createdAt: new Date().toISOString() },
        ]);
    }, []);

    const fetchUploads = async () => {
        // Mock implementation - will be replaced with real API later
        console.log('Fetch uploads would be called here');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.role || !formData.platform || !formData.downloadUrl) {
            setMessage('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                // Update existing
                const updatedUploads = uploads.map(u => 
                    u.$id === editingId 
                        ? {
                            ...u,
                            role: formData.role,
                            platform: formData.platform,
                            downloadUrl: formData.downloadUrl,
                            updatedAt: new Date().toISOString()
                        }
                        : u
                );
                setUploads(updatedUploads);
                setMessage('Download link updated successfully!');
            } else {
                // Create new
                const newUpload = {
                    $id: 'id_' + Date.now(),
                    role: formData.role,
                    platform: formData.platform,
                    downloadUrl: formData.downloadUrl,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setUploads([...uploads, newUpload]);
                setMessage('Download link added successfully!');
            }

            setFormData({ role: '', platform: '', downloadUrl: '' });
            setEditingId(null);

            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error saving download:', err);
            setMessage('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (upload) => {
        setFormData({
            role: upload.role,
            platform: upload.platform,
            downloadUrl: upload.downloadUrl
        });
        setEditingId(upload.$id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this download link?')) return;

        try {
            const updatedUploads = uploads.filter(u => u.$id !== id);
            setUploads(updatedUploads);
            setMessage('Download link deleted successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting download:', err);
            setMessage('Error: ' + err.message);
        }
    };

    const handleCancel = () => {
        setFormData({ role: '', platform: '', downloadUrl: '' });
        setEditingId(null);
    };

    const groupedUploads = uploads.reduce((acc, upload) => {
        const key = `${upload.role}_${upload.platform}`;
        if (!acc[key]) {
            acc[key] = upload;
        }
        return acc;
    }, {});

    return (
        <div style={{ padding: 24 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: 'var(--color-gray-900)' }}>
                    📥 Manage Downloads
                </h1>
                <p style={{ color: 'var(--color-gray-600)', marginBottom: 32 }}>
                    Upload and manage installer download URLs for different roles and platforms.
                </p>

                {/* Message */}
                {message && (
                    <div style={{
                        padding: 16,
                        marginBottom: 24,
                        background: message.includes('Error') ? '#FEE2E2' : '#DCFCE7',
                        color: message.includes('Error') ? '#991B1B' : '#166534',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        {!message.includes('Error') && <CheckCircle size={20} />}
                        {message}
                    </div>
                )}

                {/* Form */}
                <div style={{
                    background: '#fff',
                    padding: 32,
                    borderRadius: 16,
                    border: '1px solid var(--color-gray-200)',
                    marginBottom: 40
                }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--color-gray-900)' }}>
                        {editingId ? '✏️ Edit Download Link' : '➕ Add New Download Link'}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--color-gray-700)' }}>
                                Role *
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    background: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Select role</option>
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--color-gray-700)' }}>
                                Platform *
                            </label>
                            <select
                                value={formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    background: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Select platform</option>
                                {platforms.map(platform => (
                                    <option key={platform.value} value={platform.value}>{platform.label}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: 'var(--color-gray-700)' }}>
                                Download URL *
                            </label>
                            <input
                                type="url"
                                value={formData.downloadUrl}
                                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                                placeholder="https://example.com/downloads/academicx-admin.exe"
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: 8,
                                    fontSize: 14
                                }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--color-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                <Upload size={18} />
                                {editingId ? 'Update Link' : 'Add Link'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'var(--color-gray-200)',
                                        color: 'var(--color-gray-900)',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Current Downloads Table */}
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--color-gray-900)' }}>
                        Current Download Links ({uploads.length})
                    </h2>

                    {uploads.length === 0 ? (
                        <div style={{
                            padding: 40,
                            textAlign: 'center',
                            background: 'var(--color-gray-50)',
                            borderRadius: 12,
                            color: 'var(--color-gray-500)'
                        }}>
                            <Upload size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <p>No download links added yet. Create one above to get started!</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                background: '#fff',
                                borderRadius: 12,
                                overflow: 'hidden',
                                border: '1px solid var(--color-gray-200)'
                            }}>
                                <thead>
                                    <tr style={{ background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)' }}>
                                        <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: 'var(--color-gray-900)' }}>Role</th>
                                        <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: 'var(--color-gray-900)' }}>Platform</th>
                                        <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: 'var(--color-gray-900)' }}>Download URL</th>
                                        <th style={{ padding: 16, textAlign: 'center', fontWeight: 700, color: 'var(--color-gray-900)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploads.map((upload) => (
                                        <tr key={upload.$id} style={{ borderBottom: '1px solid var(--color-gray-100)', hover: { background: 'var(--color-gray-50)' } }}>
                                            <td style={{ padding: 16, color: 'var(--color-gray-900)', fontWeight: 500 }}>
                                                <span style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                                                    {upload.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: 16, color: 'var(--color-gray-900)', fontWeight: 500 }}>
                                                <span style={{ background: 'var(--color-blue-50)', color: 'var(--color-blue-900)', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                                                    {upload.platform.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: 16, color: 'var(--color-primary)', fontSize: 13 }}>
                                                <a href={upload.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                    {upload.downloadUrl.substring(0, 50)}...
                                                </a>
                                            </td>
                                            <td style={{ padding: 16, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => handleEdit(upload)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: 'var(--color-blue-50)',
                                                            color: 'var(--color-blue-600)',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            fontSize: 13,
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(upload.$id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#FEE2E2',
                                                            color: '#DC2626',
                                                            border: 'none',
                                                            borderRadius: 6,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            fontSize: 13,
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
