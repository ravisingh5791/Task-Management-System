import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Backend server not reachable. Start backend and MongoDB.');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-visual card-glass">
        <p className="eyebrow">Create Your Workspace</p>
        <h1>Build better momentum with clear task ownership.</h1>
        <p>
          From planning to completion, keep every task visible with priority and status tracking.
        </p>
        <div className="visual-points">
          <span>Clean dashboard</span>
          <span>Priority driven execution</span>
          <span>Simple and scalable structure</span>
        </div>
      </section>

      <section className="auth-panel card-glass">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Get Started</p>
            <h2>Create account</h2>
          </div>
          {error && <p className="error-text">{error}</p>}
          <label>
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Ravi Singh"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
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
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </label>
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Creating account...' : 'Register'}
          </button>
          <p className="muted-text">
            Already registered? <Link to="/login">Login</Link>
          </p>
          <small className="tiny-text">{year} TaskFlow Workspace</small>
        </form>
      </section>
    </main>
  );
}

export default Register;