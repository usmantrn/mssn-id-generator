import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { motion } from 'framer-motion';
import { Search, Users, IdCard, ChevronRight, UserCheck, User, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLES = ['all', 'member', 'official'];

export default function Members() {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/members', {
        params: { search, role, page, limit: 15 }
      });
      setMembers(data.members);
      setTotal(data.total);
      setPages(data.pages);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, role, page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { setPage(1); }, [search, role]);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Members</h1>
            <p className="text-gray-500 text-sm">{total} total members</p>
          </div>
          <Link to="/admin/bulk-upload">
            <Button variant="outline" className="text-sm py-2">+ Bulk Upload</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or email…"
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2">
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
                  ${role === r ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Member</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Card</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {m.photoUrl
                            ? <img src={m.photoUrl} className="w-9 h-9 rounded-full object-cover" />
                            : <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-primary font-bold text-xs">{m.firstName[0]}{m.lastName[0]}</span>
                              </div>}
                          <div>
                            <p className="font-bold text-gray-900">{m.firstName} {m.middleName || ''} {m.lastName}</p>
                            <p className="text-gray-400 text-xs">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.memberId}</td>
                      <td className="px-4 py-3">
                        <span className={m.role === 'official' ? 'badge-official' : 'badge-member'}>
                          {m.position || m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${m.cardGenerated ? 'text-green-600' : 'text-gray-400'}`}>
                          {m.cardGenerated ? '✅ Ready' : '— Not Generated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/members/${m.id}`}
                          className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                          Manage <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                  ${page === p ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
