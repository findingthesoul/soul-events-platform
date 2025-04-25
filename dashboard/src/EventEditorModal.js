import React, { useState, useEffect, useRef } from 'react';
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
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeout = useRef(null);

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
      setIsDirty(false);
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setIsDirty(true);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      handleSave(updated);
    }, 1200);
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

      setIsDirty(false);
      if (onSave) onSave();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm('You have unsaved changes. Do you want to save before closing?');
      if (confirmClose) {
        handleSave().then(() => onClose());
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="editor-overlay">
      <div className="editor-panel">
        <div className="editor-header">
          <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Format</label>
          <div className="format-toggle">
            <button
              className={form.format === 'In-person' ? 'active' : ''}
              onClick={() => handleChange({ target: { name: 'format', value: 'In-person' } })}
            >
              In-person
            </button>
            <button
              className={form.format === 'Online' ? 'active' : ''}
              onClick={() => handleChange({ target: { name: 'format', value: 'Online' } })}
            >
              Online
            </button>
          </div>
        </div>

        {form.format === 'Online' && (
          <div className="form-group">
            <label>Zoom Link</label>
            <input name="zoomLink" value={form.zoomLink} onChange={handleChange} />
          </div>
        )}

        {form.format === 'In-person' && (
          <>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location URL</label>
              <input name="locationUrl" value={form.locationUrl} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location Description</label>
              <textarea name="locationDescription" value={form.locationDescription} onChange={handleChange} />
            </div>
          </>
        )}

        <div className="editor-footer">
          <button
            className={`save-btn ${isDirty ? 'dirty' : ''}`}
            onClick={() => handleSave()}
            disabled={!isDirty}
          >
            {isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventEditorModal;
