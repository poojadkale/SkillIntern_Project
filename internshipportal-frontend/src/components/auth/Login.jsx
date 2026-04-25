import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        if (result.user.role === 'ADMIN') {
          navigate('/admin');
        } else if (result.user.role === 'COMPANY') {
          navigate('/company/dashboard');
        } else if (result.user.role === 'STUDENT') {
          navigate('/student/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container-premium">
      <div className="login-card-premium">
        <div className="card-header-premium">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Regular Error Message */}
        {error && (
          <div className="error-alert-premium">
            <FiAlertCircle className="alert-icon" />
            <div className="alert-text">
              <strong>Authentication failed</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-premium">
          <div className="input-group-premium">
            <label htmlFor="email">
              <FiMail className="label-icon" />
              Email
            </label>
            <div className="input-field-premium">
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@example.com"
                disabled={loading}
              />
              <div className="input-border"></div>
            </div>
          </div>

          <div className="input-group-premium">
            <label htmlFor="password">
              <FiLock className="label-icon" />
              Password
            </label>
            <div className="input-field-premium">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-premium"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              <div className="input-border"></div>
            </div>
          </div>

          <button type="submit" className="submit-btn-premium" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-premium"></div>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <FiArrowRight className="btn-arrow" />
              </>
            )}
          </button>

          <div className="register-section-premium">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="register-link-premium">
                Create account
                <FiArrowRight className="link-arrow" />
              </Link>
            </p>
          </div>

          
        </form>
      </div>
    </div>
  );
};

export default Login;