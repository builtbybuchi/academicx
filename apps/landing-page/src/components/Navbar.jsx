import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px',
            background: scrolled ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            borderBottom: scrolled ? '1px solid var(--color-gray-100)' : 'none',
            zIndex: 1000,
            transition: 'all 0.3s ease'
        }}>
            <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'var(--color-primary)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 800
                    }}>A</div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-gray-900)', fontFamily: 'var(--font-heading)' }}>AcademicX</span>
                </Link>

                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <Link to="/" style={{ color: pathname === '/' ? 'var(--color-primary)' : 'var(--color-gray-600)', fontWeight: pathname === '/' ? 600 : 500, fontSize: 15 }}>Home</Link>
                    <Link to="/about" style={{ color: pathname === '/about' ? 'var(--color-primary)' : 'var(--color-gray-600)', fontWeight: pathname === '/about' ? 600 : 500, fontSize: 15 }}>About</Link>
                    <Link to="/pricing" style={{ color: pathname === '/pricing' ? 'var(--color-primary)' : 'var(--color-gray-600)', fontWeight: pathname === '/pricing' ? 600 : 500, fontSize: 15 }}>Pricing</Link>
                    <Link to="/contact" style={{ color: pathname === '/contact' ? 'var(--color-primary)' : 'var(--color-gray-600)', fontWeight: pathname === '/contact' ? 600 : 500, fontSize: 15 }}>Contact</Link>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <button className="btn btn-glass" style={{
                        border: '1px solid var(--color-gray-200)',
                        background: '#fff', color: 'var(--color-gray-900)'
                    }}>Log In</button>
                    <button className="btn btn-primary">Sign in free</button>
                </div>
            </div>
        </nav>
    );
}
