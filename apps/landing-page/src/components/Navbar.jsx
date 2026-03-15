import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download, Globe } from 'lucide-react';
import WebAppDropdown from './WebAppDropdown';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                background: scrolled ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--color-gray-100)' : 'none',
                zIndex: 1000,
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    maxWidth: 1400,
                    width: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px'
                }}>

                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none', minWidth: 0 }}>
                     <span style={{
                            fontSize: 30,
                            fontWeight: 800,
                            color: 'var(--color-primary-900)',
                            fontFamily: 'var(--font-heading)',
                            whiteSpace: 'nowrap'
                        }} className="logo-text">
                            academic
                        </span>
                        <img
                            src="/logo.png"
                            alt="academicX"
                            style={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                            className="logo-mark"
                        />
                       
                    </Link>

                    {/* Desktop Navigation */}
                    <div style={{
                        display: 'flex',
                        gap: 32,
                        alignItems: 'center',
                        flex: 1,
                        marginLeft: 40
                    }} className="desktop-nav">
                        <Link to="/about" style={{ color: pathname === '/about' ? 'var(--color-primary)' : 'var(--color-gray-600)', fontWeight: pathname === '/about' ? 600 : 500, fontSize: 15 }}>About</Link>
                        <Link to="/pricing" style={{ color: pathname === '/pricing' ? 'var(--color-primary)' : 'var(--color-gray-600)', fontWeight: pathname === '/pricing' ? 600 : 500, fontSize: 15 }}>Pricing</Link>
                        <Link to="/contact" style={{ color: pathname === '/contact' ? 'var(--color-primary)' : 'var(--color-gray-600)', fontWeight: pathname === '/contact' ? 600 : 500, fontSize: 15 }}>Contact Us</Link>

                    </div>

                    {/* Desktop CTA Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center'
                    }} className="desktop-cta">
                        <Link to="/downloads" className="btn btn-glass" style={{
                            padding: '10px 16px',
                            border: '1px solid var(--color-gray-200)',
                            background: '#fff',
                            color: 'var(--color-gray-900)',
                            textDecoration: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.background = 'var(--color-primary-50)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-gray-200)';
                            e.currentTarget.style.background = '#fff';
                        }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <Download size={16} />
                                Download
                            </span>
                        </Link>
                        <WebAppDropdown />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 8
                        }}
                        className="mobile-menu-btn"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 80,
                    left: 0,
                    right: 0,
                    background: '#fff',
                    padding: '20px',
                    borderBottom: '1px solid var(--color-gray-200)',
                    zIndex: 999,
                    display: 'none'
                }} className="mobile-menu">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ color: 'var(--color-gray-900)', fontWeight: 500, textDecoration: 'none' }}
                        >
                            Home
                        </Link>
                        <Link
                            to="/about"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ color: 'var(--color-gray-900)', fontWeight: 500, textDecoration: 'none' }}
                        >
                            About
                        </Link>
                        <Link
                            to="/pricing"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ color: 'var(--color-gray-900)', fontWeight: 500, textDecoration: 'none' }}
                        >
                            Pricing
                        </Link>
                        <Link
                            to="/contact"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ color: 'var(--color-gray-900)', fontWeight: 500, textDecoration: 'none' }}
                        >
                            Contact
                        </Link>
                        <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--color-gray-200)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <Link
                                to="/downloads"
                                onClick={() => setMobileMenuOpen(false)}
                                className="btn btn-primary"
                                style={{
                                    padding: '10px 16px',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    display: 'block',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 14
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <Download size={16} />
                                    Download App
                                </span>
                            </Link>

                            <WebAppDropdown variant="glass" style={{ width: '100%' }} />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .desktop-cta {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    .mobile-menu {
                        display: block !important;
                    }
                    .logo-text {
                        display: inline !important;
                        font-size: 24px !important;
                        line-height: 1;
                    }
                    .logo-mark {
                        width: 24px !important;
                        height: 24px !important;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-menu-btn {
                        display: none !important;
                    }
                    .mobile-menu {
                        display: none !important;
                    }
                    .logo-text {
                        display: inline !important;
                    }
                }
            `}</style>
        </>
    );
}
