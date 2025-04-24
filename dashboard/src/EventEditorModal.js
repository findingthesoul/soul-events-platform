import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;

Modal.setAppElement('#root');

const EventEditorModal = ({ event, vendorId, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    format: 'Online',
    zoomLink: '',
    locationUrl: '',
    locationDescription: '',
    location: '',
  });

  useEffect(() => {
    if (event && event.fields) {
      const f = event.fields;
      setForm({
        title: f['Event Title'] || '',
        startDate: f['Start Date'] || '',
        endDate: f['End Date'] || '',
        description: f['Description'] || '',
        format: f['Format'] || 'Online',
        zoomLink: f['Zoom link'] || '',
        locationUrl: f['Location URL'] || '',
        locationDescription: f['Location Description'] || '',
        location: f['Location'] || '',
      });
    } else {
      setForm({
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        format: 'Online',
        zoomLink: '',
        locationUrl: '',
        locationDescription: '',
        location: '',
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedFields = {
        'Event Title': form.title,
        'Start Date': form.startDate || null,
        'End Date': form.endDate || null,
        Description: form.description,
        Format: form.format,
        'Zoom link': form.format === 'Online' ? form.zoomLink : '',
        'Location URL': form.format === 'In-person' ? form.locationUrl : '',
        'Location Description': form.format === 'In-person' ? form.locationDescription : '',
        Location: form.format === 'In-person' ? form.location : '',
        Vendors: [vendorId],
      };

      // Remove empty values before sending to Airtable
      Object.keys(updatedFields).forEach((key) => {
        if (updatedFields[key] === '' || updatedFields[key] == null) {
          delete updatedFields[key];
        }
      });

      const url = event
        ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${event.id}`
        : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events`;

      const response = await fetch(url, {
        method: event ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: updatedFields }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Airtable error:', errorData);
        throw new Error('Failed to save event');
      }

      onSave();
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Something went wrong while saving the event. Check the console for details.');
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Edit Event"
      style={{
        content: {
          maxWidth: '600px',
          margin: 'auto',
          borderRadius: '12px',
          padding: '2rem',
        },
      }}
    >
      <h2>{event ? 'Edit Event' : 'Create Event'}</h2>

      <label>Title</label>
      <input name="title" value={form.title} onChange={handleChange} />

      <label>Start Date</label>
      <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />

      <label>End Date</label>
      <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />

      <label>Description</label>
      <textarea name="description" value={form.description} onChange={handleChange} />

      <label>Format</label>
      <select name="format" value={form.format} onChange={handleChange}>
        <option value="Online">Online</option>
        <option value="In-person">In-person</option>
      </select>

      {form.format === 'Online' && (
        <>
          <label>Zoom Link</label>
          <input name="zoomLink" value={form.zoomLink} onChange={handleChange} />
        </>
      )}

      {form.format === 'In-person' && (
        <>
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} />

          <label>Location URL</label>
          <input name="locationUrl" value={form.locationUrl} onChange={handleChange} />

          <label>Location Description</label>
          <textarea
            name="locationDescription"
            value={form.locationDescription}
            onChange={handleChange}
          />
        </>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSave} style={{ marginRight: '1rem' }}>
          Save
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default EventEditorModal;