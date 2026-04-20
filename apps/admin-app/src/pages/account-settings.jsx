import React, { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import LiquidGlassPanel from 'shared/components/LiquidGlassPanel.jsx';
import FormField from 'shared/components/FormField.jsx';
import { useToast } from 'shared/components/Toast.jsx';
import { getCurrentSchool, verifyAndSaveAdminBankDetails } from 'shared/utils/api.js';

const NIGERIAN_BANKS = [
    { code: '044', name: 'Access Bank' },
    { code: '014', name: 'Afribank Nigeria Plc' },
    { code: '023', name: 'Citibank Nigeria Limited' },
    { code: '050', name: 'Ecobank Nigeria Plc' },
    { code: '070', name: 'Fidelity Bank Plc' },
    { code: '011', name: 'First Bank of Nigeria Limited' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Banking Company Ltd' },
    { code: '082', name: 'Keystone Bank Limited' },
    { code: '076', name: 'Polaris Bank Limited' },
    { code: '039', name: 'Stanbic IBTC Bank Plc' },
    { code: '068', name: 'Standard Chartered Bank Nigeria Ltd' },
    { code: '232', name: 'Sterling Bank Plc' },
    { code: '033', name: 'United Bank For Africa Plc' },
    { code: '032', name: 'Union Bank of Nigeria Plc' },
    { code: '215', name: 'Unity Bank Plc' },
    { code: '035', name: 'Wema Bank Plc' },
    { code: '057', name: 'Zenith Bank Plc' },
];

export default function AccountSettings() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        bankCode: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
    });

    const bankOptions = useMemo(() => NIGERIAN_BANKS.map((bank) => ({
        value: bank.code,
        label: `${bank.name} (${bank.code})`,
    })), []);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            try {
                const school = await getCurrentSchool();
                const schoolData = typeof school?.data === 'string'
                    ? JSON.parse(school.data || '{}')
                    : (school?.data || {});
                const details = schoolData.bankDetails || {};
                if (!active) return;
                setForm((current) => ({
                    ...current,
                    bankCode: String(details.bankCode || ''),
                    bankName: String(details.bankName || ''),
                    accountNumber: String(details.accountNumber || ''),
                    accountName: String(details.accountName || ''),
                }));
            } catch (error) {
                if (active) {
                    toast({ type: 'error', title: 'Load failed', message: error.message || 'Unable to load account settings.' });
                }
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => {
            active = false;
        };
    }, []);

    async function handleSave() {
        const accountNumber = String(form.accountNumber || '').trim();
        if (!form.bankCode || accountNumber.length < 10) {
            toast({ type: 'error', title: 'Missing fields', message: 'Select bank and provide a valid account number.' });
            return;
        }

        setSaving(true);
        try {
            const selectedBank = NIGERIAN_BANKS.find((item) => item.code === form.bankCode);
            const result = await verifyAndSaveAdminBankDetails({
                bankCode: form.bankCode,
                bankName: selectedBank?.name || form.bankName,
                accountNumber,
            });

            setForm((current) => ({
                ...current,
                bankName: result.bankName || selectedBank?.name || '',
                accountName: result.accountName || current.accountName,
            }));

            toast({
                type: 'success',
                title: 'Bank details saved',
                message: `${result.accountName} verified via Squad and saved successfully.`,
            });
        } catch (error) {
            toast({ type: 'error', title: 'Verification failed', message: error.message || 'Could not verify account with Squad.' });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="loading">Loading account settings...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Account Settings</h1>
                <p className="page-subtitle">Configure verified bank details for school fee withdrawals.</p>
            </div>

            <LiquidGlassPanel hover={false} style={{ padding: 24, maxWidth: 760 }}>
                <div style={{ display: 'grid', gap: 14 }}>
                    <FormField
                        label="Bank"
                        type="select"
                        options={bankOptions}
                        value={form.bankCode}
                        onChange={(value) => {
                            const found = NIGERIAN_BANKS.find((item) => item.code === value);
                            setForm((current) => ({ ...current, bankCode: value, bankName: found?.name || '' }));
                        }}
                    />

                    <FormField
                        label="Account Number"
                        value={form.accountNumber}
                        onChange={(value) => setForm((current) => ({ ...current, accountNumber: String(value || '').replace(/\D/g, '').slice(0, 10) }))}
                        placeholder="0123456789"
                    />

                    <FormField
                        label="Verified Account Name"
                        value={form.accountName}
                        disabled
                        placeholder="Will auto-fill after Squad verification"
                    />

                    <div className="alert alert-info" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                        <Info size={16} style={{ marginTop: 2 }} />
                        <div>
                            Account details are verified with Squad before they are saved. Unverified accounts cannot be used for withdrawals.
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Verifying & Saving...' : 'Verify With Squad & Save'}
                        </button>
                    </div>
                </div>
            </LiquidGlassPanel>
        </div>
    );
}
