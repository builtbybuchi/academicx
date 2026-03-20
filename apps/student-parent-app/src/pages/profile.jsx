import React, { useEffect, useState } from 'react';
import LiquidGlassPanel from '../../../../shared/components/LiquidGlassPanel.jsx';
import FormField from '../../../../shared/components/FormField.jsx';
import { useToast } from '../../../../shared/components/Toast.jsx';
import { getStudentPortalData, updateProfile } from '../../../../shared/utils/api.js';
import { useAuth } from '../../../../shared/utils/auth.jsx';

export default function StudentProfile() {
    const toast = useToast();
    const { checkAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState(null);
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', dateOfBirth: '', allergies: '' });

    async function load() {
        setLoading(true);
        try {
            const response = await getStudentPortalData();
            setData(response);
            setForm({
                firstName: response?.user?.firstName || '',
                lastName: response?.user?.lastName || '',
                phone: response?.user?.phone || '',
                dateOfBirth: response?.user?.dateOfBirth || '',
                allergies: response?.student?.allergies || '',
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
                    allergies: form.allergies,
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

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">Update your personal details and student health notes.</p>
            </div>

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 14, color: 'var(--color-gray-900)' }}>Personal Details</h3>
                    <FormField label="First Name" required value={form.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
                    <FormField label="Last Name" required value={form.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
                    <FormField label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                    <FormField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => setForm((current) => ({ ...current, dateOfBirth: value }))} />
                    <FormField label="Allergies" type="textarea" rows={3} value={form.allergies} onChange={(value) => setForm((current) => ({ ...current, allergies: value }))} />
                    <button className="btn btn-primary" disabled={saving || loading} onClick={saveProfile}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </LiquidGlassPanel>

                <LiquidGlassPanel hover={false} style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 14, color: 'var(--color-gray-900)' }}>Academic Details</h3>
                    <div style={{ fontSize: 14, color: 'var(--color-gray-600)', display: 'grid', gap: 10 }}>
                        <div><strong>Email:</strong> {data?.user?.email || '-'}</div>
                        <div><strong>Admission Number:</strong> {data?.student?.admissionNumber || '-'}</div>
                        <div><strong>Class:</strong> {data?.student?.className || '-'}</div>
                        <div><strong>Section:</strong> {data?.student?.section || '-'}</div>
                        <div><strong>Parent:</strong> {data?.student?.parentName || '-'}</div>
                        <div><strong>Parent Contact:</strong> {data?.student?.parentPhone || data?.student?.parentEmail || '-'}</div>
                    </div>
                </LiquidGlassPanel>
            </div>
        </div>
    );
}
