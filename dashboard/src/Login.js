import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/vendors/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (res.ok) {
        onLogin(data);
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setMessage('Unable to connect to server');
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome back</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '1rem',
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginBottom: '1rem',
              paddingRight: '2.5rem',
            }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#666',
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>

        {message && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{message}</p>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;