import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/vendors/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      
        const data = await res.json();
        console.log('Login response:', data); // ADD THIS LINE
      
        if (res.ok) {
          onLogin(data); // This passes { token, vendorId, vendorName }
        } else {
          setError(data.error || 'Login failed');
        }
      };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Vendor Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label><br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <button type="submit" style={{ marginTop: '1rem' }}>Login</button>
      </form>
    </div>
  );
};

export default Login;