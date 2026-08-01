import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { motion } from 'framer-motion';
import { Users, UserCheck, IdCard, TrendingUp, ArrowRight, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('signature', file);
    try {
      await axios.post('/api/admin/settings/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Amir Signature updated successfully! All newly generated ID cards will now use this signature.');
    } catch (err) {
      alert('Failed to update signature. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(r => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Members', value: stats.total, icon: Users, color: 'bg-blue-50 text-blue-600', change: 'All registered members' },
    { label: 'Officials', value: stats.officials, icon: UserCheck, color: 'bg-green-50 text-green-600', change: 'Upgraded officials' },
    { label: 'Regular Members', value: stats.members, icon: Users, color: 'bg-purple-50 text-purple-600', change: 'Active members' },
    { label: 'Cards Generated', value: stats.cardsGenerated, icon: IdCard, color: 'bg-orange-50 text-orange-600', change: 'PDF cards created' },
  ] : [];

  const quickActions = [
    { to: '/admin/members', label: 'Manage Members', desc: 'View, search, upgrade & generate cards', icon: Users },
    { to: '/admin/bulk-upload', label: 'Bulk Upload', desc: 'Import members from CSV file', icon: TrendingUp },
    { to: '/admin/deletion-logs', label: 'Deletion Logs', desc: 'Audit trail of deleted members', icon: ShieldAlert },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">MSSN FUTB Chapter ID Card Management System</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="card h-28 shimmer rounded-2xl" />
              ))
            : cards.map(({ label, value, icon: Icon, color, change }) => (
                <motion.div key={label} whileHover={{ y: -2 }} className="card">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  <p className="text-xs text-gray-400 mt-1">{change}</p>
                </motion.div>
              ))}
        </div>

        {/* Quick actions */}
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(({ to, label, desc, icon: Icon }) => (
            <Link key={to} to={to}>
              <motion.div whileHover={{ y: -2 }} className="card hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-300" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Session info */}
        <div className="mt-6 bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <IdCard size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">Academic Session: 2025/2026</p>
            <p className="text-gray-500 text-xs">All new registrations are for the current session</p>
          </div>
        </div>

        {/* Signature Settings */}
        <h2 className="font-bold text-gray-900 mt-8 mb-4">Card Settings</h2>
        <div className="card">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-gray-300">
              <Upload size={24} className="text-gray-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-gray-900">Update Amir's Signature</h3>
              <p className="text-sm text-gray-500 mt-1">Upload a transparent PNG image of the Amir's signature. This will automatically appear on all Official and Member ID cards generated from now on.</p>
            </div>
            <div className="mt-4 md:mt-0 relative">
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handleSignatureUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <button disabled={uploading} className="btn-primary pointer-events-none">
                {uploading ? 'Uploading...' : 'Upload Signature'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
