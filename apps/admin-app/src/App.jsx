import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, ClipboardList, KeySquare, MessageSquare, LogOut, Download } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
import AuthPage from '../../../shared/components/AuthPage.jsx';
import { registerSchool } from '../../../shared/utils/api.js';
import Dashboard from './pages/dashboard.jsx';
import Enrollment from './pages/enrollment.jsx';
import Academics from './pages/academics.jsx';
import Grading from './pages/grading.jsx';
import Results from './pages/results.jsx';
import Pins from './pages/pins.jsx';
import Communication from './pages/communication.jsx';
import Chat from './pages/chat.jsx';
import Downloads from './pages/downloads.jsx';

const menuGroups = [
    {
        section: 'Overview',
        items: [
            { id: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        ],
    },
    {
        section: 'Management',
        items: [
            { id: '/enrollment', label: 'Enrollment', icon: <Users size={20} /> },
            { id: '/academics', label: 'Academics', icon: <BookOpen size={20} /> },
            { id: '/grading', label: 'Grading Schemes', icon: <Settings size={20} /> },
        ],
    },
    {
        section: 'Operations',
        items: [
            { id: '/results', label: 'Results', icon: <ClipboardList size={20} /> },
            { id: '/pins', label: 'PIN Codes', icon: <KeySquare size={20} /> },
            { id: '/communication', label: 'Communication', icon: <MessageSquare size={20} /> },
            { id: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> },
        ],
    },
    {
        section: 'Configuration',
        items: [
            { id: '/downloads', label: 'Downloads', icon: <Download size={20} /> },
        ],
    },
];

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile, effectiveRole, loading, login, logout } = useAuth();

    if (loading) {
        return <div style={{ padding: 24 }}>academicX . . . </div>;
    }

    if (!user) {
        return (
            <AuthPage
                brand="academicX"
                title="Manage your school operations"
                subtitle="Manage enrollment, academics, results, and communication from one admin control center."
                allowSignup={true}
                highlights={[
                    'Create and manage school staff and students',
                    'Approve and publish term results',
                    'Generate and manage secure result PINs',
                ]}
                onLogin={({ email, password }) => login(email, password)}
                onSignup={async ({ firstName, lastName, email, password, organization, schoolCode }) => {
                    await registerSchool({
                        firstName,
                        lastName,
                        adminEmail: email,
                        adminPassword: password,
                        schoolName: organization || 'My School',
                        schoolCode,
                        schoolEmail: email,
                    });
                    await login(email, password);
                }}
            />
        );
    }

    if (effectiveRole !== 'admin') {
        return (
            <div style={{ padding: 24, maxWidth: 520, margin: '40px auto' }}>
                <h2 style={{ marginBottom: 8 }}>Access Restricted</h2>
                <p style={{ marginBottom: 16 }}>This account does not have admin portal permission.</p>
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
                appName="Admin Panel"
                userName={profile ? `${profile.firstName} ${profile.lastName}` : 'Admin'}
                userRole={profile?.role === 'super_admin' ? 'Platform Admin' : 'Administrator'}
            />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/enrollment" element={<Enrollment />} />
                    <Route path="/academics" element={<Academics />} />
                    <Route path="/grading" element={<Grading />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/pins" element={<Pins />} />
                    <Route path="/communication" element={<Communication />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/downloads" element={<Downloads />} />
                </Routes>
            </main>
        </div>
    );
}
