import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';
import MinutasPage from './pages/MinutasPage';
import RecursosPage from './pages/RecursosPage';
import ReglamentoPage from './pages/ReglamentoPage';
import UsuariosPage from './pages/UsuariosPage';
import ContratosPage from './pages/ContratosPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect /dashboard to /dashboard/calendario */}
            <Route index element={<Navigate to="/dashboard/calendario" replace />} />
            
            {/* Dashboard pages */}
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="minutas" element={<MinutasPage />} />
            <Route path="recursos" element={<RecursosPage />} />
            <Route path="reglamento" element={<ReglamentoPage />} />
            <Route path="contratos" element={<ContratosPage />} />
            
            {/* Admin only routes */}
            <Route
              path="usuarios"
              element={
                <ProtectedRoute adminOnly>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;