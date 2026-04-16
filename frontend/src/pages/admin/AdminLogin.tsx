import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminService } from '@/services/adminService';
import { setAdminCredentials } from '@/store/slices/adminSlice';
import { toast } from 'react-toastify';
import './Admin.scss';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.warning('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.login(email, password);
      const token = res.data.data.access_token;
      localStorage.setItem('adminToken', token);
      dispatch(setAdminCredentials({ token }));
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <h1 className="admin-login__brand">DDF</h1>
          <h2 className="admin-login__title">Admin Panel</h2>
          <p className="admin-login__subtitle">Sign in to manage your store</p>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-login__field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@daydreamfashion.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="admin-login__field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-login__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
