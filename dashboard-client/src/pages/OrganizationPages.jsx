import React, { useState, useEffect } from 'react';
import './OrganizationPages.css';

const OrganizationPage = () => {
  const [org, setOrg] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/org/my-org', {
      headers: { Authorization: localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => setOrg(data));
  }, []);

  const createOrg = async () => {
    const res = await fetch('/api/org/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token')
      },
      body: JSON.stringify({ name: newOrgName })
    });
    const data = await res.json();
    setMessage(data.message);
    setOrg(data.organization);
  };

  const joinOrg = async () => {
    const res = await fetch('/api/org/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token')
      },
      body: JSON.stringify({ joinCode })
    });
    const data = await res.json();
    setMessage(data.message);
    setOrg(data.organization);
  };

  const inviteUser = async () => {
    const res = await fetch('/api/org/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token')
      },
      body: JSON.stringify({ email: inviteEmail })
    });
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="org-container">
      <h2>Organization</h2>
      {org ? (
        <div className="org-details">
          <p><strong>Name:</strong> {org.name}</p>
          <p><strong>Join Code:</strong> {org.joinCode}</p>
          <input type="email" placeholder="Invite user by email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
          <button onClick={inviteUser}>Send Invite</button>
        </div>
      ) : (
        <div className="org-actions">
          <input type="text" placeholder="Create Organization Name" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} />
          <button onClick={createOrg}>Create Organization</button>

          <input type="text" placeholder="Enter Join Code" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
          <button onClick={joinOrg}>Join Organization</button>
        </div>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default OrganizationPage;
