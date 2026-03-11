import React, { useState } from 'react';
import { loginGuest } from './dashboard/EventEditor/api';

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '7px',
  border: '1px solid #d1d5db',
  marginBottom: '1rem',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};

const btnStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#7c3aed',
  color: '#fff',
  border: 'none',
  borderRadius: '7px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.95rem',
};

const Login = ({ onLogin, onGuestLogin }) => {
  const [mode, setMode] = useState('vendor'); // 'vendor' | 'guest'

  // Vendor state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [vendorMessage, setVendorMessage] = useState('');

  // Guest state
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [guestMessage, setGuestMessage] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setVendorMessage('');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/vendors/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setVendorMessage(data.error || 'Login failed');
      }
    } catch {
      setVendorMessage('Unable to connect to server');
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setGuestMessage('');
    setGuestLoading(true);
    try {
      const data = await loginGuest(guestEmail, guestPassword);
      onGuestLogin(data);
    } catch (err) {
      setGuestMessage(err.message || 'Login failed');
    } finally {
      setGuestLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '0.55rem',
    background: active ? '#7c3aed' : '#f3f4f6',
    color: active ? '#fff' : '#374151',
    border: 'none',
    cursor: 'pointer',
    fontWeight: active ? '600' : '400',
    fontSize: '0.9rem',
    transition: 'background 0.15s',
  });

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#111827' }}>Welcome back</h2>

      {/* ── Mode tabs ── */}
      <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '1.75rem' }}>
        <button style={{ ...tabStyle(mode === 'vendor'), borderRadius: '7px 0 0 7px' }} onClick={() => setMode('vendor')}>Vendor / Organiser</button>
        <button style={{ ...tabStyle(mode === 'guest'), borderRadius: '0 7px 7px 0' }} onClick={() => setMode('guest')}>Guest</button>
      </div>

      {/* ── Vendor form ── */}
      {mode === 'vendor' && (
        <form onSubmit={handleVendorSubmit}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: '2.75rem' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '37%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          {vendorMessage && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{vendorMessage}</p>}

          <button type="submit" style={btnStyle}>Login</button>
        </form>
      )}

      {/* ── Guest form ── */}
      {mode === 'guest' && (
        <form onSubmit={handleGuestSubmit}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Email</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showGuestPassword ? 'text' : 'password'}
              value={guestPassword}
              onChange={(e) => setGuestPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: '2.75rem' }}
            />
            <span
              onClick={() => setShowGuestPassword(!showGuestPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '37%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280' }}
            >
              {showGuestPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          {guestMessage && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{guestMessage}</p>}

          <button type="submit" style={btnStyle} disabled={guestLoading}>
            {guestLoading ? 'Signing in…' : 'Login as Guest'}
          </button>

          <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem' }}>
            Your password was sent by the event organiser.
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
