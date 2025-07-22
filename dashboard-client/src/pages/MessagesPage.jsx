import React, { useEffect, useState } from 'react';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading messages...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Standup Messages</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map((msg, index) => (
          <li
            key={index}
            style={{
              background: '#2a2a2a',
              color: '#fff',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
              lineHeight: '1.5',
            }}
          >
            <strong>{msg.user}:</strong> <br />
            <span>{msg.text || 'No message text'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessagesPage;