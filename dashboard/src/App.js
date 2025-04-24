import React, { useState, useEffect } from 'react';
import Login from './Login';
import EventEditorModal from './EventEditorModal';
import './App.css'; // Ensure this includes the .event-list-container and .event-card styles

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

      setTimeout(() => {
        fetchEvents(storedToken, storedVendorId);
      }, 100);
    }
  }, []);

  const fetchEvents = async (overrideToken = token, overrideVendorId = vendorId) => {
    try {
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div className="event-list-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          {vendorName && <h2 style={{ margin: 0 }}>Welcome, {vendorName}</h2>}
          <button onClick={handleLogout}>Logout</button>
        </div>

        {events.map((e) => (
  <div
    key={e.id}
    className={`event-card ${selectedEvent?.id === e.id ? 'active' : ''}`}
    onClick={() => openEditor(e)}
  >
    <h3>{e.fields['Event Title']}</h3>
    {e.fields['Start Date'] && (
      <p className="event-sub">
        {e.fields['Start Date']}
        {e.fields['Location'] ? ` @ ${e.fields['Location']}` : ''}
      </p>
    )}
  </div>
))}

        <button
          onClick={() => openEditor(null)}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.25rem',
            background: '#007bff',
            color: '#fff',
            fontWeight: 500,
            fontSize: '1rem',
            border: 'none',
            borderRadius: '8px',
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