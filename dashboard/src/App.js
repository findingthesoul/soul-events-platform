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

      setTimeout(() => {
        fetchEvents(storedToken, storedVendorId);
      }, 100);
    }
  }, []);

  const fetchEvents = async (overrideToken = token, overrideVendorId = vendorId) => {
    try {
      console.log("Fetching events for vendor:", overrideVendorId);
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
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        {vendorName && <h2 className="text-xl font-semibold">Welcome, {vendorName}</h2>}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e.id}
            className="p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer"
            onClick={() => openEditor(e)}
          >
            <div className="font-medium text-lg text-gray-800">{e.fields['Event Title']}</div>
            {e.fields['Start Date'] && (
              <div className="text-sm text-gray-500">
                {e.fields['Start Date']}
                {e.fields['Location'] ? ` @ ${e.fields['Location']}` : ''}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => openEditor(null)}
          className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
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
