import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '@/services/authService';
import { setCredentials } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import './Auth.scss';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.warning('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(phone);
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      dispatch(setCredentials({ user, token }));
      toast.success('Login successful!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          <div className="auth__header">
            <h1 className="auth__title">Welcome Back</h1>
            <p className="auth__subtitle">Enter your phone number to login</p>
          </div>

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="auth__input"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
              />
              <span className="auth__hint">
                We'll send you an OTP for verification
              </span>
            </div>

            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <div className="auth__footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth__link">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
