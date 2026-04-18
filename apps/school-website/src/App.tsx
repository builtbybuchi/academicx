import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SchoolLayout } from '@/layouts/SchoolLayout';
import { HomePage } from '@/pages/HomePage';
import { EventsPage } from '@/pages/EventsPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { NewsPage } from '@/pages/NewsPage';
import { StaffPage } from '@/pages/StaffPage';
import { StudentLoginPage } from '@/pages/StudentLoginPage';
import { StudentDashboardPage } from '@/pages/StudentDashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const redirected = params.get('redirect');
        if (!redirected) return;
        navigate(redirected, { replace: true });
    }, [location.search, navigate]);

    return (
        <Routes>
            <Route path="/site/:slug" element={<SchoolLayout />}>
                <Route index element={<HomePage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="event" element={<Navigate to="../events" replace />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="login" element={<StudentLoginPage />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="dashboard/results" element={<StudentDashboardPage />} />
                <Route path="dashboard/fees" element={<StudentDashboardPage />} />
                <Route path="results" element={<Navigate to="../dashboard/results" replace />} />
                <Route path="fees" element={<Navigate to="../dashboard/fees" replace />} />
                <Route path="school-fees" element={<Navigate to="../dashboard/fees" replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            {/* Fallback for root slug via hostSlug logic in SchoolLayout */}
            <Route path="/" element={<SchoolLayout />}>
                <Route index element={<HomePage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="event" element={<Navigate to="/events" replace />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="login" element={<StudentLoginPage />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="dashboard/results" element={<StudentDashboardPage />} />
                <Route path="dashboard/fees" element={<StudentDashboardPage />} />
                <Route path="results" element={<Navigate to="/dashboard/results" replace />} />
                <Route path="fees" element={<Navigate to="/dashboard/fees" replace />} />
                <Route path="school-fees" element={<Navigate to="/dashboard/fees" replace />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
