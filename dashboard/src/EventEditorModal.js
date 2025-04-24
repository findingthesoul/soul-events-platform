import React, { useState, useEffect } from 'react';
import './EventEditorModal.css';

const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;

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
  });

  useEffect(() => {
    if (event?.fields) {
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
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    handleSave(updated);
  };

  const handleSave = async (data = form) => {
    try {
      const updatedFields = {
        'Event Title': data.title,
        'Start Date': data.startDate,
        'End Date': data.endDate,
        Description: data.description,
        Format: data.format,
        'Zoom link': data.format === 'Online' ? data.zoomLink : '',
        Location: data.format === 'In-person' ? data.location : '',
        'Location URL': data.format === 'In-person' ? data.locationUrl : '',
        'Location Description': data.format === 'In-person' ? data.locationDescription : '',
        Vendors: [vendorId],
      };

      Object.keys(updatedFields).forEach(
        (key) => (updatedFields[key] === '' || updatedFields[key] == null) && delete updatedFields[key]
      );

      const res = await fetch(
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

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Airtable error:', errorData);
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="editor-overlay">
      <div className="editor-panel">
        <div className="editor-header">
          <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} onBlur={handleSave} />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} onBlur={handleSave} />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} onBlur={handleSave} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} onBlur={handleSave} />
        </div>

        <div className="form-group">
          <label>Format</label>
          <div className="toggle-container">
            <button
              className={`toggle-btn ${form.format === 'In-person' ? 'active' : ''}`}
              onClick={() => handleChange({ target: { name: 'format', value: 'In-person' } })}
            >
              In-person
            </button>
            <button
              className={`toggle-btn ${form.format === 'Online' ? 'active' : ''}`}
              onClick={() => handleChange({ target: { name: 'format', value: 'Online' } })}
            >
              Online
            </button>
          </div>
        </div>

        {form.format === 'Online' && (
          <div className="form-group">
            <label>Zoom Link</label>
            <input name="zoomLink" value={form.zoomLink} onChange={handleChange} onBlur={handleSave} />
          </div>
        )}

        {form.format === 'In-person' && (
          <>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} onBlur={handleSave} />
            </div>
            <div className="form-group">
              <label>Location URL</label>
              <input name="locationUrl" value={form.locationUrl} onChange={handleChange} onBlur={handleSave} />
            </div>
            <div className="form-group">
              <label>Location Description</label>
              <textarea name="locationDescription" value={form.locationDescription} onChange={handleChange} onBlur={handleSave} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventEditorModal;
