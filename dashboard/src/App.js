import React, { useState, useEffect } from 'react';
import Login from './Login';
import EventEditorModal from './dashboard/EventEditor/EventEditorModal';
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
  const [selectedMode, setSelectedMode] = useState('event');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingEventSwitch, setPendingEventSwitch] = useState(null);

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
    setShowEditor(false);
    setSelectedEvent(null);
  };

  const openEditor = (event = null) => {
    if (hasUnsavedChanges) {
      setPendingEventSwitch(event);
    } else {
      setSelectedEvent(event);
      setSelectedMode('event');
      setShowEditor(true);
    }
  };

  const openAccountInfo = () => {
    setSelectedEvent(null);
    setSelectedMode('account');
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedEvent(null);
    setHasUnsavedChanges(false);
    setPendingEventSwitch(null);
  };

  const handleEventSaved = () => {
    fetchEvents();
    setHasUnsavedChanges(false);
    setPendingEventSwitch(null);
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

          <div className="account-info-toggle" onClick={openAccountInfo}>
            Account Info
          </div>

          <div className="view-toggle">
            <button className={showUpcoming ? 'active' : ''} onClick={() => setShowUpcoming(true)}>
              Upcoming
            </button>
            <button className={!showUpcoming ? 'active' : ''} onClick={() => setShowUpcoming(false)}>
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

      {showEditor && selectedMode === 'event' && (
        <EventEditorModal
        eventId={selectedEvent?.id || null}
        vendorId={vendorId}
        onClose={closeEditor}
        onSave={handleEventSaved}
        openEditor={openEditor}
        pendingEventSwitch={pendingEventSwitch}
        clearPendingEventSwitch={() => setPendingEventSwitch(null)}
        setHasUnsavedChanges={setHasUnsavedChanges}
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
            <p><strong>Vendor Email:</strong> {token}</p>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;