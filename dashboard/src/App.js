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
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [selectedMode, setSelectedMode] = useState('event'); // 'event' or 'account'

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
    setShowEditor(false);
    setSelectedEvent(null);
  };

  const openEditor = (event = null) => {
    setSelectedEvent(event);
    setSelectedMode('event');
    setShowEditor(true);
  };

  const openAccountInfo = () => {
    setSelectedEvent(null);
    setSelectedMode('account');
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedEvent(null);
  };

  const handleEventSaved = () => {
    fetchEvents();
    setShowEditor(false);
    setSelectedEvent(null);
  };

  const toggleShowUpcoming = () => {
    setShowUpcoming(prev => !prev);
  };

  const filteredAndSortedEvents = events
    .filter(event => {
      const startDate = new Date(event.fields['Start Date']);
      const now = new Date();
      return showUpcoming ? startDate >= now : startDate < now;
    })
    .sort((a, b) => {
      const aDate = new Date(a.fields['Start Date']);
      const bDate = new Date(b.fields['Start Date']);
      return aDate - bDate;
    });

  if (!token || !vendorId) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div className="event-list">
        <div className="event-header">
          {vendorName && <h2>Welcome, {vendorName}</h2>}

          {/* Account Info Toggle */}
          <div className="account-info-toggle" onClick={openAccountInfo}>
            Account Info
          </div>

          {/* View Toggle Switch */}
          <div className="view-toggle">
            <button
              className={showUpcoming ? 'active' : ''}
              onClick={() => setShowUpcoming(true)}
            >
              Upcoming
            </button>
            <button
              className={!showUpcoming ? 'active' : ''}
              onClick={() => setShowUpcoming(false)}
            >
              Past
            </button>
          </div>
        </div>

        {filteredAndSortedEvents.map((e) => (
          <div
            key={e.id}
            className={`event-card ${selectedEvent?.id === e.id ? 'selected' : ''}`}
            onClick={() => openEditor(e)}
          >
            <strong>{e.fields['Event Title']}</strong>
            {e.fields['Start Date'] && (
              <span>
                ({new Date(e.fields['Start Date']).toLocaleDateString()}
                {e.fields['Location'] ? ` @ ${e.fields['Location']}` : ''})
              </span>
            )}
          </div>
        ))}

        <button className="add-event-btn" onClick={() => openEditor(null)}>
          + Create Event
        </button>
      </div>

      {/* Right side panel */}
      {showEditor && selectedMode === 'event' && (
        <EventEditorModal
          event={selectedEvent}
          vendorId={vendorId}
          onClose={closeEditor}
          onSave={handleEventSaved}
        />
      )}

      {showEditor && selectedMode === 'account' && (
        <div className="editor-panel">
          <div className="editor-header">
            <h2>Account Information</h2>
            <button className="close-btn" onClick={closeEditor}>×</button>
          </div>

          <div className="account-info-panel">
            <p><strong>Vendor Name:</strong> {vendorName}</p>
            <p><strong>Vendor Email:</strong> {token}</p> {/* (If real email is available, replace token here) */}
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;