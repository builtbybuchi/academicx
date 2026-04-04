import { Route, Routes } from 'react-router-dom';
import { SchoolLayout } from '@/layouts/SchoolLayout';
import { HomePage } from '@/pages/HomePage';
import { EventsPage } from '@/pages/EventsPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { NewsPage } from '@/pages/NewsPage';
import { StaffPage } from '@/pages/StaffPage';
import { ResultsPage } from '@/pages/ResultsPage';
import { FeesPage } from '@/pages/FeesPage';
import { StudentLoginPage } from '@/pages/StudentLoginPage';
import { StudentDashboardPage } from '@/pages/StudentDashboardPage';

export default function App() {
    return (
        <Routes>
            <Route path="/site/:slug" element={<SchoolLayout />}>
                <Route index element={<HomePage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="login" element={<StudentLoginPage />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="results" element={<ResultsPage />} />
                <Route path="fees" element={<FeesPage />} />
            </Route>
            {/* Fallback for root slug via hostSlug logic in SchoolLayout */}
            <Route path="/" element={<SchoolLayout />}>
                <Route index element={<HomePage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="login" element={<StudentLoginPage />} />
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="results" element={<ResultsPage />} />
                <Route path="fees" element={<FeesPage />} />
            </Route>
        </Routes>
    );
}
