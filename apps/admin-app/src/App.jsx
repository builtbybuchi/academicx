import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, ClipboardList, KeySquare, MessageSquare } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
import Dashboard from './pages/dashboard.jsx';
import Enrollment from './pages/enrollment.jsx';
import Academics from './pages/academics.jsx';
import Grading from './pages/grading.jsx';
import Results from './pages/results.jsx';
import Pins from './pages/pins.jsx';
import Communication from './pages/communication.jsx';

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
        ],
    },
];

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    return (
        <div className="app-layout">
            <Sidebar
                menuGroups={menuGroups}
                activeId={location.pathname}
                onNavigate={(id) => navigate(id)}
                appName="Admin Panel"
                userName={user ? `${user.firstName} ${user.lastName}` : 'Admin'}
                userRole="Administrator"
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
                </Routes>
            </main>
        </div>
    );
}
