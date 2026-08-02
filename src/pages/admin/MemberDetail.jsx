import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { motion } from 'framer-motion';
import { ArrowLeft, IdCard, Download, RefreshCw, Shield, User, Trash2, Camera } from 'lucide-react';

// Positions will now be fetched dynamically from the backend

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('member');
  const [position, setPosition] = useState('');
  const [positions, setPositions] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get(`/api/admin/members/${id}`),
      axios.get('/api/admin/positions')
    ])
    .then(([memberRes, posRes]) => {
      setMember(memberRes.data.member);
      setRole(memberRes.data.member.role);
      setPosition(memberRes.data.member.position || '');
      setPositions(posRes.data.positions);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [id]);

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMsg('');
    try {
      const { data } = await axios.put(`/api/admin/members/${id}/role`, { role, position });
      setMember(data.member);
      setMsg('✅ Role updated successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Update failed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setMsg('');
    try {
      const { data } = await axios.post(`/api/admin/members/${id}/generate-card`);
      setMember(prev => ({ ...prev, cardUrl: data.cardUrl, cardGenerated: true }));
      setMsg('✅ Card generated!');
      window.open(data.cardUrl, '_blank');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Generation failed'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${member.firstName} ${member.lastName}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/admin/members/${id}`);
      navigate('/admin/members');
    } catch { setMsg('❌ Delete failed'); setDeleting(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    setMsg('');
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const { data } = await axios.post(`/api/admin/members/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMember(prev => ({ ...prev, photoUrl: data.photoUrl, cardGenerated: false }));
      setMsg('✅ Photo updated successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Photo upload failed'));
    } finally {
      setUploadingPhoto(false);
      e.target.value = null;
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
    </DashboardLayout>
  );

  if (!member) return (
    <DashboardLayout><div className="text-center py-20"><p className="text-gray-400">Member not found</p></div></DashboardLayout>
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        {/* Back */}
        <Link to="/admin/members" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-sm mb-6">
          <ArrowLeft size={16} /> Back to Members
        </Link>

        {/* Member card */}
        <div className="card mb-6">
          <div className="flex items-start gap-5">
            {member.photoUrl
              ? <img src={member.photoUrl} className="w-20 h-24 object-cover rounded-2xl border-4 border-primary/20" />
              : <div className="w-20 h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <User size={32} className="text-primary/40" />
                </div>}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black text-gray-900">{member.firstName} {member.middleName || ''} {member.lastName}</h1>
                  <p className="text-gray-500 text-sm">{member.email}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{member.phone}</p>
                </div>
                <span className={member.role === 'official' ? 'badge-official' : 'badge-member'}>
                  {member.position || member.role}
                </span>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span className="font-mono font-medium text-gray-700">{member.memberId}</span>
                <span>Session: {member.session}</span>
                <span className={member.status === 'active' ? 'text-green-600' : 'text-red-500'}>● {member.status}</span>
              </div>
              {(member.department || member.matricNo || member.level) && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  {member.matricNo && <span><strong className="text-gray-700">Matric:</strong> {member.matricNo}</span>}
                  {member.department && <span><strong className="text-gray-700">Dept:</strong> {member.department}</span>}
                  {member.level && <span><strong className="text-gray-700">Level:</strong> {member.level}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Management */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera size={18} className="text-primary" />
            <h2 className="font-bold text-gray-900">Photo Management</h2>
            <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Admin only</span>
          </div>
          <div className="flex items-center gap-4">
            {member.photoUrl
              ? <img src={member.photoUrl} className="w-16 h-20 object-cover rounded-xl border-2 border-primary/20" />
              : <div className="w-16 h-20 bg-gray-100 rounded-xl flex items-center justify-content-center border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <User size={24} className="text-gray-300" />
                </div>}
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-3">
                {member.photoUrl
                  ? 'Current photo is set. Upload a new one to replace it.'
                  : 'No photo uploaded yet. Upload a passport-style photo.'}
              </p>
              <div className="relative inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button disabled={uploadingPhoto}
                  className="btn-primary text-sm py-2 px-4 pointer-events-none">
                  {uploadingPhoto ? 'Processing...' : member.photoUrl ? '🔄 Replace Photo' : '📷 Upload Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Role upgrade */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-primary" />
            <h2 className="font-bold text-gray-900">Role & Position</h2>
          </div>
          <form onSubmit={handleRoleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select value={role} onChange={e => { setRole(e.target.value); if (e.target.value === 'member') setPosition(''); }}
                  className="input-field">
                  <option value="member">Member</option>
                  <option value="official">Official</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Position {role === 'official' && '*'}</label>
                <select value={position} onChange={e => setPosition(e.target.value)}
                  disabled={role !== 'official'} className="input-field disabled:opacity-50">
                  <option value="">— Select position —</option>
                  {positions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>
            {role === 'official' && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                ⚠️ Officials get a 1-year card expiry and the portrait-style official ID card.
              </p>
            )}
            <Button type="submit" loading={updating} className="w-full">
              Update Role
            </Button>
          </form>
        </div>

        {/* Card generation */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <IdCard size={18} className="text-primary" />
            <h2 className="font-bold text-gray-900">ID Card</h2>
            <div className="ml-auto">
              {member.cardGenerated
                ? <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">✅ Generated</span>
                : <span className="text-gray-400 text-xs">Not yet generated</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGenerate} loading={generating} className="flex-1">
              {member.cardGenerated ? <><RefreshCw size={15} /> Regenerate Card</> : <><IdCard size={15} /> Generate Card</>}
            </Button>
            {member.cardGenerated && member.cardUrl && (
              <a href={member.cardUrl} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <Download size={15} /> Download
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Feedback */}
        {msg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`text-sm text-center font-medium py-3 px-4 rounded-xl mb-4
              ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg}
          </motion.div>
        )}

        {/* Danger zone */}
        <div className="card border-red-100 bg-red-50/30">
          <h3 className="text-sm font-bold text-red-700 mb-3">Danger Zone</h3>
          <Button onClick={handleDelete} loading={deleting} variant="danger" className="text-sm py-2">
            <Trash2 size={14} /> Delete Member
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
