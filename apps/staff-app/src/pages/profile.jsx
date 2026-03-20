import React, { useEffect, useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { getStaffPortalData, updateProfile } from '../../../../shared/utils/api.js';
import { useAuth } from '../../../../shared/utils/auth.jsx';

export default function StaffProfile() {
    const toast = useToast();
    const { checkAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState(null);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', dateOfBirth: '' });

    async function load() {
        setLoading(true);
        try {
            const response = await getStaffPortalData();
            setData(response);
            setForm({
                firstName: response?.user?.firstName || '',
                lastName: response?.user?.lastName || '',
                phone: response?.user?.phone || '',
                dateOfBirth: response?.user?.dateOfBirth || response?.staff?.dateOfBirth || '',
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function saveProfile() {
        if (!data?.user?.$id) return;
        setSaving(true);
        try {
            await updateProfile({
                userId: data.user.$id,
                updates: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    dateOfBirth: form.dateOfBirth,
                },
            });
            await checkAuth();
            toast({ type: 'success', title: 'Profile updated', message: 'Your profile changes were saved.' });
            await load();
        } catch (error) {
            toast({ type: 'error', title: 'Update failed', message: error.message });
        } finally {
            setSaving(false);
        }
    }

    const assignedClasses = Array.isArray(data?.assignedClasses) ? data.assignedClasses : [];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">Manage your staff bio and contact details.</p>
            </div>

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 14, color: 'var(--color-gray-900)' }}>Personal Details</h3>
                    <FormField label="First Name" required value={form.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
                    <FormField label="Last Name" required value={form.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
                    <FormField label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                    <FormField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => setForm((current) => ({ ...current, dateOfBirth: value }))} />
                    <button className="btn btn-primary" disabled={saving || loading} onClick={saveProfile}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 14, color: 'var(--color-gray-900)' }}>Work Details</h3>
                    <div style={{ fontSize: 14, color: 'var(--color-gray-600)', display: 'grid', gap: 10 }}>
                        <div><strong>Email:</strong> {data?.user?.email || '-'}</div>
                        <div><strong>Department:</strong> {data?.staff?.department || '-'}</div>
                        <div><strong>Role:</strong> {data?.staff?.staffType || 'staff'}</div>
                        <div><strong>Form Teacher Class:</strong> {data?.staff?.formTeacherClass || '-'}</div>
                        <div><strong>Assigned Classes:</strong> {assignedClasses.length > 0 ? assignedClasses.join(', ') : '-'}</div>
                        <div><strong>Attendance Role:</strong> {data?.staff?.canMarkStaffAttendance ? 'Officer' : 'None'}</div>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
