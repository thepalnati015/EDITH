
import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  category: string;
  completed: boolean;
}

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onToggleComplete: (taskId: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (updatedTask: Task) => void;
}

function TaskDetailsModal({
  task,
  onClose,
  onToggleComplete,
  onDelete,
  onUpdate,
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [category, setCategory] = useState(task.category);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    onUpdate({
      ...task,
      title: title.trim(),
      description,
      priority,
      category,
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal task-details-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {isEditing ? 'EDIT TASK' : 'TASK DETAILS'}
            </p>
            <h2>{isEditing ? 'Update your task' : task.title}</h2>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="task-details-content">
          {isEditing ? (
            <>
              <div className="description-section">
                <label>Task Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="description-section">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="description-section">
                <label>Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="description-section">
                <label>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="detail-item">
                <span>Category</span>
                <strong>{task.category}</strong>
              </div>

              <div className="detail-item">
                <span>Priority</span>
                <strong className={`priority ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </strong>
              </div>

              <div className="detail-item">
                <span>Status</span>
                <strong>{task.completed ? 'Completed' : 'Pending'}</strong>
              </div>

              <div className="description-section">
                <h3>Description</h3>
                <p>{task.description || 'No description provided.'}</p>
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Close
          </button>

          {isEditing ? (
            <>
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel Edit
              </button>
              <button className="primary-button" onClick={handleSave}>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="delete-button" onClick={handleDelete}>
                Delete Task
              </button>

              <button
                className="cancel-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Task
              </button>

              <button
                className="primary-button"
                onClick={() => onToggleComplete(task.id)}
              >
                {task.completed ? 'Reopen Task' : 'Mark as Completed'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailsModal;
