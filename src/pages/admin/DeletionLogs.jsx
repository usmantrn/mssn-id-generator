import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, User, AlertTriangle } from 'lucide-react';

function formatDateTime(dt) {
  if (!dt) return 'N/A';
  const d = new Date(dt);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

export default function DeletionLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/admin/deletion-logs?page=${page}&limit=${limit}`)
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const pages = Math.ceil(total / limit);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-sm mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Deletion Logs</h1>
            <p className="text-sm text-gray-500">{total} member{total !== 1 ? 's' : ''} deleted in total</p>
          </div>
        </div>

        {/* Warning notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            This is a permanent audit trail. All member deletions are recorded here for security purposes and cannot be removed.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-16">
            <Trash2 size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No deletion logs yet</p>
            <p className="text-gray-300 text-sm mt-1">Deleted members will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="card border-l-4 border-l-red-400"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={22} className="text-red-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-900">
                          {log.firstName} {log.middleName || ''} {log.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{log.email} · {log.phone}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0
                        ${log.role === 'official' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {log.position || log.role}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="font-mono font-semibold text-gray-700">{log.memberId}</span>
                      {log.department && <span>📚 {log.department}</span>}
                      {log.level && <span>🎓 Level {log.level}</span>}
                      {log.session && <span>📅 {log.session}</span>}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-red-600 font-semibold flex items-center gap-1">
                        <Trash2 size={11} /> Deleted {formatDateTime(log.deletedAt)}
                      </span>
                      <span className="text-gray-500">
                        Deleted by: <span className="font-semibold text-gray-700">{log.deletedByName}</span>
                        <span className="font-mono text-gray-400 ml-1">({log.deletedById})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
