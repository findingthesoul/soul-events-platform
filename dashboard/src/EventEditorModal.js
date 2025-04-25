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

const compareTimes = (t1, t2) => {
  const parse = (time) => {
    if (!time) return 0;
    let [hours, minutes] = time.split(':');
    if (minutes.includes('AM') || minutes.includes('PM')) {
      const [m, period] = minutes.split(' ');
      minutes = m;
      if (period === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
      if (period === 'AM' && hours === '12') hours = 0;
    }
    return parseInt(hours) * 60 + parseInt(minutes);
  };
  return parse(t1) - parse(t2);
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
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
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
    if (form[name] !== value) {
      const updated = { ...form, [name]: value };
      setForm(updated);
      setIsDirty(true);

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        handleSave(updated);
      }, 1200);
    }
  };

  const handleSave = async (data = form) => {
    try {
      const newErrors = {};

      if (!data.title || data.title.trim() === '') {
        newErrors.title = 'Title is required';
      }
      if (!data.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!data.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (data.startDate > data.endDate) {
        newErrors.startDate = 'Start date cannot be after end date';
        newErrors.endDate = 'End date cannot be before start date';
      }
      if (data.startTime1 && data.endTime1 && compareTimes(data.startTime1, data.endTime1) > 0) {
        newErrors.startTime1 = 'Start time must be before end time';
      }
      if (data.startDate !== data.endDate && data.startTime2 && data.endTime2) {
        if (compareTimes(data.startTime2, data.endTime2) > 0) {
          newErrors.startTime2 = 'Start time must be before end time on End Date';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        alert('Please correct the highlighted fields.');
        return;
      }

      setErrors({}); // Clear previous errors

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
        Vendors: vendorId ? [vendorId] : [],
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
        console.error('❌ Airtable rejected the request:', result);
        alert(result?.error?.message || 'Failed to save to Airtable.');
        throw new Error('Failed to save');
      }

      if (onSave) onSave();
      setIsDirty(false);
      setSuccessMessage('Event saved successfully! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);

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
        {successMessage && (
          <div className="success-toast">{successMessage}</div>
        )}

        <div className="editor-header">
          <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className={errors.title ? 'input-error' : ''}
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className={errors.startDate ? 'input-error' : ''}
          />
        </div>

        <div className="time-row">
          <div className="time-col">
            <label>Start Time</label>
            <select
              name="startTime1"
              value={form.startTime1}
              onChange={handleChange}
              className={errors.startTime1 ? 'input-error' : ''}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="time-col">
            <label>End Time</label>
            <select
              name="endTime1"
              value={form.endTime1}
              onChange={handleChange}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className={errors.endDate ? 'input-error' : ''}
          />
        </div>

        {form.startDate && form.endDate && form.startDate !== form.endDate && (
          <div className="time-row">
            <div className="time-col">
              <label>Start Time (End Date)</label>
              <select
                name="startTime2"
                value={form.startTime2}
                onChange={handleChange}
                className={errors.startTime2 ? 'input-error' : ''}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="time-col">
              <label>End Time (End Date)</label>
              <select
                name="endTime2"
                value={form.endTime2}
                onChange={handleChange}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Rest of the form for format, zoom link, location, etc stays the same */}

      </div>
    </div>
  );
};

export default EventEditorModal;