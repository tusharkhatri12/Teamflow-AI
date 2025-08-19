// src/pages/BoardPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
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
  const [newTitle, setNewTitle] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newSprintId, setNewSprintId] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newLabels, setNewLabels] = useState('');
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

  const moveTaskToColumn = async (taskId, targetColumnId) => {
    if (!board) return;
    const currentColumn = board.columns.find(c => c.taskIds.includes(taskId));
    if (!currentColumn || currentColumn.id === targetColumnId) return;
    const source = { droppableId: currentColumn.id, index: currentColumn.taskIds.indexOf(taskId) };
    const destination = { droppableId: targetColumnId, index: 0 };
    // optimistic update
    const newBoard = JSON.parse(JSON.stringify(board));
    const src = newBoard.columns.find(c => c.id === source.droppableId);
    const dst = newBoard.columns.find(c => c.id === destination.droppableId);
    if (src && dst) {
      const idx = src.taskIds.indexOf(taskId);
      if (idx > -1) src.taskIds.splice(idx, 1);
      dst.taskIds.splice(0, 0, taskId);
      setBoard(newBoard);
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiBase}/api/boards/${board._id}/move`, { source, destination, draggableId: taskId }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      // ignore
    }
  };

  const addTask = async () => {
    if (!newTitle) return;
    const defaultCol = board?.columns?.find(c => c.title?.toLowerCase() === 'to do') || board?.columns?.[0];
    if (!defaultCol) return;
    try {
      const token = localStorage.getItem('token');
      const parsedLabels = newLabels.split(',').map(s => s.trim()).filter(Boolean);
      const res = await axios.post(`${apiBase}/api/boards/${board._id}/task`, {
        columnId: defaultCol.id,
        title: newTitle,
        assigneeId: newAssigneeId || selectedAssignee || user?.id,
        sprintId: newSprintId || selectedSprint || undefined,
        labels: parsedLabels,
        priority: newPriority
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setBoard(res.data);
      setNewTitle(''); setNewAssigneeId(''); setNewSprintId(''); setNewPriority('medium'); setNewLabels('');
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
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, margin:'10px 0 6px 0' }}>
        <button style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #2b2b2b', background:'#0f0f0f', color:'#bfc9d4' }}>Filter</button>
        <button style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #2b2b2b', background:'#0f0f0f', color:'#bfc9d4' }}>Group by</button>
        <button style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #2b2b2b', background:'#0f0f0f', color:'#bfc9d4' }}>Hide Columns</button>
      </div>

      {/* Table Header */}
      <div className="tasks-header" style={{ marginTop: 0 }}>
        <span className="cell title">Title</span>
        <span className="cell assignee">Assignee</span>
        <span className="cell created-by">Assigned By</span>
        <span className="cell sprint">Sprint</span>
        <span className="cell labels">Labels</span>
        <span className="cell priority">Priority</span>
        <span className="cell status">Status</span>
      </div>
      <div className="task-row">
        <span className="cell title">
          <input
            type="text"
            placeholder="New task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #2b2b2b', background: '#0f0f0f', color: '#fff' }}
          />
        </span>
        <span className="cell assignee">
          <select value={newAssigneeId} onChange={e => setNewAssigneeId(e.target.value)} style={{ width: '100%', background: '#0f0f0f', color: '#fff', border: '1px solid #2b2b2b', borderRadius: 6 }}>
            <option value="">Unassigned</option>
            {members.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
          </select>
        </span>
        <span className="cell created-by" />
        <span className="cell sprint">
          <select value={newSprintId} onChange={e => setNewSprintId(e.target.value)} style={{ width: '100%', background: '#0f0f0f', color: '#fff', border: '1px solid #2b2b2b', borderRadius: 6 }}>
            <option value="">No sprint</option>
            {sprints.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
          </select>
        </span>
        <span className="cell labels">
          <input type="text" placeholder="labels (comma separated)" value={newLabels} onChange={e => setNewLabels(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #2b2b2b', background: '#0f0f0f', color: '#fff' }} />
        </span>
        <span className="cell priority">
          <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ width: '100%', background: '#0f0f0f', color: '#fff', border: '1px solid #2b2b2b', borderRadius: 6 }}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </span>
        <span className="cell status">
          <button onClick={addTask} style={{ padding: '8px 10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, width: '100%' }}>Add</button>
        </span>
      </div>

      {/* Tasks Table Rows */}
      {board.columns.length > 0 && (
        board.columns.reduce((rows, col) => {
          col.taskIds.forEach(id => rows.push(id));
          return rows;
        }, []).map(taskId => {
          const task = board.tasks.find(t => t._id === taskId);
          if (!task) return null;
          const assigneeName = members.find(m => String(m.id) === String(task.assigneeId))?.name || '';
          const createdByName = members.find(m => String(m.id) === String(task.createdBy))?.name || '';
          const sprintName = sprints.find(s => String(s._id) === String(task.sprintId))?.name || '';
          const currentColumn = board.columns.find(c => c.taskIds.includes(task._id));
          return (
            <div className="task-row" key={task._id}>
              <span className="cell title">{task.title}</span>
              <span className="cell assignee">{assigneeName}</span>
              <span className="cell created-by">{createdByName}</span>
              <span className="cell sprint">{sprintName}</span>
              <span className="cell labels">{(task.labels || []).join(', ')}</span>
              <span className={`cell priority ${task.priority}`}>{task.priority}</span>
              <span className="cell status">
                {/* status pill with inline select on click */}
                <div style={{ position:'relative' }}>
                  <span className={`status-pill ${
                    currentColumn?.title === 'New' ? 'status-new' :
                    currentColumn?.title === 'In Progress' ? 'status-inprogress' :
                    currentColumn?.title === 'Moved to QA' ? 'status-qa' :
                    currentColumn?.title === 'Done' ? 'status-done' :
                    'status-reported'
                  }`}>
                    {currentColumn?.title || 'New'}
                  </span>
                  <select aria-label="Change status" value={currentColumn?.id || ''} onChange={e => moveTaskToColumn(task._id, e.target.value)} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }}>
                    {['New', 'In Progress', 'Moved to QA', 'Done', 'Reported'].map(statusTitle => {
                      const col = board.columns.find(c => c.title === statusTitle) || board.columns[0];
                      return (
                        <option key={statusTitle} value={col.id}>{statusTitle}</option>
                      );
                    })}
                  </select>
                </div>
              </span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default BoardPage;
