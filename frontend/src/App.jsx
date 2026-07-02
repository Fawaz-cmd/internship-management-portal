import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboards
import InternDashboard from './pages/intern/InternDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';

// Admin Pages
import UsersPage from './pages/admin/UsersPage';

// Shared Pages
import KanbanBoard from './pages/shared/KanbanBoard';

// Protected Route Guard
function PrivateRoute({ children }) {
  const { user, checkAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      await checkAuth();
      setChecking(false);
    };
    run();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0f0a1c] text-[#f1f5f9] flex items-center justify-center font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Validating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Dynamically Route Dashboard based on Role
function DynamicDashboard() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'intern') {
    return <InternDashboard />;
  }
  if (['mentor', 'team_lead'].includes(user.role)) {
    return <MentorDashboard />;
  }

  // Fallback default view for admin/HR
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Portal Administration</h1>
      <p className="text-sm text-brand-muted">Use the navigation menu to manage users and view audit trails.</p>
      
      <div className="p-6 rounded-2xl glass-panel bg-white/5 space-y-4">
        <p className="text-sm text-white">System Admin Active Session: <strong>{user.email}</strong></p>
        <span className="text-xs bg-brand-teal/20 text-brand-teal px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          {user.role.replace(/_/g, ' ')} Privilege
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard workspace */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DynamicDashboard />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="projects" element={<div className="p-6 text-brand-muted">Projects and Sprints directory under construction for Phase 2. Use Kanban for task management.</div>} />
          <Route path="meetings" element={<div className="p-6 text-brand-muted">Meetings scheduler is under construction for Phase 2.</div>} />
          <Route path="progress" element={<Navigate to="/dashboard" replace />} />
          <Route path="attendance" element={<Navigate to="/dashboard" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="audit-logs" element={<div className="p-6 text-brand-muted">System logs page will be fully integrated in Phase 2.</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
