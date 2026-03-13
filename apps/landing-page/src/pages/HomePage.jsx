import React from 'react';
import { Link } from 'react-router-dom';

import { GraduationCap, BarChart2, ClipboardCheck, Lock, MessageSquare, CreditCard } from 'lucide-react';

const features = [
    { icon: <GraduationCap size={32} color="var(--color-primary)" />, title: 'Student Management', desc: 'Enroll, track, and manage students with comprehensive profiles.' },
    { icon: <BarChart2 size={32} color="#8B5CF6" />, title: 'Result Computation', desc: 'Automatic grade calculations with customizable schemes.' },
    { icon: <ClipboardCheck size={32} color="#06B6D4" />, title: 'Attendance Tracking', desc: 'Real-time reports for administrators and parents.' },
    { icon: <Lock size={32} color="#10B981" />, title: 'PIN-Based Access', desc: 'Secure PIN codes for parents to access student results.' },
    { icon: <MessageSquare size={32} color="#F59E0B" />, title: 'Real-time Chat', desc: 'Built-in messaging between staff and administrators.' },
    { icon: <CreditCard size={32} color="#EF4444" />, title: 'Payment Integration', desc: 'Seamless payment collection via Squad by GTBank.' },
];

export default function HomePage() {
    return (
        <div>
            {/* Hero Section with LiquidGL implementation */}
            <section style={{
                position: 'relative',
                padding: '120px 40px',
                minHeight: '80vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', overflow: 'hidden', background: '#FFFFFF'
            }}>
                <div style={{ position: 'absolute', top: '10%', left: '15%', width: 400, height: 400, background: 'var(--color-primary-100)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300, background: 'var(--color-info)', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%' }}></div>

                <div style={{ position: 'relative', zIndex: 10, maxWidth: 900 }}>
                    <div style={{ position: 'relative', zIndex: 1, padding: '40px 60px', borderRadius: 40, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 45px rgba(29, 78, 216, 0.08)', background: 'rgba(255,255,255,0.88)' }}>
                        <span style={{ display: 'inline-block', background: 'var(--color-primary-50)', color: 'var(--color-primary)', padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700, marginBottom: 24 }}>✨ The future of school management</span>
                        <h1 style={{ fontSize: 64, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--color-gray-900)' }}>
                            Manage Your School <br />
                            With <span style={{ color: 'var(--color-primary)' }}>Liquid Precision</span>
                        </h1>
                        <p style={{ fontSize: 20, color: 'var(--color-gray-600)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
                            AcademicX brings effortless student management, automated grading, real-time attendance, and secure result access in a beautiful, app-like experience.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                            <button className="btn btn-primary btn-lg">Start Free Trial</button>
                            <button className="btn btn-glass btn-lg">Watch Demo</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section style={{ padding: '80px 40px', background: 'var(--color-gray-50)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <h2>Everything You Need</h2>
                        <p style={{ fontSize: 18, color: 'var(--color-gray-500)', marginTop: 12 }}>Powerful tools designed for modern schools. From enrollment to graduation.</p>
                    </div>

                    <div className="grid grid-3">
                        {features.map((f, i) => (
                            <div key={i} style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid var(--color-gray-100)' }}>
                                <div style={{ fontSize: 32, marginBottom: 20, background: 'var(--color-primary-50)', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16 }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: 20, marginBottom: 12 }}>{f.title}</h3>
                                <p style={{ fontSize: 15 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Image / Stats Section */}
            <section style={{ padding: '80px 40px', background: '#fff' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 40, marginBottom: 20 }}>Beautifully Simple.<br />Incredibly Powerful.</h2>
                        <p style={{ fontSize: 18, color: 'var(--color-gray-600)', marginBottom: 32 }}>We've reimagined how a school portal should feel. Light, fast, and organized. Say goodbye to clunky enterprise software and hello to intuitive design.</p>
                        <Link to="/how-it-works" className="btn btn-primary" style={{ padding: '12px 24px' }}>See How It Works →</Link>
                    </div>
                    <div style={{ flex: 1 }}>
                        <img src="https://diviengine.com/wp-content/uploads/2025/08/naughtyduk-liquid-glass-1024x611.webp" alt="AcademicX Dashboard Preview" style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} />
                    </div>
                </div>
            </section>
        </div>
    );
}
