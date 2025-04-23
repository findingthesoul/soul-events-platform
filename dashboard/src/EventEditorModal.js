// src/EventEditorModal.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EventEditorModal = ({ isOpen, onRequestClose, event, fetchEvents }) => {
  const [form, setForm] = useState({});
  const [tab, setTab] = useState('event');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (event) {
      setForm({
        id: event.id,
        title: event.title || '',
        startDate: event.startDate || '',
        endDate: event.endDate || '',
        description: event.description || '',
        format: event.format || '',
        zoomLink: event.zoomLink || '',
        locationUrl: event.locationUrl || '',
        locationDescription: event.locationDescription || '',
        image: event.image || '',
      });
    }
  }, [event]);

  const handleSave = async () => {
    try {
      const payload = {
        fields: {
          'Event Title': form.title,
          'Start Date': form.startDate,
          'End Date': form.endDate,
          Description: form.description,
          Format: form.format,
          'Zoom link': form.zoomLink,
          'Location URL': form.locationUrl,
          'Location Description': form.locationDescription,
          'Event Image': form.image ? [{ url: form.image }] : [],
        },
      };

      await axios.patch(
        `https://api.airtable.com/v0/YOUR_BASE_ID/Events/${form.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer YOUR_API_KEY`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage('Event saved!');
      fetchEvents();
      onRequestClose();
    } catch (err) {
      console.error(err);
      setMessage('Error saving event.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Edit Event">
      <h2>{form.title || 'New Event'}</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setTab('event')}>Event Info</button>
        <button onClick={() => setTab('registration')}>Registration</button>
        <button onClick={() => setTab('guests')}>Guests</button>
        <button onClick={() => setTab('more')}>More</button>
      </div>

      {tab === 'event' && (
        <div>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" />
          <input name="startDate" value={form.startDate} onChange={handleChange} placeholder="Start Date" />
          <input name="endDate" value={form.endDate} onChange={handleChange} placeholder="End Date" />

          <div style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <ReactQuill
              theme="snow"
              value={form.description}
              onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
            />
          </div>

          <select name="format" value={form.format} onChange={handleChange}>
            <option value="">Select format</option>
            <option value="Online">Online</option>
            <option value="In-person">In-person</option>
          </select>

          {form.format === 'Online' && (
            <input name="zoomLink" value={form.zoomLink} onChange={handleChange} placeholder="Zoom Link" />
          )}

          {form.format === 'In-person' && (
            <>
              <input
                name="locationUrl"
                value={form.locationUrl}
                onChange={handleChange}
                placeholder="Location URL"
              />
              <input
                name="locationDescription"
                value={form.locationDescription}
                onChange={handleChange}
                placeholder="Location Description"
              />
            </>
          )}

          <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" />
        </div>
      )}

      {tab === 'registration' && <div>🎟️ Registration settings (Tickets & Coupons coming soon)</div>}
      {tab === 'guests' && <div>👥 Guests list (To be implemented)</div>}
      {tab === 'more' && <div>🛠️ More options (Clone, Link, Calendar)</div>}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSave}>💾 Save</button>
        <button onClick={onRequestClose} style={{ marginLeft: '1rem' }}>Cancel</button>
        <div>{message}</div>
      </div>
    </Modal>
  );
};

export default EventEditorModal;
