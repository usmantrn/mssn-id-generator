import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Save, User } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    matricNo: user?.matricNo || '',
    department: user?.department || '',
    level: user?.level || ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || null);
  const fileRef = useRef();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await axios.put('/api/members/me', form);
      await refreshUser();
      setMsg('✅ Profile updated successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setMsg('❌ Photo must be less than 5MB');

    // Preview
    const reader = new FileReader();
    reader.onload = (r) => setPhotoPreview(r.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setMsg('');
    const fd = new FormData();
    fd.append('photo', file);
    try {
      await axios.post('/api/members/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
      setMsg('✅ Photo uploaded! Regenerate your card to reflect the new photo.');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Profile Settings</h1>
          <p className="text-gray-500 mb-8">Update your information and passport photo.</p>

          {/* Photo upload */}
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Passport Photo</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {photoPreview || uploading ? (
                  <div className="w-24 h-28 rounded-2xl overflow-hidden bg-gray-100 border-4 border-primary/20">
                    {uploading
                      ? <div className="w-full h-full flex items-center justify-center">
                          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      : <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />}
                  </div>
                ) : (
                  <div className="w-24 h-28 rounded-2xl bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-200">
                    <User size={32} className="text-gray-300" />
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-light transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm mb-1">Upload Passport Photo</p>
                <p className="text-gray-400 text-xs mb-3">JPG or PNG, max 5MB<br/>Use a clear, front-facing photo</p>
                <button onClick={() => fileRef.current?.click()}
                  className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  <Camera size={14} /> Choose Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>
          </div>

          {/* Info form */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Input label="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                <Input label="Middle Name" value={form.middleName} onChange={e => setForm({ ...form, middleName: e.target.value })} />
                <Input label="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Matric No (Optional)" value={form.matricNo} onChange={e => setForm({ ...form, matricNo: e.target.value })} />
                <Input label="Department (Optional)" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone Number" type="tel" inputMode="numeric" maxLength={11}
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Level (Optional)</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="input-field">
                    <option value="">— Select Level —</option>
                    {['100', '200', '300', '400', '500', '600', 'Spillover', 'Postgraduate'].map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Read-only info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-800">{user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Member ID</span>
                  <span className="font-mono font-medium text-gray-800">{user?.memberId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-gray-800 capitalize">{user?.role}</span>
                </div>
              </div>

              <Button type="submit" loading={saving} className="w-full">
                <Save size={16} /> Save Changes
              </Button>
            </form>

            {msg && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`mt-4 text-sm text-center font-medium ${msg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {msg}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
