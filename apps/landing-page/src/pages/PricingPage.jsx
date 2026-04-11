{/* This is an independent file, designed outside of the other pages. Do not touch! */}

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

const FREE_FEATURES = [
    'Student & staff enrollment',
    'Class & subject management',
    'Customizable grading schemes',
    'Student attendance tracking',
    'Staff check-in / check-out',
    'Result entry & computation',
    'Broadsheet generation',
    'Real-time staff/admin chat',
    'Bulk email to parents',
    'Academic session management',
    'School profile & branding',
    'Mobile-optimized dashboards',
];

const FAQS = [
    { q: 'Is there really no subscription fee?', a: 'Yes! academicX is completely free to use. You only pay when you publish results at the end of a term.' },
    { q: 'How do I withdraw my school balance?', a: 'Admin users can request withdrawals directly from the Admin dashboard. Funds are transferred to your bank account within 24 hours.' },
    { q: 'Is the school fees collection mandatory?', a: 'No! This is an optional feature. Schools can continue to manage fees manually and record payments as they want.' },
    { q: 'Who pays the 1.9% platform fee?', a: 'The platform fee is paid by the parents/guardians when making school fee payments for their wards.' },
    { q: 'What happens if the fee exceeds ₦2,500?', a: 'The platform fee is capped at ₦2,500 per transaction. For any amount above ₦131,579, the fee remains ₦2,500.' },
];

const FEE_FEATURES = [
    'Online payment processing for parents',
    'Automated fee tracking and reporting',
    'Class-by-class payment status',
    'PDF export of payment reports',
    'Bi-weekly WhatsApp reminders to parents',
    'Manual payment recording option',
];

const CSS = `
.ax-pricing-page {
    background: #f8f9fb;
    min-height: 100vh;
    padding: 100px 24px 80px;
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    box-sizing: border-box;
}
.ax-pricing-page *, .ax-pricing-page *::before, .ax-pricing-page *::after {
    box-sizing: border-box;
}
.ax-pricing-container {
    max-width: 1100px;
    margin: 0 auto;
}
.ax-hero {
    text-align: center;
    margin-bottom: 64px;
}
.ax-hero-badge {
    display: inline-block;
    background: #EBF5FF;
    color: #1a56db;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
    margin-bottom: 20px;
}
.ax-hero h1 {
    font-size: 44px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 16px;
    line-height: 1.15;
    letter-spacing: -0.02em;
}
.ax-hero p {
    font-size: 18px;
    color: #64748b;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.65;
}
.ax-cards-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    align-items: stretch;
}
.ax-card,
.ax-card-featured {
    display: flex;
    flex-direction: column;
}
.ax-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    padding: 32px 28px;
}
.ax-card-featured {
    background: #fff;
    border-radius: 20px;
    border: 2px solid #1a56db;
    padding: 32px 28px;
    position: relative;
}
.ax-featured-badge {
    position: absolute;
    top: -13px;
    left: 28px;
    background: #1a56db;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 14px;
    border-radius: 20px;
}
.ax-card-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0 0 12px;
}
.ax-price-big {
    font-size: 40px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
    margin-bottom: 4px;
}
.ax-price-unit {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 20px;
}
.ax-divider {
    border: none;
    border-top: 1px solid #f1f5f9;
    margin: 20px 0;
}
.ax-section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0 0 14px;
}
.ax-feature-row {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    font-size: 13px;
    color: #475569;
    padding: 5px 0;
}
.ax-metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
}
.ax-metric-tile {
    background: #f8f9fb;
    border-radius: 12px;
    padding: 14px 16px;
    text-align: center;
}
.ax-split-tile {
    background: #f8f9fb;
    border-radius: 12px;
    padding: 14px 16px;
}
.ax-calc-box {
    background: #f0f7ff;
    border-radius: 12px;
    padding: 16px;
    margin-top: 16px;
}
.ax-slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}
.ax-calc-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #64748b;
    padding: 4px 0;
}
.ax-calc-total {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    border-top: 1px solid #bfdbfe;
    padding-top: 10px;
    margin-top: 6px;
}
.ax-optional-badge {
    display: inline-block;
    background: #1a56db10;
    color: #1a56db;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
}
.ax-faq-section {
    max-width: 680px;
    margin: 72px auto 0;
}
.ax-faq-title {
    font-size: 22px;
    font-weight: 600;
    color: #0f172a;
    text-align: center;
    margin-bottom: 32px;
    letter-spacing: -0.01em;
}
.ax-faq-item {
    padding: 18px 0;
    border-bottom: 1px solid #f1f5f9;
}
.ax-faq-q {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 6px;
}
.ax-faq-a {
    font-size: 14px;
    color: #64748b;
    line-height: 1.65;
}

/* Tablet: 2 columns, free plan spans full width */
@media (max-width: 900px) {
    .ax-cards-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .ax-cards-grid > .ax-card:first-child {
        grid-column: 1 / -1;
    }
    .ax-hero h1 {
        font-size: 34px;
    }
    .ax-hero p {
        font-size: 16px;
    }
}

/* Mobile: single column, tighter spacing */
@media (max-width: 600px) {
    .ax-pricing-page {
        padding: 72px 16px 60px;
    }
    .ax-cards-grid {
        grid-template-columns: 1fr;
    }
    .ax-cards-grid > .ax-card:first-child {
        grid-column: auto;
    }
    .ax-hero {
        margin-bottom: 40px;
    }
    .ax-hero h1 {
        font-size: 28px;
    }
    .ax-price-big {
        font-size: 32px;
    }
    .ax-card,
    .ax-card-featured {
        padding: 24px 20px;
    }
    .ax-faq-section {
        margin-top: 48px;
    }
    .ax-faq-title {
        font-size: 18px;
    }
}
`;

export default function PricingPage() {
    const [students, setStudents] = useState(120);

    useEffect(() => {
        const id = 'ax-pricing-styles';
        if (!document.getElementById(id)) {
            const tag = document.createElement('style');
            tag.id = id;
            tag.textContent = CSS;
            document.head.appendChild(tag);
        }
        return () => {
            const tag = document.getElementById(id);
            if (tag) tag.remove();
        };
    }, []);

    return (
        <div className="ax-pricing-page">
            <div className="ax-pricing-container">

                {/* Hero */}
                <div className="ax-hero">
                    <h1>Simple, transparent pricing</h1>
                    <p>
                        academicX is <strong>completely free</strong> to use. You only pay when you publish results at the end of each term.
                    </p>
                </div>

                {/* Cards grid */}
                <div className="ax-cards-grid">

                    {/* Free plan — spans full width on tablet */}
                    <div className="ax-card">
                        <p className="ax-card-label">Free plan</p>
                        <div className="ax-price-big">₦0</div>
                        <div className="ax-price-unit">All features · Unlimited users &amp; schools</div>
                        <hr className="ax-divider" />
                        <p className="ax-section-title">Included</p>
                        {FREE_FEATURES.map((f, i) => (
                            <div key={i} className="ax-feature-row">
                                <Check size={15} style={{ color: '#1a56db', flexShrink: 0, marginTop: 1 }} />
                                {f}
                            </div>
                        ))}
                    </div>

                    {/* Result publishing */}
                    <div className="ax-card-featured">
                        <span className="ax-featured-badge">Pay per term</span>
                        <p className="ax-card-label" style={{ marginTop: 6 }}>Result publishing</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <div className="ax-price-big">₦700</div>
                            <span style={{ fontSize: 15, color: '#94a3b8' }}>/student</span>
                        </div>
                        <div className="ax-price-unit">One-time fee when results are published · Per term</div>
                        <hr className="ax-divider" />
                        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: 0 }}>
                            Only charged when you choose to publish. No recurring fees or subscriptions.
                        </p>

                        <div className="ax-calc-box">
                            <p className="ax-section-title" style={{ color: '#3b82f6', marginBottom: 12 }}>Estimate your cost</p>
                            <div className="ax-slider-row">
                                <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>Students:</span>
                                <input
                                    type="range"
                                    min={10}
                                    max={1000}
                                    step={10}
                                    value={students}
                                    onChange={e => setStudents(Number(e.target.value))}
                                    style={{ flex: 1, accentColor: '#1a56db' }}
                                />
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', minWidth: 36, textAlign: 'right' }}>
                                    {students}
                                </span>
                            </div>
                            <div className="ax-calc-row"><span>Rate per student</span><span>₦700</span></div>
                            <div className="ax-calc-total">
                                <span>Total per term</span>
                                <span>₦{(students * 700).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* School fees collection */}
                    <div className="ax-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span className="ax-optional-badge">Optional</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>via Squad · GTBank</span>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>School fees collection</p>
                        <div className="ax-price-unit">Transaction fee paid by parents</div>
                        <hr className="ax-divider" />

                        <div className="ax-metric-grid">
                            <div className="ax-metric-tile">
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>1.9%</div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>Total fee</div>
                                <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 2 }}>capped ₦2,500</div>
                            </div>
                            <div className="ax-split-tile">
                                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Split</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
                                    <span style={{ color: '#94a3b8' }}>Squad</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>1.2%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
                                    <span style={{ color: '#94a3b8' }}>academicX</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>0.7%</span>
                                </div>
                            </div>
                        </div>

                        <p className="ax-section-title">Features</p>
                        {FEE_FEATURES.map((f, i) => (
                            <div key={i} className="ax-feature-row">
                                <Check size={15} style={{ color: '#1a56db', flexShrink: 0, marginTop: 1 }} />
                                {f}
                            </div>
                        ))}
                    </div>

                </div>

                {/* FAQ */}
                <div className="ax-faq-section">
                    <h3 className="ax-faq-title">Common questions</h3>
                    {FAQS.map((faq, i) => (
                        <div key={i} className="ax-faq-item">
                            <div className="ax-faq-q">{faq.q}</div>
                            <div className="ax-faq-a">{faq.a}</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}