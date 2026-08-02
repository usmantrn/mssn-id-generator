import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { motion } from 'framer-motion';
import { Shield, Trash2, Plus } from 'lucide-react';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPosition, setNewPosition] = useState('');
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchPositions = async () => {
    try {
      const { data } = await axios.get('/api/admin/positions');
      setPositions(data.positions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!newPosition.trim()) return;
    setAdding(true);
    setMsg('');
    try {
      const { data } = await axios.post('/api/admin/positions', { name: newPosition });
      setPositions([...positions, data.position]);
      setNewPosition('');
      setMsg('✅ Position added successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to add position'));
    } finally {
      setAdding(false);
    }
  };

  const handleDeletePosition = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the position "${name}"?`)) return;
    try {
      await axios.delete(`/api/admin/positions/${id}`);
      setPositions(positions.filter(p => p.id !== id));
      setMsg(`✅ Position "${name}" deleted.`);
    } catch (err) {
      setMsg('❌ Failed to delete position');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Manage Roles / Positions</h1>
            <p className="text-gray-500 text-sm mt-1">Add or remove titles available for officials.</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Shield size={24} />
          </div>
        </div>

        {msg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`text-sm font-medium py-3 px-4 rounded-xl mb-6 ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg}
          </motion.div>
        )}

        {/* Add New Position */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Add New Position</h2>
          <form onSubmit={handleAddPosition} className="flex gap-3">
            <div className="flex-1">
              <Input 
                placeholder="e.g. PRO I, Assistant Secretary"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                required
              />
            </div>
            <Button type="submit" loading={adding} className="w-auto self-start">
              <Plus size={18} /> Add
            </Button>
          </form>
        </div>

        {/* List of Positions */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Current Positions ({positions.length})</h2>
          
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : positions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No positions found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {positions.map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-medium text-gray-800">{pos.name}</span>
                  <button 
                    onClick={() => handleDeletePosition(pos.id, pos.name)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete position"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
