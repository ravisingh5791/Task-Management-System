import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const year = useMemo(() => new Date().getFullYear(), []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Backend server not reachable. Start backend and MongoDB.');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-visual card-glass">
        <p className="eyebrow">Task Management System</p>
        <h1>Ship work faster with a focused workflow.</h1>
        <p>
          Track priorities, move tasks across status, and keep your day organized in one clean dashboard.
        </p>
        <div className="visual-points">
          <span>Smart priorities</span>
          <span>Secure JWT auth</span>
          <span>Fast CRUD operations</span>
        </div>
      </section>

      <section className="auth-panel card-glass">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Welcome Back</p>
            <h2>Sign in</h2>
          </div>
          {error && <p className="error-text">{error}</p>}
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <p className="muted-text">
            New here? <Link to="/register">Create account</Link>
          </p>
          <small className="tiny-text">{year} TaskFlow Workspace</small>
        </form>
      </section>
    </main>
  );
}

export default Login;