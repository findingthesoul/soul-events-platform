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
    location: '',
    locationUrl: '',
    locationDescription: '',
    image: '',
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
        location: f['Location'] || '',
        locationUrl: f['Location URL'] || '',
        locationDescription: f['Location Description'] || '',
        image: f['Event Image']?.[0]?.url || '',
      });
    } else {
      setForm({
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        format: 'Online',
        zoomLink: '',
        location: '',
        locationUrl: '',
        locationDescription: '',
        image: '',
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
        Location: form.format === 'In-person' ? form.location : '',
        'Location URL': form.format === 'In-person' ? form.locationUrl : '',
        'Location Description': form.format === 'In-person' ? form.locationDescription : '',
        'Event Image': form.image ? [{ url: form.image }] : [],
        Vendors: [vendorId],
      };

      Object.keys(updatedFields).forEach((key) => {
        if (
          updatedFields[key] === undefined ||
          updatedFields[key] === null ||
          updatedFields[key] === '' ||
          (Array.isArray(updatedFields[key]) && updatedFields[key].length === 0)
        ) {
          delete updatedFields[key];
        }
      });

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${event.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: updatedFields }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Airtable error:', error);
        alert('❌ Could not save changes. See console for details.');
        return;
      }

      onSave();
    } catch (err) {
      console.error(err);
      alert('❌ Unexpected error saving event.');
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
          borderRadius: '16px',
          padding: '2rem',
        },
      }}
    >
      <h2 style={{ marginBottom: '1rem' }}>{event ? 'Edit Event' : 'Create Event'}</h2>

      <label>Event Title</label>
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
          <textarea name="locationDescription" value={form.locationDescription} onChange={handleChange} />
        </>
      )}

      <label>Event Image URL</label>
      <input name="image" value={form.image} onChange={handleChange} />

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={handleSave}
          style={{ marginRight: '1rem', background: '#007bff', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px' }}
        >
          Save
        </button>
        <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
      </div>
    </Modal>
  );
};

export default EventEditorModal;