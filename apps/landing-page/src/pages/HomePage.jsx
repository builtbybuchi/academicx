import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BarChart2, ClipboardCheck, Lock, MessageSquare, CreditCard, Users, BookOpen, TrendingUp, Eye, CheckCircle } from 'lucide-react';
import WebAppDropdown from '../components/WebAppDropdown';

const features = [
    { icon: <GraduationCap size={32} color="var(--color-primary)" />, title: 'Student Management', desc: 'Enroll, track, and manage students with comprehensive profiles.' },
    { icon: <BarChart2 size={32} color="var(--color-primary)" />, title: 'Result Computation', desc: 'Automatic grade calculations with customizable schemes.' },
    { icon: <ClipboardCheck size={32} color="var(--color-primary)" />, title: 'Attendance Tracking', desc: 'Real-time reports for administrators and parents.' },
    { icon: <Lock size={32} color="var(--color-primary)" />, title: 'PIN-Based Access', desc: 'Secure PIN codes for parents to access student results.' },
    { icon: <MessageSquare size={32} color="var(--color-primary)" />, title: 'Real-time Chat', desc: 'Built-in messaging between staff and administrators.' },
    { icon: <CreditCard size={32} color="var(--color-primary)" />, title: 'Payment Integration', desc: 'Seamless payment collection via Squad by GTBank.' },
];

const schoolBenefits = [
    { icon: <Users size={24} color="var(--color-primary)" />, title: 'Centralized Management', desc: 'Manage all students, staff, and operations from one dashboard.' },
    { icon: <BarChart2 size={24} color="var(--color-primary)" />, title: 'Automated Grading', desc: 'Set custom grading schemes and let the system compute results automatically.' },
    { icon: <TrendingUp size={24} color="var(--color-primary)" />, title: 'Performance Insights', desc: 'Get real-time analytics and reports on school performance.' },
];

const staffBenefits = [
    { icon: <BookOpen size={24} color="var(--color-primary)" />, title: 'Class Management', desc: 'Manage classes, subjects, attendance, and grades seamlessly.' },
    { icon: <CheckCircle size={24} color="var(--color-primary)" />, title: 'Efficient Workflow', desc: 'Reduce paperwork and focus on teaching with automated processes.' },
    { icon: <MessageSquare size={24} color="var(--color-primary)" />, title: 'Stay Connected', desc: 'Communicate with administrators and parents in real-time.' },
];

export default function HomePage() {
    return (
        <div>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                padding: '80px 20px 120px',
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: '#FFFFFF'
            }}>
                <div style={{ position: 'absolute', top: '10%', left: '15%', width: 400, height: 400, background: 'var(--color-primary-100)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300, background: 'var(--color-info)', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%' }}></div>

                <div className="hero-layout">
                    <div className="hero-content-card" style={{ position: 'relative', zIndex: 2, padding: '60px 40px', borderRadius: 40, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 45px rgba(29, 78, 216, 0.08)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)' }}>
                        <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--color-gray-900)', textAlign: 'center' }}>
                            Manage Your School <br />
                            With <span style={{ color: 'var(--color-primary)' }}>Ease</span>
                        </h1>
                        <p style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: 'var(--color-gray-600)', marginBottom: 40, maxWidth: 650, margin: '0 auto 40px', textAlign: 'center' }}>
                            academicX brings student management, automated grading, real-time attendance, and secure result access to one place.
                        </p>
                        <div className="hero-actions" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                            <Link to="/downloads" className="btn btn-primary btn-lg" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 24px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    Download App
                                </span>
                            </Link>
                            <WebAppDropdown variant="glass" className="btn-lg" style={{ padding: '12px 24px' }} hideIcon={true} />
                        </div>
                    </div>

                    <div className="hero-image-frame" aria-hidden="true">
                        <img
                            src="https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp"
                            alt="Introducting academicX - The Ultimate School Management Software"
                        />
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section style={{ padding: '80px 20px', background: 'var(--color-gray-50)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>Everything You Need</h2>
                        <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--color-gray-500)', marginTop: 12 }}>Powerful tools designed for modern schools. From enrollment to graduation.</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 24
                    }}>
                        {features.map((f, i) => (
                            <div key={i} style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid var(--color-gray-100)', transition: 'all 0.3s ease' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                            }}
                            >
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

            {/* Dashboard Preview Section */}
            <section style={{ padding: '80px 20px', background: 'var(--color-gray-50)' }}>
                <div className="grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', marginBottom: 20 }}>Beautifully Simple.<br />Incredibly Powerful.</h2>
                        <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--color-gray-600)', marginBottom: 32 }}>We've reimagined how a school portal should feel. Light, fast, and organized. Say goodbye to old clunky paper based system and hello to ultra-modern software.</p>
                        <Link to="/how-it-works" className="btn btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }}>See How It Works →</Link>
                    </div>
                    <div className="dashboard-preview-image">
                        <img src="https://res.cloudinary.com/dlvffw5wt/image/upload/f_webp/q_auto:eco/Gemini_Generated_Image_l0aqi5l0aqi5l0aq_mqmtcp" alt="academicX Dashboard Preview" style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} />
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section style={{ padding: '60px 20px', background: 'linear-gradient(135deg, var(--color-primary-50) 0%, rgba(124, 58, 237, 0.05) 100%)', textAlign: 'center' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', marginBottom: 20, color: 'var(--color-gray-900)' }}>Ready to Transform Your School?</h2>
                    <p style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'var(--color-gray-600)', marginBottom: 40 }}>Join modern schools already using academicX to manage their operations seamlessly.</p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="https:/academicx.ng/admin" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16, textDecoration: 'none', display: 'inline-block' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                Deploy in Your School
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
                .hero-layout {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 1180px;
                    margin: 0 auto;
                    min-height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                }
                .hero-image-frame {
                    position: absolute;
                    inset: 0;
                    border-radius: 36px;
                    overflow: hidden;
                    border: 1px solid rgba(0, 0, 0, 0.07);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                    z-index: 1;
                }
                .hero-image-frame img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .hero-content-card {
                    max-width: 780px;
                    width: 100%;
                }
                @media (max-width: 768px) {
                    section {
                        padding: 40px 20px !important;
                    }
                    .grid {
                        grid-template-columns: 1fr !important;
                    }
                    h1, h2 {
                        margin-bottom: 16px !important;
                    }
                    .dashboard-preview-image {
                        display: none !important;
                    }
                }
                @media (max-width: 980px) {
                    .hero-layout {
                        min-height: 560px;
                        padding: 20px;
                    }
                    .hero-image-frame {
                        border-radius: 32px;
                    }
                    .hero-content-card {
                        padding: 40px 20px !important;
                        border-radius: 28px !important;
                        background: rgba(255, 255, 255, 0.9) !important;
                    }
                }
                @media (max-width: 480px) {
                    .hero-actions .btn-lg {
                        padding: 10px 14px !important;
                        font-size: 13px !important;
                    }
                }
            `}</style>
        </div>
    );
}
