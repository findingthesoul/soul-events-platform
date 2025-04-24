import React, { useState, useEffect } from 'react';
import Login from './Login';
import EventEditorModal from './EventEditorModal';
import './App.css';

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
      const formula = `SEARCH(\"${overrideVendorId}\", ARRAYJOIN({Vendors} & \"\"))`;
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
        console.error('Airtable fetch error:', data.error.message);
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
    <div className="app-container">
      <div className="list-panel">
        <div className="header">
          {vendorName && <h2>Welcome, {vendorName}</h2>}
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div className="event-list">
          {events.map((e) => (
            <div
              key={e.id}
              className="event-card"
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

          <button className="create-btn" onClick={() => openEditor(null)}>
            + Create Event
          </button>
        </div>
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
