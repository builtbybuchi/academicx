import React from 'react';
import { Link } from 'react-router-dom';

const footerLinkStyle = {
    fontSize: 14,
    color: 'var(--color-gray-600)',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    cursor: 'pointer'
};

export default function Footer() {
    return (
        <footer style={{ background: 'var(--color-gray-50)', padding: '60px 20px 40px', borderTop: '1px solid var(--color-gray-200)' }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 40,
                marginBottom: 40
            }}>

                {/* Brand */}
                <div>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none', marginBottom: 16, justifyContent: 'flex-start' }}>
                        <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-primary-900)', fontFamily: 'var(--font-heading)' }}>academic</span>

                        <img
                            src="/logo.png"
                            alt="academicX"
                            style={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                        />
                    </Link>
                    <p style={{ color: 'var(--color-gray-600)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                        The platform that runs modern schools. Manage students and empower staff effortlessly.
                    </p>
                    <a href="https://lexrunit.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 14, fontWeight: 600, color: 'var(--color-primary-600)' }}>
                        A Lexrunit company →
                    </a>
                </div>


                {/* Pages */}
                <div>
                    <h4 style={{ fontSize: 16, marginBottom: 20, fontWeight: 700, color: 'var(--color-gray-900)' }}>Quick links</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Link to="/about" style={footerLinkStyle}>About Us</Link>
                        <Link to="/how-it-works" style={footerLinkStyle}>How It Works</Link>
                        <Link to="/pricing" style={footerLinkStyle}>Pricing</Link>
                        <Link to="/downloads" style={footerLinkStyle}>Downloads</Link>
                        <Link to="/contact" style={footerLinkStyle}>Contact Us</Link>

                    </div>
                </div>

                {/* Legal */}
                <div>
                    <h4 style={{ fontSize: 16, marginBottom: 20, fontWeight: 700, color: 'var(--color-gray-900)' }}>Legal & Support</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Link to="/privacy" style={footerLinkStyle}>Privacy Policy</Link>
                        <Link to="/terms" style={footerLinkStyle}>Terms & Conditions</Link>
                        <a href="mailto:contact@academicx.ng" style={footerLinkStyle}>contact@academicx.ng</a>
                        <a href="tel:+2348077264273" style={footerLinkStyle}>+234 807 726 4273</a>
                    </div>
                </div>

            </div>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                borderTop: '1px solid var(--color-gray-200)',
                paddingTop: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
            }}>
                <span style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>© 2026 academicX, All rights reserved.</span>
                <span style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>Payments powered by Squad (GTBank)</span>
            </div>

            <style>{`
                a[href^="mailto:"],
                a[href^="tel:"],
                a:not(.active) {
                    transition: color 0.3s ease;
                }
                a[href^="mailto:"]:hover,
                a[href^="tel:"]:hover {
                    color: var(--color-primary) !important;
                }
            `}</style>
        </footer>
    );
}
