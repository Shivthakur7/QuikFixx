import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import ProviderLoginPage from './pages/ProviderLoginPage';
import ProviderRegisterPage from './pages/ProviderRegisterPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';

import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.isAdmin) return <>{children}</>;
  return user?.provider ? <Navigate to="/provider/dashboard" /> : <Navigate to="/map" />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login/provider" element={<ProviderLoginPage />} />
              <Route path="/register/provider" element={<ProviderRegisterPage />} />

              {/* Provider Routes */}
              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute>
                    <ProviderDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/profile"
                element={
                  <ProtectedRoute>
                    <ProviderProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
