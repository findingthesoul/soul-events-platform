import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './EventEditorModal.css';

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

  const handleBlur = async () => {
    if (!event?.id) return;
    try {
      const updatedFields = {
        'Event Title': form.title || '',
        'Start Date': form.startDate || null,
        'End Date': form.endDate || null,
        Description: form.description || '',
        'Event Image': form.image ? [{ url: form.image }] : [],
        Format: form.format || '',
        'Zoom link': form.format === 'Online' ? form.zoomLink || '' : '',
        'Location URL': form.format === 'In-person' ? form.locationUrl || '' : '',
        'Location Description': form.format === 'In-person' ? form.locationDescription || '' : '',
        Location: form.format === 'In-person' ? form.location || '' : '',
        Vendors: [vendorId],
      };

      Object.keys(updatedFields).forEach((key) => {
        if (updatedFields[key] === undefined || updatedFields[key] === null || updatedFields[key] === '') {
          delete updatedFields[key];
        }
      });

      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${event.id}`, {
        method: 'PATCH',
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFormat = (selected) => {
    setForm((prev) => ({ ...prev, format: selected }));
  };

  return (
    <div className="modal-panel">
      <div className="modal-content">
        <h2>{event ? 'Edit Event' : 'Create Event'}</h2>

        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} onBlur={handleBlur} />

        <label>Start Date</label>
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} onBlur={handleBlur} />

        <label>End Date</label>
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} onBlur={handleBlur} />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} onBlur={handleBlur} />

        <label>Format</label>
        <div className="toggle-buttons">
          <button
            className={form.format === 'In-person' ? 'active' : ''}
            onClick={() => toggleFormat('In-person')}
          >
            In-person
          </button>
          <button
            className={form.format === 'Online' ? 'active' : ''}
            onClick={() => toggleFormat('Online')}
          >
            Online
          </button>
        </div>

        {form.format === 'Online' && (
          <>
            <label>Zoom Link</label>
            <input name="zoomLink" value={form.zoomLink} onChange={handleChange} onBlur={handleBlur} />
          </>
        )}

        {form.format === 'In-person' && (
          <>
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} onBlur={handleBlur} />

            <label>Location URL</label>
            <input name="locationUrl" value={form.locationUrl} onChange={handleChange} onBlur={handleBlur} />

            <label>Location Description</label>
            <textarea name="locationDescription" value={form.locationDescription} onChange={handleChange} onBlur={handleBlur} />
          </>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EventEditorModal;
