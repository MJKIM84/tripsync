import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import SchedulePage from './pages/SchedulePage';
import JournalPage from './pages/JournalPage';
import GalleryPage from './pages/GalleryPage';
import MembersPage from './pages/MembersPage';
import BudgetPage from './pages/BudgetPage';
import ChecklistPage from './pages/ChecklistPage';
import DocumentsPage from './pages/DocumentsPage';
import FeedPage from './pages/FeedPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import PlacesPage from './pages/PlacesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/trips/:id" element={<TripPage />} />
                <Route path="/trips/:id/schedule" element={<SchedulePage />} />
                <Route path="/trips/:id/journal" element={<JournalPage />} />
                <Route path="/trips/:id/gallery" element={<GalleryPage />} />
                <Route path="/trips/:id/members" element={<MembersPage />} />
                <Route path="/trips/:id/budget" element={<BudgetPage />} />
                <Route path="/trips/:id/checklist" element={<ChecklistPage />} />
                <Route path="/trips/:id/documents" element={<DocumentsPage />} />
                <Route path="/trips/:id/feed" element={<FeedPage />} />
                <Route path="/trips/:id/chat" element={<ChatPage />} />
                <Route path="/trips/:id/places" element={<PlacesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
