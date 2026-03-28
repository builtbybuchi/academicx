import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SchoolLayout } from '@/layouts/SchoolLayout';
import { EventsPage } from '@/pages/EventsPage';
import { FeesPage } from '@/pages/FeesPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { HomePage } from '@/pages/HomePage';
import { NewsPage } from '@/pages/NewsPage';
import { ResultsPage } from '@/pages/ResultsPage';
import { StaffPage } from '@/pages/StaffPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<SchoolLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/staff" element={<StaffPage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/fees" element={<FeesPage />} />
                    <Route path="/site/:slug" element={<HomePage />} />
                    <Route path="/site/:slug/events" element={<EventsPage />} />
                    <Route path="/site/:slug/gallery" element={<GalleryPage />} />
                    <Route path="/site/:slug/news" element={<NewsPage />} />
                    <Route path="/site/:slug/staff" element={<StaffPage />} />
                    <Route path="/site/:slug/results" element={<ResultsPage />} />
                    <Route path="/site/:slug/fees" element={<FeesPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
