import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  IdCard, Download, RefreshCw, CheckCircle, Clock,
  User, Calendar, Shield, Hash
} from 'lucide-react';
import { generateAndDownloadPdf } from '../../utils/pdfGenerator';

export default function Home() {
  const { user, refreshUser } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');

  const isOfficial = user?.role === 'official';
  const isAdmin = user?.role === 'admin';

  const handleGenerateCard = async () => {
    setGenerating(true);
    setMsg('');
    try {
      setMsg('🔄 Enhancing photo... This may take a few seconds.');
      
      // 0. Process the photo (background removal & face crop)
      const { data } = await axios.post('/api/members/me/process-photo');
      const updatedUser = { ...user, ...data.member };
      
      setMsg('🔄 Generating ID card PDF...');
      
      // 1. Generate and download PDF on the client
      await generateAndDownloadPdf(updatedUser);
      
      // 2. Notify backend to mark card as generated
      await axios.post('/api/members/me/generate-card');
      await refreshUser();
      
      setMsg('✅ ID card generated successfully!');
    } catch (err) {
      console.error(err);
      setMsg('❌ ' + (err.response?.data?.error || 'Generation failed. Please try again.'));
    } finally {
      setGenerating(false);
    }
  };

  const cards = [
    { label: 'Member ID', value: user?.memberId, icon: Hash, color: 'bg-green-50 text-green-700' },
    { label: 'Role', value: user?.position || user?.role, icon: Shield, color: 'bg-blue-50 text-blue-700', cap: true },
    { label: 'Session', value: user?.session, icon: Calendar, color: 'bg-purple-50 text-purple-700' },
    ...(isOfficial && user?.expiryDate
      ? [{ label: 'Card Expiry', value: new Date(user.expiryDate).toLocaleDateString('en-GB'), icon: Clock, color: 'bg-orange-50 text-orange-700' }]
      : [])
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Salaam, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 mb-8">
            {isAdmin ? 'You are logged in as system admin.' : `Welcome to your MSSN ${isOfficial ? 'Official' : 'Member'} dashboard.`}
          </p>
        </motion.div>

        {/* Member info cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon, color, cap }) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className={`font-bold text-gray-900 text-sm ${cap ? 'capitalize' : ''}`}>{value || '—'}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ID Card Section */}
        {!isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <IdCard size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Your ID Card</h2>
                <p className="text-sm text-gray-500">
                  {isOfficial ? 'Official portrait-style ID card' : 'Membership ID card (landscape)'}
                </p>
              </div>
              <div className="ml-auto">
                {user?.cardGenerated
                  ? <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle size={14} /> Ready
                    </span>
                  : <span className="flex items-center gap-1.5 text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-full">
                      <Clock size={14} /> Not Generated
                    </span>}
              </div>
            </div>

            {/* Card preview placeholder */}
            <div className={`relative rounded-2xl overflow-hidden mb-6 ${isOfficial
              ? 'h-56 bg-gradient-to-b from-gray-100 to-primary/20'
              : 'h-36 bg-gradient-to-r from-gray-100 to-primary/20'}`}>
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                <IdCard size={40} className="text-primary/30" />
                <p className="text-xs text-gray-400">
                  {user?.cardGenerated ? 'Card generated — download below' : 'Generate your card to preview'}
                </p>
              </div>
              {/* Role badge overlay */}
              <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                {isOfficial ? 'OFFICIAL' : 'MEMBER'}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button onClick={handleGenerateCard} loading={generating} className="flex-1">
                {user?.cardGenerated ? <><Download size={16} /> Download Card Again</> : <><IdCard size={16} /> Generate & Download Card</>}
              </Button>
            </div>

            {msg && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`mt-4 text-sm text-center font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {msg}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Notice for members without photo */}
        {!isAdmin && !user?.photoUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-amber-500 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">No Photo Uploaded</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Your ID card will show a placeholder. Upload your passport photo in{' '}
                <a href="/dashboard/profile" className="underline font-semibold">Profile Settings</a>.
              </p>
            </div>
          </motion.div>
        )}

        {isAdmin && (
          <div className="card text-center py-10">
            <Shield size={48} className="text-primary mx-auto mb-3" />
            <h2 className="font-bold text-gray-900 mb-2">Admin Account</h2>
            <p className="text-gray-500 text-sm mb-4">Manage all members and generate ID cards from the Admin panel.</p>
            <a href="/admin" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-6">
              Go to Admin Panel →
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
