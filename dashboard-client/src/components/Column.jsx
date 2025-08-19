// src/components/Column.jsx
import React, { useMemo, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import './Column.css';

const Column = ({ column, tasks = [], onAddTask, placeholder, members = [], sprints = [], canAssign = false }) => {
  const [newTitle, setNewTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [labels, setLabels] = useState('');
  const [sprintId, setSprintId] = useState('');
  const membersOptions = useMemo(() => members || [], [members]);

  return (
    <div className="column">
      <div className="column-header">
        <h3>{column.title}</h3>
        <span className="badge">{tasks.length}</span>
      </div>

      <div className="add-task" style={{ flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="New task title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        {canAssign && (
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2b2b2b', borderRadius: 6 }}
          >
            <option value="">Unassigned</option>
            {membersOptions.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        )}
        <select
          value={sprintId}
          onChange={(e) => setSprintId(e.target.value)}
          style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2b2b2b', borderRadius: 6 }}
        >
          <option value="">No sprint</option>
          {sprints.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ background: '#0f0f0f', color: '#fff', border: '1px solid #2b2b2b', borderRadius: 6 }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="text"
          placeholder="labels (comma separated)"
          value={labels}
          onChange={e => setLabels(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={() => {
          const parsedLabels = labels.split(',').map(s => s.trim()).filter(Boolean);
          onAddTask(newTitle, assigneeId || undefined, { sprintId: sprintId || undefined, labels: parsedLabels, priority });
          setNewTitle(''); setAssigneeId(''); setLabels(''); setPriority('medium'); setSprintId('');
        }}>Add</button>
      </div>

      <div className="tasks-header">
        <span className="cell title">Title</span>
        <span className="cell assignee">Assignee</span>
        <span className="cell created-by">Assigned By</span>
        <span className="cell sprint">Sprint</span>
        <span className="cell labels">Labels</span>
        <span className="cell priority">Priority</span>
      </div>

      <div className="tasks-list">
        {tasks.map((task, index) => (
          <Draggable key={task._id} draggableId={task._id} index={index}>
            {(provided) => {
              const assigneeName = membersOptions.find(m => String(m.id) === String(task.assigneeId))?.name || '';
              const createdByName = membersOptions.find(m => String(m.id) === String(task.createdBy))?.name || '';
              const sprintName = (sprints || []).find(s => String(s._id) === String(task.sprintId))?.name || '';
              return (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="task-row"
                  style={provided.draggableProps.style}
                >
                  <span className="cell title">{task.title}</span>
                  <span className="cell assignee">{assigneeName}</span>
                  <span className="cell created-by">{createdByName}</span>
                  <span className="cell sprint">{sprintName}</span>
                  <span className="cell labels">{(task.labels || []).join(', ')}</span>
                  <span className={`cell priority ${task.priority}`}>{task.priority}</span>
                </div>
              );
            }}
          </Draggable>
        ))}
      </div>

      {placeholder}
    </div>
  );
};

export default Column;
