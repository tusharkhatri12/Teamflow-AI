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
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [creatingSprint, setCreatingSprint] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: '', startDate: '', endDate: '', active: false });
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
        const params = new URLSearchParams();
        if (selectedAssignee) params.append('assigneeId', selectedAssignee);
        if (selectedSprint) params.append('sprintId', selectedSprint);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/api/boards/${orgId}${params.toString() ? `?${params.toString()}` : ''}`, {
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
  }, [orgId, apiBase, selectedAssignee, selectedSprint]);

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
        const m = (res.data?.members || []).map(u => ({ id: u._id || u.id, name: u.name || u.email || 'Unnamed' }));
        setMembers(m);
      } catch (e) {
        // ignore silently
      }
    };
    // Only admins need the list; but harmless to fetch for employees too
    loadMembers();
  }, [apiBase, orgId]);

  // Load sprints
  useEffect(() => {
    const loadSprints = async () => {
      try {
        if (!board?._id) return;
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiBase}/api/boards/${board._id}/sprints`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setSprints(res.data || []);
      } catch {}
    };
    loadSprints();
  }, [apiBase, board?._id]);

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

  const addTask = async (columnId, title, assigneeOverride, options = {}) => {
    if (!title) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${apiBase}/api/boards/${board._id}/task`, {
        columnId,
        title,
        assigneeId: assigneeOverride || selectedAssignee || user?.id,
        sprintId: options.sprintId || selectedSprint || undefined,
        labels: options.labels || [],
        priority: options.priority || 'medium'
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setBoard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createSprint = async () => {
    if (!newSprint.name) return;
    try {
      setCreatingSprint(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${apiBase}/api/boards/${board._id}/sprints`, newSprint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSprints(prev => [...prev, res.data]);
      setNewSprint({ name: '', startDate: '', endDate: '', active: false });
    } catch (e) {
      // noop
    } finally {
      setCreatingSprint(false);
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
            <label style={{ margin: '0 8px 0 16px', color: '#bfc9d4' }}>Sprint:</label>
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              style={{
                background: '#0f0f0f',
                color: '#fff',
                border: '1px solid #2b2b2b',
                borderRadius: 8,
                padding: '8px 10px',
                minWidth: 180
              }}
            >
              <option value="">All sprints</option>
              {sprints.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={() => setCreatingSprint(v => !v)}
              style={{ marginLeft: 12, padding: '8px 10px', borderRadius: 8, border: '1px solid #2b2b2b', background: '#0f0f0f', color: '#bfc9d4' }}
            >
              {creatingSprint ? 'Close' : 'New Sprint'}
            </button>
            {creatingSprint && (
              <div style={{ display: 'inline-flex', gap: 8, marginLeft: 12, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Sprint name"
                  value={newSprint.name}
                  onChange={e => setNewSprint(s => ({ ...s, name: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #2b2b2b', background: '#0f0f0f', color: '#fff' }}
                />
                <input
                  type="date"
                  value={newSprint.startDate}
                  onChange={e => setNewSprint(s => ({ ...s, startDate: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #2b2b2b', background: '#0f0f0f', color: '#fff' }}
                />
                <input
                  type="date"
                  value={newSprint.endDate}
                  onChange={e => setNewSprint(s => ({ ...s, endDate: e.target.value }))}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #2b2b2b', background: '#0f0f0f', color: '#fff' }}
                />
                <label style={{ color: '#bfc9d4', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={!!newSprint.active}
                    onChange={e => setNewSprint(s => ({ ...s, active: e.target.checked }))}
                  /> Active
                </label>
                <button onClick={createSprint} style={{ padding: '8px 10px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none' }}>Create</button>
              </div>
            )}
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
                    members={members}
                    sprints={sprints}
                    canAssign={isAdmin}
                    onAddTask={(title, assigneeId, options) => addTask(col.id, title, assigneeId, options)}
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
