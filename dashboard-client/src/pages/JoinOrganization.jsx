import React, { useState } from 'react';
import axios from 'axios';

const JoinOrganization = ({ userId }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleJoin = async () => {
    try {
      const res = await axios.post('/api/organizations/join', {
        joinCode: code,
        userId,
      });
      setMessage('✅ Joined: ' + res.data.organization.name);
    } catch (err) {
      setMessage('❌ ' + err.response.data.message);
    }
  };

  return (
    <div className="join-org-container">
      <h2>Join Organization</h2>
      <input
        type="text"
        placeholder="Enter join code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={handleJoin}>Join</button>
      <p>{message}</p>
    </div>
  );
};

export default JoinOrganization;
