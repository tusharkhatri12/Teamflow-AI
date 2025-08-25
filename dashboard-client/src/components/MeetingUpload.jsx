import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

const MeetingUpload = ({ onUploaded }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | transcribing | summarizing | done | error
  const [error, setError] = useState('');

  const handleUpload = async () => {
    try {
      setError('');
      if (!file) return setError('Please select a file');
      if (!title.trim()) return setError('Please enter a meeting title');

      setStatus('uploading');
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      // Show staged progress labels (UX only)
      setStatus('uploading');
      const res = await fetch(`${apiUrl}/api/meetings/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }

      setStatus('done');
      const data = await res.json();
      onUploaded && onUploaded(data.meeting);
      setFile(null);
      setTitle('');
    } catch (e) {
      setStatus('error');
      setError(e.message);
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

      {status === 'error' && (
        <div style={{ color: '#dc2626', fontSize: 14 }}>{error}</div>
      )}
      {status === 'done' && (
        <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle size={16} /> Uploaded and processed.
        </div>
      )}
    </div>
  );
};

export default MeetingUpload;
