import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// Scroll to top helper
function ScrollToTop() {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FFFFFF' }}>
                <Navbar />
                <main style={{ flex: 1, paddingTop: 80 }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/how-it-works" element={<HowItWorksPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}
