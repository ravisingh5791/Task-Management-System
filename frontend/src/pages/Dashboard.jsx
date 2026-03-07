import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import api from '../services/api';

const initialFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  sortBy: 'created_at_desc',
  showArchived: false,
};

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, highPriority: 0, overdue: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false });
  const [filters, setFilters] = useState(initialFilters);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/tasks/stats');
      setStats(data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        isArchived: filters.showArchived,
      };

      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;

      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks || []);
      setPagination((prev) => ({ ...prev, ...(data.pagination || {}), page: data.pagination?.page || prev.page }));
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
    fetchStats();
  }, [filters]);

  const refreshAfterMutation = async () => {
    await Promise.all([fetchTasks(pagination.page), fetchStats()]);
  };

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
        setEditingTask(null);
      } else {
        await api.post('/tasks', payload);
      }

      await refreshAfterMutation();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length) {
        throw new Error(apiErrors.join(', '));
      }
      throw new Error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task permanently?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      await refreshAfterMutation();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleArchiveToggle = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/archive`);
      await refreshAfterMutation();
    } catch (err) {
      setError(err.response?.data?.message || 'Archive action failed');
    }
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    fetchTasks(nextPage);
  };

  return (
    <div className="dashboard-wrap">
      <header className="topbar card-glass">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Welcome, {user?.name || 'User'}</h1>
        </div>
        <button onClick={handleLogout} className="danger-btn">Logout</button>
      </header>

      <section className="stats-grid">
        <article className="stat-card card-glass"><p>Total Tasks</p><h3>{stats.total}</h3></article>
        <article className="stat-card card-glass"><p>Completed</p><h3>{stats.completed}</h3></article>
        <article className="stat-card card-glass"><p>In Progress</p><h3>{stats.inProgress}</h3></article>
        <article className="stat-card card-glass"><p>High Priority</p><h3>{stats.highPriority}</h3></article>
      </section>

      <TaskForm
        onSubmit={handleCreateOrUpdate}
        editingTask={editingTask}
        onCancelEdit={() => setEditingTask(null)}
      />

      <section className="card-glass task-board">
        <div className="section-head">
          <h2>Task Board</h2>
          <span>{pagination.total || 0} total</span>
        </div>

        <div className="toolbar toolbar-4">
          <input
            type="text"
            placeholder="Search title, description or tags"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}>
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select value={filters.sortBy} onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}>
            <option value="created_at_desc">Newest</option>
            <option value="created_at_asc">Oldest</option>
            <option value="dueDate_asc">Due Date (Soonest)</option>
            <option value="dueDate_desc">Due Date (Latest)</option>
          </select>
        </div>

        <div className="action-row board-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setFilters((prev) => ({ ...prev, showArchived: !prev.showArchived }))}
          >
            {filters.showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setFilters(initialFilters)}
          >
            Reset Filters
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="muted-text">Loading tasks...</p>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onArchiveToggle={handleArchiveToggle}
          />
        )}

        <div className="pagination-row">
          <button type="button" className="secondary-btn" onClick={() => changePage(pagination.page - 1)} disabled={!pagination.hasPrevPage}>
            Previous
          </button>
          <span>Page {pagination.page} of {Math.max(1, pagination.totalPages || 1)}</span>
          <button type="button" className="secondary-btn" onClick={() => changePage(pagination.page + 1)} disabled={!pagination.hasNextPage}>
            Next
          </button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;