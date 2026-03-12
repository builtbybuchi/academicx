import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Building2, CreditCard, TrendingUp, Settings } from 'lucide-react';
import Sidebar from '../../../shared/components/Sidebar.jsx';
import { useAuth } from '../../../shared/utils/auth.jsx';
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
    const { profile } = useAuth();

    return (
        <div className="app-layout">
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
