import React, { useState, useEffect } from 'react';
import Airtable from 'airtable';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const airtable = new Airtable({ apiKey: 'patHHK20bvITjKviJ.f639dabb04319b63a7559d43cda711a34451f83f612eea0ea4b3165974b9aca5' });
const base = airtable.base('app9qQNFV0zpH9R9y'); // Your Airtable Base ID

function App() {
  const [token, setToken] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [events, setEvents] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://soul-events-platform-1.onrender.com/vendors/login', loginData);
      setToken(res.data.token);
      const decoded = jwtDecode(res.data.token);
      setVendorId(decoded.vendorId);
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed. Please check your credentials.');
    }
  };

  useEffect(() => {
    if (!vendorId) return;

    setLoading(true);
    base('Events')
      .select({ view: 'Grid view' })
      .all()
      .then((records) => {
        const filtered = records
          .filter((r) => {
            const vendors = r.fields['Vendors'] || [];
            return vendors.includes(vendorId);
          })
          .map((record) => ({
            id: record.id,
            title: record.fields['Event Title'],
            date: record.fields['Date'],
            location: record.fields['Location'],
          }));

        setEvents(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Airtable:', err);
        setLoading(false);
      });
  }, [vendorId]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      {!token ? (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Vendor Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
              style={{ marginBottom: '0.5rem', padding: '0.5rem' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
              style={{ marginBottom: '0.5rem', padding: '0.5rem' }}
            />
            <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#4CAF50', color: 'white' }}>
              Log In
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Your Events</h2>

          {loading && <p>Loading events…</p>}

          {!loading && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {events.map((event) => (
                <li
                  key={event.id}
                  style={{
                    border: '1px solid #ccc',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    borderRadius: '6px',
                  }}
                >
                  <strong>{event.title}</strong>{' '}
                  <span style={{ color: '#666' }}>
                    ({event.date} @ {event.location})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;