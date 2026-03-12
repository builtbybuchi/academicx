import React from 'react';

export default function TermsPage() {
    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '100px 40px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: 40, marginBottom: 16 }}>Terms and Conditions</h1>
                <p style={{ fontSize: 16, color: 'var(--color-gray-500)', marginBottom: 40 }}>Last updated: March 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, color: 'var(--color-gray-600)', lineHeight: 1.8 }}>
                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>1. Agreement to Terms</h2>
                        <p>By accessing or using the AcademicX platform ("Platform"), you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you do not have permission to access the Service.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>2. Subscription and Payments</h2>
                        <p>The Service is billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a per-term or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.</p>
                        <p style={{ marginTop: 12 }}>At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or AcademicX cancels it. All payments are processed securely through our payment partner, Squad by GTBank.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>3. User Accounts</h2>
                        <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>4. Intellectual Property</h2>
                        <p>The Service and its original content, features and functionality are and will remain the exclusive property of Lexrunit and its licensors. The Service is protected by copyright, trademark, and other laws of both the Federal Republic of Nigeria and foreign countries.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
