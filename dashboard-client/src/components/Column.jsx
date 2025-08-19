// src/components/Column.jsx
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import './Column.css';

const Column = ({ column, tasks = [], onAddTask, placeholder }) => {
  const [newTitle, setNewTitle] = useState('');

  return (
    <div className="column">
      <div className="column-header">
        <h3>{column.title}</h3>
        <span className="badge">{tasks.length}</span>
      </div>

      <div className="tasks-list">
        {tasks.map((task, index) => (
          <Draggable key={task._id} draggableId={task._id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{ marginBottom: 8, ...provided.draggableProps.style }}
              >
                <TaskCard task={task} />
              </div>
            )}
          </Draggable>
        ))}
      </div>

      <div className="add-task">
        <input
          type="text"
          placeholder="New task title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={() => { onAddTask(newTitle); setNewTitle(''); }}>Add</button>
      </div>
      {placeholder}
    </div>
  );
};

export default Column;
