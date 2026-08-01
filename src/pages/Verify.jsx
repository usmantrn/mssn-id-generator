import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, User, IdCard, Calendar } from 'lucide-react';

export default function Verify() {
  const { memberId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/verify/${memberId}`)
      .then(r => setData(r.data.member))
      .catch(() => setError('Member not found or invalid ID'))
      .finally(() => setLoading(false));
  }, [memberId]);

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <IdCard size={22} className="text-white" />
            <span className="text-white font-bold">MSSN FUTB Chapter</span>
          </div>
          <p className="text-white/60 text-xs">Member Verification Portal</p>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Verifying member…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <XCircle size={48} className="text-red-400 mx-auto mb-3" />
              <h2 className="font-bold text-gray-900 mb-1">Not Found</h2>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}

          {data && (
            <div>
              {/* Status badge */}
              <div className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 mb-5 text-sm font-semibold
                ${data.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {data.status === 'active'
                  ? <><CheckCircle size={16} /> Valid MSSN Member</>
                  : <><XCircle size={16} /> Account Suspended</>}
              </div>

              {/* Photo */}
              {data.photoUrl ? (
                <img src={data.photoUrl} alt="Member Photo"
                  className="w-24 h-28 object-cover rounded-2xl mx-auto mb-4 border-4 border-primary/20 shadow" />
              ) : (
                <div className="w-24 h-28 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <User size={36} className="text-gray-300" />
                </div>
              )}

              {/* Info */}
              <h2 className="text-xl font-black text-gray-900 text-center mb-1">
                {data.firstName} {data.lastName}
              </h2>
              <p className="text-center text-primary font-semibold text-sm mb-5 capitalize">{data.position || data.role}</p>

              <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
                <InfoRow label="Member ID" value={data.memberId} />
                <InfoRow label="Role" value={data.role} capitalize />
                <InfoRow label="Session" value={data.session} />
                {data.expiryDate && <InfoRow label="Card Expiry" value={new Date(data.expiryDate).toLocaleDateString('en-GB')} />}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 text-center">
          <p className="text-xs text-gray-400">UNITY · FAITH · KNOWLEDGE · SERVICE</p>
          <Link to="/" className="text-xs text-primary hover:underline mt-1 block">← Back to MSSN Portal</Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, capitalize }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value || '—'}</span>
    </div>
  );
}
