import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, CheckSquare, MessageCircle, Clock, LogOut } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
import AuthPage from '../../../shared/components/AuthPage.jsx';
import Dashboard from './pages/dashboard.jsx';
import ResultsEntry from './pages/results-entry.jsx';
import Attendance from './pages/attendance.jsx';
import StaffAttendance from './pages/staff-attendance.jsx';
import Chat from './pages/chat.jsx';

const menuGroups = [
    { section: 'Overview', items: [{ id: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }] },
    {
        section: 'Teaching', items: [
            { id: '/results-entry', label: 'Enter Results', icon: <FileEdit size={20} /> },
            { id: '/attendance', label: 'Student Attendance', icon: <CheckSquare size={20} /> },
        ]
    },
    {
        section: 'My Records', items: [
            { id: '/my-attendance', label: 'My Attendance', icon: <Clock size={20} /> },
        ]
    },
    { section: 'Communication', items: [{ id: '/chat', label: 'Chat', icon: <MessageCircle size={20} /> }] },
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
                role="staff"
                brand="AcademicX"
                title="Spark your teaching flow"
                subtitle="Manage attendance, class results, and school communication from one portal."
                allowSignup={false}
                highlights={[
                    'Enter CAT and exam scores with backend validation',
                    'Take attendance by class in minutes',
                    'Collaborate with admins and teachers in chat',
                ]}
                onLogin={({ email, password }) => login(email, password)}
            />
        );
    }

    if (effectiveRole !== 'staff') {
        return (
            <div style={{ padding: 24, maxWidth: 520, margin: '40px auto' }}>
                <h2 style={{ marginBottom: 8 }}>Access Restricted</h2>
                <p style={{ marginBottom: 16 }}>This account does not have staff portal permission.</p>
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
                appName="Staff Portal"
                userName={profile ? `${profile.firstName} ${profile.lastName}` : 'Staff'}
                userRole={profile?.department || 'Teacher'}
            />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/results-entry" element={<ResultsEntry />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/my-attendance" element={<StaffAttendance />} />
                    <Route path="/chat" element={<Chat />} />
                </Routes>
            </main>
        </div>
    );
}
