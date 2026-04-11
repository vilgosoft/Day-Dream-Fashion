import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '@/services/authService';
import { setCredentials } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import './Auth.scss';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.warning('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.register(form);
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      dispatch(setCredentials({ user, token }));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          <div className="auth__header">
            <h1 className="auth__title">Create Account</h1>
            <p className="auth__subtitle">Join Day Dream Fashion today</p>
          </div>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="auth__input"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                autoFocus
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="auth__input"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="auth__input"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>

            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth__footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth__link">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
