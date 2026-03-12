import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, CheckSquare, MessageCircle, Clock } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
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
    const { profile } = useAuth();

    return (
        <div className="app-layout">
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
