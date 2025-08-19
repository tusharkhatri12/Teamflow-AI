// src/components/TaskCard.jsx
import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task }) => {
  if (!task) return null;
  return (
    <div className="task-card">
      <div className="task-row">
        <strong className="task-title">{task.title}</strong>
        {/* you can add due date badge or assignee avatar here */}
      </div>
      {task.description && <div className="task-desc">{task.description}</div>}
    </div>
  );
};

export default TaskCard;
