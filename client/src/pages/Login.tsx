import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_OPTIONS, type RoleKey } from '../data/roles';
import { Plane, Eye, EyeOff, AlertCircle, Loader, UserPlus, User, Mail, Lock, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleKey, setRoleKey] = useState<RoleKey>('TECHNICIAN');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const resetFormError = () => setError('');

  const validateCommonFields = () => {
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }

    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return false;
    }

    if (!password) {
      setError('Password is required.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!validateCommonFields()) {
      return;
    }

    setSubmitting(true);

    const success =
      mode === 'login'
        ? await login(email.trim(), password)
        : await register(name.trim(), email.trim(), password, roleKey);

    setSubmitting(false);

    if (success) {
      navigate('/dashboard');
      return;
    }

    setError(mode === 'login' ? 'Authentication failed. Check your credentials.' : 'Registration failed. Try a different email or role.');
  };

  const loading = isLoading || submitting;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #eef6fb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-family)',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.55 }}>
        <div style={{ position: 'absolute', inset: '-10% auto auto -8%', width: '32vw', height: '32vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.18) 0%, transparent 68%)' }} />
        <div style={{ position: 'absolute', right: '-8%', bottom: '-12%', width: '34vw', height: '34vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 68%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '68px', height: '68px', borderRadius: '18px', marginBottom: '16px',
            background: 'linear-gradient(135deg, rgba(8,145,178,0.12) 0%, rgba(59,130,246,0.12) 100%)',
            border: '1px solid rgba(8,145,178,0.2)'
          }}>
            <Plane size={32} color="#0891b2" style={{ transform: 'rotate(45deg)' }} />
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '0.12em', color: 'var(--text-primary)' }}>DRISHYAM</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Aviation Operations Control
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.78)',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          boxShadow: '0 24px 48px rgba(15,23,42,0.12)',
          backdropFilter: 'blur(16px)',
          padding: '28px',
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: 'rgba(148,163,184,0.1)', borderRadius: '12px' }}>
            <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, border: 'none', background: mode === 'login' ? '#ffffff' : 'transparent', borderRadius: '10px', padding: '10px 12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}>
              Sign In
            </button>
            <button type="button" onClick={() => { setMode('register'); setError(''); }} style={{ flex: 1, border: 'none', background: mode === 'register' ? '#ffffff' : 'transparent', borderRadius: '10px', padding: '10px 12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}>
              Register
            </button>
          </div>

          <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: 'var(--text-primary)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create operator account'}
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Use your email and password to continue.' : 'Create a new user with a role for RBAC access.'}
          </p>

          {error && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '18px', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--status-aog-border)', backgroundColor: 'var(--status-aog-bg)', color: 'var(--status-aog-text)' }}>
              <AlertCircle size={16} style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', lineHeight: 1.45 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input id="name" className="form-control" value={name} onChange={(event) => { setName(event.target.value); resetFormError(); }} placeholder="Jane Doe" disabled={loading} style={{ width: '100%', paddingLeft: '40px' }} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="email" type="email" className="form-control" value={email} onChange={(event) => { setEmail(event.target.value); resetFormError(); }} placeholder="operator@drishyam.aero" disabled={loading} style={{ width: '100%', paddingLeft: '40px' }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="password" type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={(event) => { setPassword(event.target.value); resetFormError(); }} placeholder="At least 6 characters" disabled={loading} style={{ width: '100%', paddingLeft: '40px', paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="role" className="form-label">Role</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select id="role" className="form-control" value={roleKey} onChange={(event) => { setRoleKey(event.target.value as RoleKey); resetFormError(); }} disabled={loading} style={{ width: '100%', paddingLeft: '40px' }}>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', marginTop: '8px', padding: '14px 16px', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(8,145,178,0.55)' : 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)', color: '#fff', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: loading ? 'none' : '0 16px 32px rgba(8,145,178,0.24)'
            }}>
              {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Please wait</> : <><UserPlus size={18} /> {mode === 'login' ? 'Sign In' : 'Create Account'}</>}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;