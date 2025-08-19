// src/pages/BoardPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Column from '../components/Column';
import './BoardPage.css';

const BoardPage = ({ user }) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
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
        const res = await axios.get(`${apiBase}/api/boards/${orgId}`);
        setBoard(res.data);
      } catch (err) {
        // do not auto-create; show explicit button
        setBoard(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [orgId, apiBase]);

  const createDefaultBoard = async () => {
    if (!orgId) return;
    setCreating(true);
    setError('');
    try {
      const res = await axios.post(`${apiBase}/api/boards`, { orgId });
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
      await axios.post(`${apiBase}/api/boards/${board._id}/move`, {
        source,
        destination,
        draggableId
      });
      // ideally refresh with latest board from server
    } catch (err) {
      console.error('Move failed', err);
    }
  };

  const addTask = async (columnId, title) => {
    if (!title) return;
    try {
      const res = await axios.post(`${apiBase}/api/boards/${board._id}/task`, {
        columnId,
        title
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

  return (
    <div className="board-root">
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
