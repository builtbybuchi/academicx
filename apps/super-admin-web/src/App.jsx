import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Building2, CreditCard, TrendingUp, Settings, LogOut } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
import AuthPage from '../../../shared/components/AuthPage.jsx';
import Dashboard from './pages/dashboard.jsx';
import Schools from './pages/schools.jsx';
import Payments from './pages/payments.jsx';
import Analytics from './pages/analytics.jsx';
import System from './pages/system.jsx';

const menuGroups = [
    { section: 'Platform', items: [{ id: '/', label: 'Dashboard', icon: <BarChart size={20} /> }] },
    {
        section: 'Management', items: [
            { id: '/schools', label: 'Schools', icon: <Building2 size={20} /> },
            { id: '/payments', label: 'Payments', icon: <CreditCard size={20} /> },
            { id: '/analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
        ]
    },
    { section: 'System', items: [{ id: '/system', label: 'Administration', icon: <Settings size={20} /> }] },
];

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile, effectiveRole, loading, login, logout } = useAuth();

    if (loading) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    if (!user) {
        return (
            <AuthPage
                brand="AcademicX"
                title="Spark your platform control"
                subtitle="Monitor schools, payments, and system health from one super-admin command center."
                allowSignup={false}
                highlights={[
                    'Full-school oversight and control',
                    'Platform-wide payment visibility',
                    'Cross-tenant governance tools',
                ]}
                onLogin={({ email, password }) => login(email, password)}
            />
        );
    }

    if (effectiveRole !== 'super_admin') {
        return (
            <div style={{ padding: 24, maxWidth: 520, margin: '40px auto' }}>
                <h2 style={{ marginBottom: 8 }}>Access Restricted</h2>
                <p style={{ marginBottom: 16 }}>Only super-admin accounts can open this portal.</p>
                <button className="btn btn-primary" onClick={logout}>Sign Out</button>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <button
                className="btn btn-danger btn-sm"
                onClick={logout}
                style={{ position: 'fixed', right: 12, top: 10, zIndex: 1200, display: 'flex', alignItems: 'center', gap: 6 }}
            >
                <LogOut size={14} /> Sign Out
            </button>
            <Sidebar
                menuGroups={menuGroups}
                activeId={location.pathname}
                onNavigate={(id) => navigate(id)}
                appName="Super Admin"
                userName={profile ? `${profile.firstName} ${profile.lastName}` : 'Super Admin'}
                userRole="Platform Admin"
            />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/schools" element={<Schools />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/system" element={<System />} />
                </Routes>
            </main>
        </div>
    );
}
