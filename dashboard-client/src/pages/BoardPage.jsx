// src/pages/BoardPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Column from '../components/Column';
import './BoardPage.css';

const BoardPage = ({ user }) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const apiBase = process.env.REACT_APP_API_URL || ''; // ensure proxy or full base

  const orgId = useMemo(() => (
    user?.organizationId || user?.organization?._id || (typeof user?.organization === 'string' ? user.organization : undefined)
  ), [user]);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    const fetchBoard = async () => {
      try {
        const query = selectedAssignee ? `?assigneeId=${selectedAssignee}` : '';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/api/boards/${orgId}${query}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setBoard(res.data);
      } catch (err) {
        // do not auto-create; show explicit button
        setBoard(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [orgId, apiBase, selectedAssignee]);

  // Load members for admin dropdown
  useEffect(() => {
    const loadMembers = async () => {
      try {
        if (!orgId) return;
        // Requires auth token; assuming stored in localStorage
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/org/members`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const m = (res.data?.members || []).map(u => ({ id: u._id, name: u.name || u.email }));
        setMembers(m);
      } catch (e) {
        // ignore silently
      }
    };
    // Only admins need the list; but harmless to fetch for employees too
    loadMembers();
  }, [apiBase, orgId]);

  const createDefaultBoard = async () => {
    if (!orgId) return;
    setCreating(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${apiBase}/api/boards`, { orgId }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setBoard(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    // If dragging columns (future feature) handle type === 'column'
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // update UI optimistically
    const newBoard = JSON.parse(JSON.stringify(board));
    const sourceCol = newBoard.columns.find(c => c.id === source.droppableId);
    const destCol = newBoard.columns.find(c => c.id === destination.droppableId);

    // remove from source
    sourceCol.taskIds.splice(source.index, 1);
    // insert into dest
    destCol.taskIds.splice(destination.index, 0, draggableId);

    setBoard(newBoard);

    // send to backend
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiBase}/api/boards/${board._id}/move`, {
        source,
        destination,
        draggableId
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      // ideally refresh with latest board from server
    } catch (err) {
      console.error('Move failed', err);
    }
  };

  const addTask = async (columnId, title) => {
    if (!title) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${apiBase}/api/boards/${board._id}/task`, {
        columnId,
        title,
        assigneeId: selectedAssignee || user?.id
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setBoard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="board-loading">Loading board…</div>;
  if (!orgId) {
    return (
      <div className="board-empty" style={{ padding: 24 }}>
        Join or create an organization to use the board.
      </div>
    );
  }
  if (!board) {
    return (
      <div className="board-empty" style={{ padding: 24 }}>
        <div style={{ marginBottom: 12 }}>No board found for this organization.</div>
        {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
        <button
          onClick={createDefaultBoard}
          disabled={creating}
          style={{
            padding: '10px 14px',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: creating ? 'not-allowed' : 'pointer'
          }}
        >
          {creating ? 'Creating…' : 'Create Board'}
        </button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="board-root">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Board</h2>
        {isAdmin ? (
          <div style={{ marginLeft: 'auto' }}>
            <label style={{ marginRight: 8, color: '#bfc9d4' }}>View tasks for:</label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              style={{
                background: '#0f0f0f',
                color: '#fff',
                border: '1px solid #2b2b2b',
                borderRadius: 8,
                padding: '8px 10px',
                minWidth: 200
              }}
            >
              <option value="">All members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ marginLeft: 'auto', color: '#9aa3af' }}>Viewing your tasks</div>
        )}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-columns">
          {board.columns.map(col => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="column-wrapper">
                  <Column
                    column={col}
                    tasks={col.taskIds.map(id => board.tasks.find(t => t._id === id)).filter(Boolean)}
                    onAddTask={(title) => addTask(col.id, title)}
                    placeholder={provided.placeholder}
                  />
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default BoardPage;
