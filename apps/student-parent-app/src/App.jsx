import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, ClipboardList, KeySquare } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
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
    const { profile } = useAuth();

    return (
        <div className="app-layout">
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
