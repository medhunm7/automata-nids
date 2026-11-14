import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import Events from './pages/Events';
import AutomataSimulator from './pages/AutomataSimulator';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import api from './api/axios';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(10000); // 10s default auto refresh
  const [alertsCount, setAlertsCount] = useState(0);

  const fetchQuickAlertCount = async () => {
    try {
      const res = await api.get('/alerts?limit=1');
      if (res.data.success) {
        setAlertsCount(res.data.pagination.total || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchQuickAlertCount();
    const interval = setInterval(fetchQuickAlertCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <Navbar
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        onRefreshNow={() => window.location.reload()}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          alertsCount={alertsCount}
        />

        <main className="flex-1 md:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {React.cloneElement(children, { autoRefreshInterval })}
        </main>
      </div>
    </div>
  );
};

// Protected Route wrapper that allows demo viewing or requires login if configured
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Core Application Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><AutomataSimulator /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
