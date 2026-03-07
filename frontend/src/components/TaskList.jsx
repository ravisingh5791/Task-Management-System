function TaskList({ tasks, onEdit, onDelete, onArchiveToggle }) {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        <h3>No tasks found</h3>
        <p>Try changing filters or add a new task.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article key={task._id} className="task-item">
          <div className="task-top">
            <div>
              <h3>{task.title}</h3>
              <small className="tiny-text">Created {new Date(task.created_at).toLocaleString()}</small>
            </div>
            <div className="badge-row">
              <span className={`badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
              <span className={`badge priority-${task.priority}`}>{task.priority}</span>
              {task.isArchived && <span className="badge archived-badge">archived</span>}
            </div>
          </div>

          {task.description ? (
            <p className="task-desc">{task.description}</p>
          ) : (
            <p className="task-desc muted-text">No description</p>
          )}

          <div className="task-meta-row">
            <span><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
            <span><strong>Tags:</strong> {Array.isArray(task.tags) && task.tags.length ? task.tags.join(', ') : 'None'}</span>
          </div>

          <div className="action-row wrap-row">
            <button className="secondary-btn" onClick={() => onEdit(task)}>
              Edit
            </button>
            <button className="secondary-btn" onClick={() => onArchiveToggle(task._id)}>
              {task.isArchived ? 'Restore' : 'Archive'}
            </button>
            <button className="danger-btn" onClick={() => onDelete(task._id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default TaskList;