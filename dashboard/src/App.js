import React, { useState } from 'react';
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
const res = await axios.post('https://soul-events-platform-1.onrender.com/events/create', {
  ...formData,
  price: Number(formData.price),
  capacity: Number(formData.capacity)
});      setMessage('🎉 Event created successfully!');
      setFormData({
        title: '', date: '', location: '', price: '', capacity: '', vendorId: ''
      });
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong 😔');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create New Event</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} />
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
          <input type="number" name="price" placeholder="Price (€)" value={formData.price} onChange={handleChange} />
          <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} />
          <input type="text" name="vendorId" placeholder="Vendor Airtable ID" value={formData.vendorId} onChange={handleChange} />
          <button type="submit" style={{ background: '#4c4cff', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>Create Event</button>
        </form>
        {message && <p style={{ marginTop: '1rem', color: '#444' }}>{message}</p>}
      </div>
    </div>
  );
}

export default App;