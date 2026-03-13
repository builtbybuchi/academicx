import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, ClipboardList, KeySquare } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
import AuthPage from '../../../shared/components/AuthPage.jsx';
import Dashboard from './pages/dashboard.jsx';
import Results from './pages/results.jsx';
import AttendanceView from './pages/attendance.jsx';
import PinAccess from './pages/pin-access.jsx';

const menuGroups = [
    { section: 'Overview', items: [{ id: '/', label: 'Dashboard', icon: <Home size={20} /> }] },
    {
        section: 'Academics', items: [
            { id: '/results', label: 'My Results', icon: <BarChart2 size={20} /> },
            { id: '/attendance', label: 'Attendance', icon: <ClipboardList size={20} /> },
        ]
    },
    { section: 'Access', items: [{ id: '/pin-access', label: 'PIN Access', icon: <KeySquare size={20} /> }] },
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
                title="Spark your learning journey"
                subtitle="Sign in with your Student ID and your parent phone number or parent email. Student accounts are created by school admins."
                allowSignup={false}
                highlights={[
                    'View your approved term results instantly',
                    'Track attendance trends week by week',
                    'Verify result PINs securely from your portal',
                ]}
                loginFields={[
                    { name: 'studentId', type: 'text', label: 'Student ID', placeholder: 'e.g. SCH/2026/0042', autoComplete: 'username' },
                    { name: 'password', type: 'text', label: 'Parent Phone or Parent Email', placeholder: 'Parent phone number or parent email', autoComplete: 'current-password' },
                ]}
                loginButtonText="Sign in to Student Portal"
                onLogin={({ studentId, password }) => login(studentId, password)}
            />
        );
    }

    if (effectiveRole !== 'student') {
        return (
            <div style={{ padding: 24, maxWidth: 520, margin: '40px auto' }}>
                <h2 style={{ marginBottom: 8 }}>Access Restricted</h2>
                <p style={{ marginBottom: 16 }}>This account does not have student portal permission.</p>
                <button className="btn btn-primary" onClick={logout}>Sign Out</button>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <button
                className="btn btn-danger btn-sm"
                onClick={logout}
                style={{ position: 'fixed', right: 12, top: 10, zIndex: 1200 }}
            >
                Sign Out
            </button>
            <Sidebar
                menuGroups={menuGroups}
                activeId={location.pathname}
                onNavigate={(id) => navigate(id)}
                appName="Student Portal"
                userName={profile ? `${profile.firstName} ${profile.lastName}` : 'Student'}
                userRole={profile?.role === 'student' ? 'Student' : 'Parent'}
            />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/attendance" element={<AttendanceView />} />
                    <Route path="/pin-access" element={<PinAccess />} />
                </Routes>
            </main>
        </div>
    );
}
