import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { IdCard, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', email: '', phone: '', matricNo: '', department: '', level: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.phone.length !== 11) return setError('Phone number must be 11 digits');

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await axios.post('/api/auth/register', data);
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { message: 'Registration successful! Please login.' } }), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="glass rounded-3xl shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-500">Your MSSN account has been created. Redirecting to login…</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="glass rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <IdCard size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join MSSN FUTB Chapter</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Input label="First Name" placeholder="Ahmad" value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Middle Name" placeholder="Mustapha" value={form.middleName}
                onChange={e => setForm({ ...form, middleName: e.target.value })} />
              <Input label="Last Name" placeholder="Sani" value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input label="Phone Number" type="tel" inputMode="numeric" placeholder="08012345678"
              maxLength={11} value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })} required />

            <Input label="Matric Number" placeholder="e.g. FUTB/CS/24/105" value={form.matricNo}
              onChange={e => setForm({ ...form, matricNo: e.target.value })} />
            <Input label="Department" placeholder="e.g. Computer Science" value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })} />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                className="input-field">
                <option value="">Select Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required className="input-field pr-12" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Input label="Confirm Password" type="password" placeholder="Repeat password"
              value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />

            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full py-3.5 text-base">
                Create Account
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-white/50 text-xs mt-4">UNITY · FAITH · KNOWLEDGE · SERVICE</p>
      </motion.div>
    </AuthLayout>
  );
}
