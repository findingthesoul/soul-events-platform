import React, { useState, useEffect, useRef } from 'react';
import './EventEditorModal.css';

const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;

const generateTimeOptions = (format) => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      if (format === '24') {
        options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      } else {
        const hour = h % 12 || 12;
        const suffix = h < 12 ? 'AM' : 'PM';
        options.push(`${hour}:${String(m).padStart(2, '0')} ${suffix}`);
      }
    }
  }
  return options;
};

const EventEditorModal = ({ event, vendorId, onClose, onSave }) => {
  const [form, setForm] = useState({
    id: '',
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    format: 'Online',
    zoomLink: '',
    location: '',
    locationUrl: '',
    locationDescription: '',
    startTime1: '',
    endTime1: '',
    startTime2: '',
    endTime2: '',
    timeFormat: '24',
  });

  const [isDirty, setIsDirty] = useState(false);
  const saveTimeout = useRef(null);
  const timeOptions = generateTimeOptions(form.timeFormat);

  useEffect(() => {
    if (event === null) {
      setForm({
        id: '',
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        format: 'Online',
        zoomLink: '',
        location: '',
        locationUrl: '',
        locationDescription: '',
        startTime1: '',
        endTime1: '',
        startTime2: '',
        endTime2: '',
        timeFormat: '24',
      });
      setIsDirty(false);
      return;
    }

    if (!event?.fields) return;

    if (event.id !== form.id) {
      const f = event.fields;
      setForm({
        id: event.id,
        title: f['Event Title'] || '',
        startDate: f['Start Date'] || '',
        endDate: f['End Date'] || '',
        description: f['Description'] || '',
        format: f['Format'] || 'Online',
        zoomLink: f['Zoom link'] || '',
        location: f['Location'] || '',
        locationUrl: f['Location URL'] || '',
        locationDescription: f['Location Description'] || '',
        startTime1: f['Start Time (Start Date)'] || '',
        endTime1: f['End Time (Start Date)'] || '',
        startTime2: f['Start Time (End Date)'] || '',
        endTime2: f['End Time (End Date)'] || '',
        timeFormat: f['Time Format'] || '24',
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
        'Start Time (Start Date)': data.startTime1,
        'End Time (Start Date)': data.endTime1,
        'Start Time (End Date)': data.startTime2,
        'End Time (End Date)': data.endTime2,
        'Time Format': data.timeFormat,
        Vendors: [vendorId],
      };

      Object.keys(updatedFields).forEach(
        (key) => (updatedFields[key] === '' || updatedFields[key] == null) && delete updatedFields[key]
      );

      const url = event === null
        ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events`
        : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${event.id}`;
      const method = event === null ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: updatedFields }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('Airtable error:', result);
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
      const confirm = window.confirm('You have unsaved changes. Save before closing?');
      if (confirm) {
        handleSave();
      }
    }
    onClose();
  };

  const toggleFormat = (value) => {
    handleChange({ target: { name: 'format', value } });
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

        <div className="time-row">
          <div className="time-col">
            <label>Start Time</label>
            <select name="startTime1" value={form.startTime1} onChange={handleChange}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="time-col">
            <label>End Time</label>
            <select name="endTime1" value={form.endTime1} onChange={handleChange}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
        </div>

        {/* Show second time row only if event spans multiple days */}
        {form.startDate && form.endDate && form.startDate !== form.endDate && (
          <div className="time-row">
            <div className="time-col">
              <label>Start Time (End Date)</label>
              <select name="startTime2" value={form.startTime2} onChange={handleChange}>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="time-col">
              <label>End Time (End Date)</label>
              <select name="endTime2" value={form.endTime2} onChange={handleChange}>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Time Format</label>
          <select name="timeFormat" value={form.timeFormat} onChange={handleChange}>
            <option value="24">24-hour</option>
            <option value="ampm">AM/PM</option>
          </select>
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