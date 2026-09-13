import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin   from './AdminLogin';
import AdminGuard   from './AdminGuard';
import AdminShell   from './AdminShell';
import DashboardPage from './pages/DashboardPage';
import UsersPage    from './pages/UsersPage';
import ChannelsPage from './pages/ChannelsPage';
import PaymentsPage from './pages/PaymentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function AdminApp() {
  return (
    <Routes>
      {/* Página de Login */}
      <Route path="login" element={<AdminLogin />} />

      {/* Rotas protegidas — AdminGuard verifica a sessão */}
      <Route
        path="*"
        element={
          <AdminGuard>
            <AdminShell>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="users"     element={<UsersPage />} />
                <Route path="channels"  element={<ChannelsPage />} />
                <Route path="payments"  element={<PaymentsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings"  element={<SettingsPage />} />
                {/* Fallback para rota desconhecida dentro do admin */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminShell>
          </AdminGuard>
        }
      />
    </Routes>
  );
}
