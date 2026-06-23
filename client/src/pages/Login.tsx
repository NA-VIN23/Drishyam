import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Operator email is required.'); return; }
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Access code is required.'); return; }
    if (password.length < 6) { setError('Access code must be at least 6 characters.'); return; }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Authentication failed. Verify credentials and try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 40%, #f3f4f6 70%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-family)'
    }}>
      {/* Animated radar grid background */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
      }}>
        {/* Grid lines */}
        <svg width="100%" height="100%" style={{ opacity: 0.06, position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0891b2" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,114,170,0.12) 0%, transparent 60%)',
          animation: 'blobDrift 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)',
          animation: 'blobDrift 16s ease-in-out infinite reverse'
        }} />

        {/* Rotating radar rings */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px', height: '900px', pointerEvents: 'none'
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute', inset: `${i * 15}%`,
              borderRadius: '50%',
              border: `1px solid rgba(8,145,178,${0.04 - i * 0.01})`,
            }} />
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div style={{
        width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1,
        animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '16px', marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(8,145,178,0.08) 0%, rgba(59,130,246,0.08) 100%)',
            border: '1px solid rgba(8,145,178,0.2)',
            boxShadow: '0 0 30px rgba(8,145,178,0.1)',
          }}>
            <Plane size={34} color="#0891b2" style={{ transform: 'rotate(45deg)' }} />
          </div>

          <h1 style={{
            fontSize: '30px', fontWeight: 800, letterSpacing: '0.1em',
            background: 'linear-gradient(135deg, #111827 0%, #0891b2 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: '0 0 6px'
          }}>
            DRISHYAM
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Aviation Operations & Maintenance Control
          </p>
        </div>

        {/* Card Container */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.7) 0%, rgba(243,244,246,0.9) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
            Operator Sign In
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>
            Use any <span style={{ color: 'var(--accent-cyan)' }}>valid email</span> + 6-character access code
          </p>

          {/* Error Alert */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              backgroundColor: 'var(--status-aog-bg)', border: '1px solid var(--status-aog-border)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <AlertCircle size={16} color="var(--status-aog-text)" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--status-aog-text)', lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Operator Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="operator@drishyam.aero"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                disabled={isLoading}
                style={{ width: '100%' }}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Access Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={isLoading}
                  style={{ width: '100%', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', padding: '2px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', marginTop: '8px', padding: '14px',
                fontSize: '15px', fontWeight: 600,
                background: isLoading
                  ? 'rgba(59,130,246,0.5)'
                  : 'linear-gradient(135deg, #0077b6 0%, #3b82f6 100%)',
                color: '#fff', border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s ease',
                boxShadow: isLoading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
                fontFamily: 'var(--font-family)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Authenticating...
                </>
              ) : (
                <>
                  <Plane size={18} />
                  Authorise Access
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
          DRISHYAM v1.0 · Aviation Operations Platform ·{' '}
          <span style={{ color: 'var(--status-active-text)' }}>● System Operational</span>
        </p>
      </div>

      <style>{`
        @keyframes blobDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, 5%) scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;