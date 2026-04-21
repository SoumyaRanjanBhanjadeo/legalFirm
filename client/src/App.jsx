import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { lazy, Suspense } from 'react';
import store from './store';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all page components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./components/dashboard/DashboardHome'));
const CasesPage = lazy(() => import('./components/dashboard/CasesPage'));
const ClientsPage = lazy(() => import('./components/dashboard/ClientsPage'));
const HearingsPage = lazy(() => import('./components/dashboard/HearingsPage'));
const DocumentsPage = lazy(() => import('./components/dashboard/DocumentsPage'));
const MessagesPage = lazy(() => import('./components/dashboard/MessagesPage'));
const ReportsPage = lazy(() => import('./components/dashboard/ReportsPage'));
const UsersPage = lazy(() => import('./components/dashboard/UsersPage'));
const SettingsPage = lazy(() => import('./components/dashboard/SettingsPage'));
const ProfilePage = lazy(() => import('./components/dashboard/Profile'));
const AIChatBot = lazy(() => import('./components/dashboard/AIChatBot'));
const NotificationsPage = lazy(() => import('./components/dashboard/NotificationsPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={<LoadingFallback />}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="hearings" element={<HearingsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="ai-chatbot" element={<AIChatBot />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
    </Provider>
  );
}

export default App;
