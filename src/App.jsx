import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Verify from './pages/Verify.jsx';
import Home from './pages/dashboard/Home.jsx';
import Profile from './pages/dashboard/Profile.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';
import Members from './pages/admin/Members.jsx';
import MemberDetail from './pages/admin/MemberDetail.jsx';
import BulkUpload from './pages/admin/BulkUpload.jsx';
import DeletionLogs from './pages/admin/DeletionLogs.jsx';
import Positions from './pages/admin/Positions.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:memberId" element={<Verify />} />
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminHome /></ProtectedRoute>} />
          <Route path="/admin/members" element={<ProtectedRoute adminOnly><Members /></ProtectedRoute>} />
          <Route path="/admin/members/:id" element={<ProtectedRoute adminOnly><MemberDetail /></ProtectedRoute>} />
          <Route path="/admin/bulk-upload" element={<ProtectedRoute adminOnly><BulkUpload /></ProtectedRoute>} />
          <Route path="/admin/deletion-logs" element={<ProtectedRoute adminOnly><DeletionLogs /></ProtectedRoute>} />
          <Route path="/admin/positions" element={<ProtectedRoute adminOnly><Positions /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
