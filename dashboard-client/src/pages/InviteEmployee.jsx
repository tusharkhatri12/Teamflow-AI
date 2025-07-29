import React, { useState } from 'react';
import axios from 'axios';

const InviteEmployees = ({ orgId }) => {
  const [code, setCode] = useState('');

  const generateInvite = async () => {
    const res = await axios.post('/api/organizations/invite', { orgId });
    setCode(res.data.joinCode);
  };

  return (
    <div className="invite-section">
      <h3>Invite Employees</h3>
      <button onClick={generateInvite}>Generate Invite Code</button>
      {code && (
        <div className="invite-display">
          <p>Share this code:</p>
          <code>{code}</code>
        </div>
      )}
    </div>
  );
};

export default InviteEmployees;
