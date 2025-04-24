import React, { useState, useEffect } from 'react';
import Login from './Login';
import EventEditorModal from './EventEditorModal';

const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Events';

function App() {
  const [token, setToken] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [vendorName, setVendorName] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorName = localStorage.getItem('vendorName');

    if (storedToken && storedVendorId) {
      setToken(storedToken);
      setVendorId(storedVendorId);
      setVendorName(storedVendorName);

      setTimeout(() => {
        fetchEvents(storedToken, storedVendorId);
      }, 100);
    }
  }, []);

  const fetchEvents = async (overrideToken = token, overrideVendorId = vendorId) => {
    try {
      console.log("Fetching events for vendor:", overrideVendorId);
      const formula = `SEARCH("${overrideVendorId}", ARRAYJOIN({Vendors} & ""))`;
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(formula)}`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.error) {
        console.error("Airtable fetch error:", data.error.message);
        return;
      }
      setEvents(data.records || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const handleLogin = ({ token, vendorId, vendorName }) => {
    setToken(token);
    setVendorId(vendorId);
    setVendorName(vendorName);
    localStorage.setItem('token', token);
    localStorage.setItem('vendorId', vendorId);
    localStorage.setItem('vendorName', vendorName);

    setTimeout(() => {
      fetchEvents(token, vendorId);
    }, 100);
  };

  const handleLogout = () => {
    setToken(null);
    setVendorId(null);
    setVendorName(null);
    localStorage.clear();
    setEvents([]);
    setSelectedEvent(null);
  };

  if (!token || !vendorId) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <div style={{ width: selectedEvent ? '40%' : '100%', padding: '2rem', overflowY: 'auto', transition: 'width 0.3s ease-in-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Welcome, {vendorName}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div>
          {events.map((e) => (
            <div
              key={e.id}
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                background: '#f2f2f2',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedEvent(e)}
            >
              <strong>{e.fields['Event Title']}</strong>{' '}
              {e.fields['Start Date'] && (
                <span>
                  ({e.fields['Start Date']}
                  {e.fields['Location'] ? ` @ ${e.fields['Location']}` : ''})
                </span>
              )}
            </div>
          ))}

          <button
            onClick={() => setSelectedEvent(null)}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Create Event
          </button>
        </div>
      </div>

      {selectedEvent !== null && (
        <div
          style={{
            width: '60%',
            background: '#f9f9f9',
            padding: '2rem',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out',
            overflowY: 'auto',
          }}
        >
          <EventEditorModal
            event={selectedEvent}
            vendorId={vendorId}
            onClose={() => setSelectedEvent(null)}
            onSave={() => {
              fetchEvents();
              setSelectedEvent(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
