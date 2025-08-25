import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const MeetingUpload = ({ onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0); // 0-100

  const handleUpload = async () => {
    try {
      setError('');
      setProgress(0);
      if (!file) return setError('Please select a file');
      if (!title.trim()) return setError('Please enter a meeting title');

      setStatus('uploading');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      const res = await axios.post(`${apiUrl}/api/meetings/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setProgress(pct);
          }
        }
      });

      setStatus('done');
      onUploaded && onUploaded(res.data.meeting);
      setFile(null);
      setTitle('');
      setTimeout(() => setProgress(0), 800);
    } catch (e) {
      setStatus('error');
      setError(e.response?.data?.error || e.message || 'Upload failed');
    }
  };

  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Meeting title (e.g., Weekly Sprint Review)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ flex: 1 }}
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleUpload}
          disabled={status === 'uploading'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#8b5cf6', color: 'white', border: 'none',
            padding: '10px 16px', borderRadius: 10, cursor: 'pointer'
          }}
        >
          {status === 'uploading' ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
          {status === 'uploading' ? 'Uploading…' : 'Upload Meeting'}
        </motion.button>
      </div>

      {status === 'uploading' && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#8b5cf6', transition: 'width 0.15s ease' }} />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</div>
      )}
      {status === 'done' && (
        <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <CheckCircle size={16} /> Uploaded and processed.
        </div>
      )}
    </div>
  );
};

export default MeetingUpload;
