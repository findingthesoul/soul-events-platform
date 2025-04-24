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
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorName = localStorage.getItem('vendorName');
    if (storedToken && storedVendorId) {
      setToken(storedToken);
      setVendorId(storedVendorId);
      setVendorName(storedVendorName);
    }
  }, []);

  const fetchEvents = async (jwt = token, id = vendorId) => {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=AND(FIND("${id}", ARRAYJOIN({Vendors} & "")))`, {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );

      const data = await response.json();
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
    fetchEvents();
  };

  const handleLogout = () => {
    setToken(null);
    setVendorId(null);
    setVendorName(null);
    localStorage.clear();
    setEvents([]);
  };

  const openEditor = (event = null) => {
    setSelectedEvent(event);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedEvent(null);
  };

  const handleEventSaved = () => {
    closeEditor();
    fetchEvents();
  };

  if (!token || !vendorId) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {vendorName && <h2>Welcome, {vendorName}</h2>}
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
            onClick={() => openEditor(e)}
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
          onClick={() => openEditor(null)}
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

      {showEditor && (
        <EventEditorModal
          event={selectedEvent}
          vendorId={vendorId}
          onClose={closeEditor}
          onSave={handleEventSaved}
        />
      )}
    </div>
  );
}

export default App;