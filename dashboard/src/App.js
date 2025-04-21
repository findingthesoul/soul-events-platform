import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    price: '',
    capacity: '',
    vendorId: ''
  });

  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [events, setEvents] = useState([]);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
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
      setFormData({
        title: '', date: '', location: '', price: '', capacity: '', vendorId: ''
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong 😔');
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
    if (token) fetchEvents();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white shadow-lg p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Create New Event</h2>

        <input
          type="text"
          placeholder="JWT Token"
          className="w-full p-2 mb-4 border rounded"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="number" name="price" placeholder="Price (€)" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="text" name="vendorId" placeholder="Vendor Airtable ID" value={formData.vendorId} onChange={handleChange} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Create Event</button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>

      {events.length > 0 && (
        <div className="max-w-xl mx-auto mt-12">
          <h2 className="text-lg font-semibold mb-4">Your Events</h2>
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="p-4 bg-white shadow rounded">
                <h3 className="text-md font-bold">{event.title}</h3>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Price:</strong> €{event.price}</p>
                <p><strong>Capacity:</strong> {event.capacity}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;