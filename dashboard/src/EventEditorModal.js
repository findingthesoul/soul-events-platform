// App.js — list layout for event overview + create event button using modal 

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import EventEditorModal from './EventEditorModal';

function App() {
  const [formData, setFormData] = useState({ title: '', date: '', location: '', price: '', capacity: '', vendorId: '' });
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://soul-events-platform-1.onrender.com/vendors/login', loginData);
      setToken(res.data.token);
      setLoginData({ email: '', password: '' });
    } catch (err) {
      console.error('Login failed:', err);
      setMessage('Login failed ❌');
    }
  };

  const fetchEvents = async () => {
    if (!token) return;
    try {
      const res = await axios.get('https://soul-events-platform-1.onrender.com/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const upcoming = res.data.filter(e => new Date(e.date) >= new Date());
      setEvents(upcoming);
    } catch (err) {
      console.error('Fetch error:', err);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded.vendorId) {
        setFormData((prev) => ({ ...prev, vendorId: decoded.vendorId }));
      }
      fetchEvents();
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white shadow p-4 mb-8 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">Vendor Login</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="email" placeholder="Email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="w-full p-2 border rounded" />
          <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Log In</button>
        </form>
      </div>

      {events.length > 0 && (
        <div className="max-w-xl mx-auto mt-12">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <ul className="space-y-3">
            {events.map(event => (
              <li
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="cursor-pointer hover:bg-gray-100 p-3 rounded border border-gray-200"
              >
                <strong>{event.title}</strong> <span className="text-gray-500">({event.date} @ {event.location})</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-center">
            <button
              onClick={() => setSelectedEvent({ title: '', startDate: '', endDate: '', description: '', image: '', format: 'online', zoom: '', location: '', locationDescription: '', host: '', id: '' })}
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
            >
              + Create New Event
            </button>
          </div>
        </div>
      )}

      <EventEditorModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
          fetchEvents();
        }}
      />
    </div>
  );
}

export default App;
