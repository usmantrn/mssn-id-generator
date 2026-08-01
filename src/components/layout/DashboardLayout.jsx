import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  LayoutDashboard, Users, Upload, LogOut, User,
  IdCard, Menu, X, ChevronRight, Shield
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const memberNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/profile', icon: User, label: 'My Profile' },
  ];

  const adminNav = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/members', icon: Users, label: 'Members' },
    { to: '/admin/bulk-upload', icon: Upload, label: 'Bulk Upload' },
  ];

  const nav = isAdmin ? adminNav : memberNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <IdCard size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MSSN FUTB</p>
              <p className="text-white/60 text-xs">ID Card System</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 mx-4 my-3 bg-white/10 rounded-xl">
          <p className="text-white font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-white/60 text-xs capitalize">{user?.role} · {user?.memberId}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active ? 'bg-white text-primary shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                <Icon size={18} />
                {label}
                {active && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin badge */}
        {isAdmin && (
          <div className="mx-4 mb-2 px-4 py-2 bg-yellow-400/20 rounded-xl flex items-center gap-2">
            <Shield size={14} className="text-yellow-300" />
            <span className="text-yellow-300 text-xs font-semibold">Admin Panel</span>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-all">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:px-8 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-primary">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-20 lg:p-8 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
