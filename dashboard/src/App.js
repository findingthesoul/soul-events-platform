// App.js — Fully integrated with EventEditorModal logic

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import EventEditorModal from './EventEditorModal';

function EventCard({ event, fetchEvents }) {
  const isUpcoming = new Date(event.date) >= new Date();
  const [editData, setEditData] = useState({
    title: event.title,
    date: event.date,
    location: event.location,
    price: event.price,
    capacity: event.capacity,
  });
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    try {
      await axios.patch(`https://soul-events-platform-1.onrender.com/events/${event.id}`, editData);
      setMessage('✅ Updated');
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed');
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      {isUpcoming ? (
        <>
          <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full p-1 mb-1 border rounded" />
          <input type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="w-full p-1 mb-1 border rounded" />
          <input type="text" value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} className="w-full p-1 mb-1 border rounded" />
          <input type="number" value={editData.price} onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })} className="w-full p-1 mb-1 border rounded" />
          <input type="number" value={editData.capacity} onChange={(e) => setEditData({ ...editData, capacity: Number(e.target.value) })} className="w-full p-1 mb-2 border rounded" />
          <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-1 rounded">Save Changes</button>
          {message && <p className="text-sm mt-2">{message}</p>}
        </>
      ) : (
        <>
          <h3 className="text-md font-bold">{event.title}</h3>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Price:</strong> €{event.price}</p>
          <p><strong>Capacity:</strong> {event.capacity}</p>
        </>
      )}
    </div>
  );
}

function App() {
  const [formData, setFormData] = useState({ title: '', date: '', location: '', price: '', capacity: '', vendorId: '' });
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('https://soul-events-platform-1.onrender.com/events/create', {
        ...formData,
        price: Number(formData.price),
        capacity: Number(formData.capacity)
      });
      setMessage('🎉 Event created successfully!');
      setFormData({ title: '', date: '', location: '', price: '', capacity: '', vendorId: formData.vendorId });
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong 😔');
    }
  };

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
      setEvents(res.data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <div className="max-w-xl mx-auto bg-white shadow-lg p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="number" name="price" placeholder="Price (€)" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Create Event</button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>

      {events.length > 0 && (
        <div className="max-w-xl mx-auto mt-12">
          <h2 className="text-lg font-semibold mb-4">Your Events</h2>
          <div className="space-y-6">
            {events.map(event => (
              <div key={event.id} onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                <EventCard event={event} fetchEvents={fetchEvents} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal at the end */}
      <EventEditorModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default App;
