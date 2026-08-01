import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a CSV file');
    setUploading(true);
    setError('');
    setResult(null);

    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await axios.post('/api/admin/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const csvTemplate = `firstName,lastName,email,phone,password\nAhmad,Musa,ahmad@example.com,08012345678,MSSN@2025\nFatima,Yusuf,fatima@example.com,08098765432,MSSN@2025`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mssn-members-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
        <Link to="/admin/members" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-sm mb-6">
          <ArrowLeft size={16} /> Back to Members
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-1">Bulk Upload</h1>
        <p className="text-gray-500 mb-8">Import multiple members at once from a CSV file.</p>

        {/* Template download */}
        <div className="card mb-6 bg-primary/5 border-primary/10">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm mb-1">CSV Format Required</p>
              <p className="text-gray-500 text-xs mb-3">
                Your CSV must have these columns: <code className="bg-white px-1 rounded font-mono">firstName, lastName, email, phone, password</code>
              </p>
              <p className="text-xs text-gray-400 mb-3">
                If <code className="font-mono">password</code> is empty, default password <code className="font-mono">MSSN@2025</code> will be used.<br/>
                Duplicate emails/phones will be skipped automatically.
              </p>
              <button onClick={downloadTemplate}
                className="inline-flex items-center gap-2 text-primary text-xs font-semibold hover:underline">
                <Download size={14} /> Download CSV Template
              </button>
            </div>
          </div>
        </div>

        {/* Upload form */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Upload File</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Drop zone */}
            <label className={`block cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all
              ${file ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}>
              <Upload size={32} className={`mx-auto mb-3 ${file ? 'text-primary' : 'text-gray-300'}`} />
              {file ? (
                <>
                  <p className="font-semibold text-primary text-sm">{file.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-600 text-sm mb-1">Click to select CSV file</p>
                  <p className="text-gray-400 text-xs">or drag and drop here</p>
                </>
              )}
              <input type="file" accept=".csv" className="hidden" onChange={e => { setFile(e.target.files[0]); setResult(null); setError(''); }} />
            </label>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <Button type="submit" loading={uploading} disabled={!file} className="w-full">
              <Upload size={16} /> Upload & Import Members
            </Button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card">
            <h3 className="font-bold text-gray-900 mb-4">Import Results</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-green-700">{result.created}</p>
                <p className="text-xs text-green-600">Created</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <XCircle size={20} className="text-amber-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-amber-700">{result.skipped}</p>
                <p className="text-xs text-amber-600">Skipped</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <XCircle size={20} className="text-red-400 mx-auto mb-1" />
                <p className="text-2xl font-black text-red-700">{result.errors}</p>
                <p className="text-xs text-red-600">Errors</p>
              </div>
            </div>
            {result.errorDetails?.length > 0 && (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-700 mb-2">Sample errors:</p>
                {result.errorDetails.map((e, i) => (
                  <p key={i} className="text-xs text-red-600">{e.error}</p>
                ))}
              </div>
            )}
            <Link to="/admin/members" className="mt-4 block">
              <Button className="w-full">View All Members</Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
