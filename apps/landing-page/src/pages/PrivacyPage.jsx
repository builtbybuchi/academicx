import React from 'react';

export default function PrivacyPage() {
    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '100px 40px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: 40, marginBottom: 16 }}>Privacy Policy</h1>
                <p style={{ fontSize: 16, color: 'var(--color-gray-500)', marginBottom: 40 }}>Last updated: March 2026</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, fontSize: 16, color: 'var(--color-gray-600)', lineHeight: 1.8 }}>
                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>1. Introduction</h2>
                        <p>Welcome to AcademicX. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>2. The data we collect about you</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                        <ul style={{ paddingLeft: 24, marginTop: 12 }}>
                            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely via Squad).</li>
                            <li><strong>Academic Data</strong> includes student grades, attendance, and behavioral remarks.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>3. How we use your personal data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances: Where we need to perform the contract we are about to enter into or have entered into with you. Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>4. Data security</h2>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
