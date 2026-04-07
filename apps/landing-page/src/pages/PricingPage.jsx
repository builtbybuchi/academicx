import React from 'react';
import { Check, School, User } from 'lucide-react';

export default function PricingPage() {
    return (
        <div style={{ background: 'var(--color-gray-50)', minHeight: '100vh', padding: '100px 40px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h1 style={{ fontSize: 48, marginBottom: 16, color: 'var(--color-gray-900)' }}>Simple, Transparent Pricing</h1>
                    <p style={{ fontSize: 20, color: 'var(--color-gray-600)', maxWidth: 700, margin: '0 auto' }}>
                        academicX is <strong>completely free</strong> to use. You only pay when you publish results at the end of each term.
                    </p>
                </div>

                {/* Free Features */}
                <div style={{ background: '#fff', borderRadius: 32, padding: 48, marginBottom: 40, boxShadow: '0 12px 32px rgba(0,0,0,0.03)', border: '1px solid var(--color-gray-200)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--color-primary)' }}>Free</div>
                        <p style={{ fontSize: 16, color: 'var(--color-gray-500)', marginTop: 8 }}>All features, unlimited schools, unlimited users</p>
                    </div>
                    <div className="grid grid-3" style={{ gap: 16 }}>
                        {[
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
                        ].map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--color-gray-700)' }}>
                                <Check size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} /> {f}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Model */}
                <h2 style={{ fontSize: 28, textAlign: 'center', marginBottom: 32, color: 'var(--color-gray-900)' }}>Result Publishing Payment</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', marginBottom: 40, maxWidth: 700, margin: '0 auto 40px' }}>
                    When you're ready to publish results and make them accessible to students and parents, :
                </p>

                <div className="grid grid-2" style={{ gap: 32, maxWidth: 900, margin: '0 auto' }}>
                    {/* School Pays */}
                    <div style={{
                        background: '#fff', borderRadius: 32, padding: 40,
                        boxShadow: '0 24px 60px rgba(29, 78, 216, 0.1)',
                        border: '2px solid var(--color-primary)',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <School size={28} style={{ color: 'var(--color-primary)' }} />
                            <h3 style={{ fontSize: 22, color: 'var(--color-gray-900)' }}>School Pays</h3>
                        </div>
                        <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, color: 'var(--color-primary-700)' }}>
                            <span style={{ fontSize: 24, verticalAlign: 'top', color: 'var(--color-gray-400)' }}>₦</span>700
                            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-gray-500)' }}> /student</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 24 }}>Per term · One-time fee when results are published</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                'School purchases PINs in bulk',
                                'Results free for students',
                                'Distribute PINs to students',
                                'Lower cost per student',
                            ].map((f, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-gray-700)' }}>
                                    <Check size={16} style={{ color: 'var(--color-success)' }} /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Student Pays */}
                    <div style={{
                        background: '#fff', borderRadius: 32, padding: 40,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.03)',
                        border: '1px solid var(--color-gray-200)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <User size={28} style={{ color: 'var(--color-gray-600)' }} />
                            <h3 style={{ fontSize: 22, color: 'var(--color-gray-900)' }}>Student Pays</h3>
                        </div>
                        <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, color: 'var(--color-gray-800)' }}>
                            <span style={{ fontSize: 24, verticalAlign: 'top', color: 'var(--color-gray-400)' }}>₦</span>500<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-gray-500)' }}> + markup</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 24 }}>Base price per student · Schools can add custom markup</p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                'Students purchase their own PINs',
                                'School sets optional additional fee',
                                '₦600 base collected by platform',
                                'School keeps all markup revenue',
                            ].map((f, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-gray-700)' }}>
                                    <Check size={16} style={{ color: 'var(--color-success)' }} /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* School Fees Payment Feature */}
                <h2 style={{ fontSize: 28, textAlign: 'center', marginBottom: 32, color: 'var(--color-gray-900)' }}>School Fees Collection (Optional)</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', marginBottom: 40, maxWidth: 700, margin: '0 auto 40px' }}>
                    Streamline your school fee collection with our integrated payment system. This is an optional feature - schools can continue to manage fees manually if preferred.
                </p>

                <div style={{
                    background: '#fff', borderRadius: 32, padding: 48, marginBottom: 40,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.03)', border: '1px solid var(--color-gray-200)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h3 style={{ fontSize: 24, color: 'var(--color-gray-900)', marginBottom: 16 }}>Transaction Fee Structure</h3>
                        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 16 }}>
                            1.9%
                        </div>
                        <p style={{ fontSize: 16, color: 'var(--color-gray-600)', marginBottom: 24 }}>of transaction amount, capped at ₦2,500 per payment</p>
                    </div>
                    
                    <div className="grid grid-2" style={{ gap: 24, marginBottom: 32 }}>
                        <div style={{ textAlign: 'center', padding: 20, background: '#f8fafc', borderRadius: 16 }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 8 }}>1.2%</div>
                            <div style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>SquadCo Platform Fee (GTBank)</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 20, background: '#f8fafc', borderRadius: 16 }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 8 }}>0.7%</div>
                            <div style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>AcademicX Platform Fee</div>
                        </div>
                    </div>

                    <div style={{ background: '#fef3c7', padding: 20, borderRadius: 12, border: '1px solid #f59e0b' }}>
                        <h4 style={{ fontSize: 16, fontWeight: 600, color: '#92400e', marginBottom: 12 }}>Example Calculation:</h4>
                        <div style={{ fontSize: 14, color: '#78350f', lineHeight: 1.6 }}>
                            <p><strong>School Fee:</strong> ₦50,000</p>
                            <p><strong>Platform Fee (1.9%):</strong> ₦950</p>
                            <p><strong>Capped at:</strong> ₦2,500 maximum</p>
                            <p><strong>Total Parent Pays:</strong> ₦50,950</p>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: '#f0fdf4', borderRadius: 16, padding: 24, marginBottom: 40,
                    border: '1px solid #86efac'
                }}>
                    <h4 style={{ fontSize: 18, fontWeight: 600, color: '#166534', marginBottom: 12 }}>Features Included:</h4>
                    <ul style={{ margin: 0, paddingLeft: 20, color: '#166534' }}>
                        <li>Online payment processing for parents</li>
                        <li>Automated fee tracking and reporting</li>
                        <li>Class-by-class payment status</li>
                        <li>PDF export of payment reports</li>
                        <li>Bi-weekly WhatsApp reminders to parents</li>
                        <li>Manual payment recording option</li>
                    </ul>
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: 700, margin: '60px auto 0', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 22, marginBottom: 24, color: 'var(--color-gray-900)' }}>Common Questions</h3>
                    {[
                        { q: 'Is there really no subscription fee?', a: 'Yes! academicX is completely free to use. You only pay when you publish results at the end of a term.' },
                        { q: 'What happens after a PIN is used?', a: "Once a student uses a PIN to view their results, they can access those results forever — no need to re-enter the PIN." },
                        { q: 'Can the school earn money?', a: 'Yes! If you choose the "Student Pays" model, you can set a custom markup above the ₦600 base fee. The additional revenue goes to your school\'s withdrawable balance.' },
                        { q: 'How do I withdraw my school balance?', a: 'Admin users can request withdrawals directly from the Admin dashboard. Funds are transferred to your bank account.' },
                        { q: 'Is the school fees collection mandatory?', a: 'No! This is an optional feature. Schools can continue to manage fees manually and record payments as they want.' },
                        { q: 'Who pays the 1.9% platform fee?', a: 'The platform fee is paid by the parents/guardians when making school fee payments for their wards.' },
                        { q: 'What happens if the fee exceeds ₦2,500?', a: 'The platform fee is capped at ₦2,500 per transaction. For any amount above ₦131,579, the fee remains ₦2,500.' },
                    ].map((faq, i) => (
                        <div key={i} style={{ textAlign: 'left', padding: '20px 0', borderBottom: '1px solid var(--color-gray-200)' }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 8 }}>{faq.q}</div>
                            <div style={{ fontSize: 14, color: 'var(--color-gray-600)', lineHeight: 1.6 }}>{faq.a}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
