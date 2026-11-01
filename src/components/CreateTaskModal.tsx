import { useState } from 'react';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (task: {
    title: string;
    description: string;
    priority: string;
    category: string;
  }) => void;
}

function CreateTaskModal({ onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Operations');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      description,
      priority,
      category,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Create a new task</h2>
            <p>Add a task to your business workflow.</p>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Task title *</label>
          <input
            type="text"
            placeholder="e.g. Respond to customer complaint"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <label>Description</label>
          <textarea
            placeholder="Add some details about this task..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>Operations</option>
            <option>Customer Support</option>
            <option>Sales</option>
            <option>Finance</option>
            <option>Reporting</option>
            <option>Other</option>
          </select>

          <label>Priority</label>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary-button">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;