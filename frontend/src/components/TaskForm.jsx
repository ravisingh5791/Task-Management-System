import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const initialState = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: '',
  tagsInput: '',
};

const mapTaskToForm = (task) => ({
  title: task.title || '',
  description: task.description || '',
  status: task.status || 'pending',
  priority: task.priority || 'medium',
  dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
  tagsInput: Array.isArray(task.tags) ? task.tags.join(', ') : '',
});

function TaskForm({ onSubmit, editingTask, onCancelEdit }) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setFormData(mapTaskToForm(editingTask));
    } else {
      setFormData(initialState);
    }
  }, [editingTask]);

  const titleLen = useMemo(() => formData.title.length, [formData.title]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description,
    status: formData.status,
    priority: formData.priority,
    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
    tags: formData.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  });

  const handleAiAssist = async () => {
    setError('');
    if (!formData.title.trim()) {
      setError('Add a title first to generate AI suggestions.');
      return;
    }

    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/task-assist', {
        title: formData.title,
        description: formData.description,
        goal: `Complete ${formData.title} efficiently`,
      });

      setFormData((prev) => ({
        ...prev,
        description: data.summary || prev.description,
        tagsInput: Array.isArray(data.tags) && data.tags.length ? data.tags.join(', ') : prev.tagsInput,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'AI assist failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(buildPayload());
      if (!editingTask) {
        setFormData(initialState);
      }
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card-glass">
      <div className="section-head task-form-head">
        <h2>{editingTask ? 'Update Task' : 'Create Task'}</h2>
        <span className="task-form-mode">{editingTask ? 'Editing mode' : 'New task'}</span>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form className="task-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            name="title"
            placeholder="Prepare project architecture"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={120}
          />
          <small className="tiny-text">{titleLen}/120</small>
        </label>

        <label>
          Description
          <textarea
            name="description"
            placeholder="Add details for this task"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </label>

        <div className="task-form-grid task-form-grid-3">
          <label>
            Status
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label>
            Priority
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            Due Date
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
          </label>
        </div>

        <label>
          Tags (comma separated)
          <input
            type="text"
            name="tagsInput"
            placeholder="frontend, urgent, client"
            value={formData.tagsInput}
            onChange={handleChange}
          />
        </label>

        <div className="action-row wrap-row">
          <button type="button" className="secondary-btn" onClick={handleAiAssist} disabled={aiLoading}>
            {aiLoading ? 'Generating...' : 'AI Assist'}
          </button>
          <button type="submit" disabled={saving} className="primary-btn">
            {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
          </button>
          {editingTask && (
            <button type="button" className="secondary-btn" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default TaskForm;