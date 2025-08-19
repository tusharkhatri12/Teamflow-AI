// src/components/TaskCard.jsx
import React, { useMemo } from 'react';
import './TaskCard.css';

const TaskCard = ({ task, members = [] }) => {
  if (!task) return null;
  const assigneeName = useMemo(() => {
    if (!task.assigneeId) return '';
    const m = members.find(x => String(x.id) === String(task.assigneeId));
    return m?.name || '';
  }, [members, task.assigneeId]);
  return (
    <div className="task-card">
      <div className="task-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong className="task-title" style={{ flex: 1 }}>{task.title}</strong>
        <span className="priority" style={{ color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#eab308' : '#22c55e' }}>
          {task.priority}
        </span>
        {assigneeName && <span className="assignee-badge">{assigneeName}</span>}
      </div>
      {task.labels?.length > 0 && (
        <div className="labels">
          {task.labels.map((l, idx) => (
            <span className="label-chip" key={idx}>{l}</span>
          ))}
        </div>
      )}
      {task.description && <div className="task-desc">{task.description}</div>}
    </div>
  );
};

export default TaskCard;
