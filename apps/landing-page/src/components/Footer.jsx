import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{ background: 'var(--color-gray-50)', padding: '80px 40px 40px', borderTop: '1px solid var(--color-gray-200)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 40, marginBottom: 60 }}>

                {/* Brand */}
                <div>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 16, justifyContent: 'flex-start' }}>
                        <img
                            src="/logo.png"
                            alt="AcademicX"
                            style={{ width: 36, height: 36, objectFit: 'contain', display: 'block' }}
                        />
                        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-gray-900)', fontFamily: 'var(--font-heading)' }}>AcademicX</span>
                    </Link>
                    <p style={{ color: 'var(--color-gray-600)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                        The premier platform for running African schools with absolute liquid precision. Manage students, staff, and parents effortlessly.
                    </p>
                    <a href="https://lexrunit.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 14, fontWeight: 600, color: 'var(--color-primary-600)' }}>
                        A Lexrunit company →
                    </a>
                </div>

                {/* Features */}
                <div>
                    <h4 style={{ fontSize: 16, marginBottom: 20 }}>Features</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <li style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>• Student Management</li>
                        <li style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>• Result Computation</li>
                        <li style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>• Attendance Tracking</li>
                        <li style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>• PIN-Based Access</li>
                        <li style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>• Real-time Chat</li>
                        <li style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>• Payment Integration</li>
                    </ul>
                </div>

                {/* Pages */}
                <div>
                    <h4 style={{ fontSize: 16, marginBottom: 20 }}>Pages</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Link to="/about" style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>About Us</Link>
                        <Link to="/how-it-works" style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>How It Works</Link>
                        <Link to="/pricing" style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>Pricing</Link>
                        <Link to="/contact" style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>Contact</Link>
                    </div>
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{ fontSize: 16, marginBottom: 20 }}>Legal & Support</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Link to="/privacy" style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>Privacy Policy</Link>
                        <Link to="/terms" style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>Terms & Conditions</Link>
                        <span style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>support@academicx.com</span>
                        <span style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>+234 800 123 4567</span>
                    </div>
                </div>

            </div>
            <div style={{ maxWidth: 1200, margin: '0 auto', borderTop: '1px solid var(--color-gray-200)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>© 2026 AcademicX, A Lexrunit company. All rights reserved.</span>
                <span style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>Payments powered by Squad (GTBank)</span>
            </div>
        </footer>
    );
}
