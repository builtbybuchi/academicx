import React from 'react';

export default function ContactPage() {
    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '100px 40px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 80, flexWrap: 'wrap' }}>

                <div style={{ flex: 1, minWidth: 300 }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Us</span>
                    <h1 style={{ fontSize: 48, marginTop: 16, marginBottom: 24 }}>Let's talk about your school.</h1>
                    <p style={{ fontSize: 18, color: 'var(--color-gray-600)', marginBottom: 40, lineHeight: 1.6 }}>
                        Whether you have a question about pricing, features, or need a guided demo, our team is ready to help you optimize your school management.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <strong style={{ display: 'block', fontSize: 16, color: 'var(--color-gray-900)', marginBottom: 4 }}>Email</strong>
                            <a href="mailto:support@academicx.com" style={{ fontSize: 16, color: 'var(--color-primary)' }}>support@academicx.com</a>
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: 16, color: 'var(--color-gray-900)', marginBottom: 4 }}>Phone</strong>
                            <span style={{ fontSize: 16, color: 'var(--color-gray-600)' }}>+234 800 123 4567</span>
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: 16, color: 'var(--color-gray-900)', marginBottom: 4 }}>Office</strong>
                            <span style={{ fontSize: 16, color: 'var(--color-gray-600)' }}>12 Innovation Drive, Tech District,<br />Lagos, Nigeria</span>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: 300, background: 'var(--color-gray-50)', padding: 40, borderRadius: 24, border: '1px solid var(--color-gray-200)' }}>
                    <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label className="input-label">Full Name</label>
                            <input type="text" className="input" placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className="input-label">School Name</label>
                            <input type="text" className="input" placeholder="e.g. Royal Hills College" />
                        </div>
                        <div>
                            <label className="input-label">Email Address</label>
                            <input type="email" className="input" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="input-label">Message</label>
                            <textarea className="input" rows="4" placeholder="How can we help?" style={{ resize: 'vertical' }}></textarea>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '16px', marginTop: 8 }}>Send Message</button>
                    </form>
                </div>

            </div>
        </div>
    );
}
