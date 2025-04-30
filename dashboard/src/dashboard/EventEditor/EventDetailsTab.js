import React, { useEffect } from 'react';

const EventDetailsTab = ({ eventData, facilitatorsList, onFieldChange }) => {
  const isMultiDayEvent = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    return new Date(startDate).toDateString() !== new Date(endDate).toDateString();
  };

  const generateTimeOptions = (format) => {
    const options = [];
    const is24h = format === '24h';

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        let hour = h;
        let suffix = '';

        if (!is24h) {
          suffix = hour >= 12 ? 'PM' : 'AM';
          hour = hour % 12 || 12;
        }

        const minutes = m.toString().padStart(2, '0');
        options.push(is24h ? `${h.toString().padStart(2, '0')}:${minutes}` : `${hour}:${minutes} ${suffix}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions(eventData.timeFormat || 'ampm');

  const filteredEndTimeOptions = (startTime, format) => {
    if (!startTime) return generateTimeOptions(format);

    const allTimes = generateTimeOptions(format);
    const startIndex = allTimes.indexOf(startTime);

    return startIndex >= 0 ? allTimes.slice(startIndex + 1) : allTimes;
  };

  useEffect(() => {
    if (eventData.startDate && eventData.endDate) {
      const start = new Date(eventData.startDate);
      const end = new Date(eventData.endDate);
      if (end < start) {
        onFieldChange('endDate', eventData.startDate);
      }
    }
  }, [eventData.startDate, eventData.endDate, onFieldChange]);

  return (
    <div className="event-details-tab scrollable-panel">
      <h3>Event Info</h3>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={eventData.name || ''}
          onChange={(e) => onFieldChange('name', e.target.value)}
        />
      </div>

      <h3>Timing</h3>

      <div className="form-row">
        <div className="form-group half-width">
          <label>Start Date</label>
          <input
            type="date"
            value={eventData.startDate || ''}
            onChange={(e) => onFieldChange('startDate', e.target.value)}
          />
        </div>
        <div className="form-group half-width">
          <label>End Date</label>
          <input
            type="date"
            value={eventData.endDate || ''}
            min={eventData.startDate || undefined}
            onChange={(e) => onFieldChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half-width">
          <label>Start Time</label>
          <select
            value={eventData.startTime || ''}
            onChange={(e) => onFieldChange('startTime', e.target.value)}
          >
            <option value="">Select Start Time</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="form-group half-width">
          <label>End Time</label>
          <select
            value={eventData.endTime || ''}
            onChange={(e) => onFieldChange('endTime', e.target.value)}
          >
            <option value="">Select End Time</option>
            {filteredEndTimeOptions(eventData.startTime, eventData.timeFormat || 'ampm').map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      {isMultiDayEvent(eventData.startDate, eventData.endDate) && (
        <div className="form-row">
          <div className="form-group half-width">
            <label>Start Time (End Date)</label>
            <select
              value={eventData.startTimeEndDate || ''}
              onChange={(e) => onFieldChange('startTimeEndDate', e.target.value)}
            >
              <option value="">Select Start Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="form-group half-width">
            <label>End Time (End Date)</label>
            <select
              value={eventData.endTimeEndDate || ''}
              onChange={(e) => onFieldChange('endTimeEndDate', e.target.value)}
            >
              <option value="">Select End Time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Time Format</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="switch">
            <input
              type="checkbox"
              checked={eventData.timeFormat === '24h'}
              onChange={(e) => onFieldChange('timeFormat', e.target.checked ? '24h' : 'ampm')}
            />
            <span className="slider round"></span>
          </label>
          <span style={{ marginLeft: '10px' }}>{eventData.timeFormat === '24h' ? '24 Hour' : 'AM/PM'}</span>
        </div>
      </div>

      <h3>Description</h3>
      <div className="form-group">
        <textarea
          value={eventData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          rows={5}
        />
      </div>

      <h3>Format</h3>
      <div className="form-group">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={eventData.format === 'In person' ? 'active' : ''}
            onClick={() => onFieldChange('format', 'In person')}
          >
            In person
          </button>
          <button
            type="button"
            className={eventData.format === 'Online' ? 'active' : ''}
            onClick={() => onFieldChange('format', 'Online')}
          >
            Online
          </button>
        </div>
      </div>

      {eventData.format === 'In person' && (
        <>
          <h3>Location</h3>
          <div className="form-group">
            <label>Location Address</label>
            <input
              type="text"
              value={eventData.location || ''}
              onChange={(e) => onFieldChange('location', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Location Description</label>
            <textarea
              value={eventData.locationDescription || ''}
              onChange={(e) => onFieldChange('locationDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Location URL (Google Maps)</label>
            <input
              type="text"
              value={eventData.locationUrl || ''}
              onChange={(e) => onFieldChange('locationUrl', e.target.value)}
            />
          </div>
        </>
      )}

      {eventData.format === 'Online' && (
        <>
          <h3>Online Link</h3>
          <div className="form-group">
            <label>Zoom Link</label>
            <input
              type="text"
              value={eventData.zoomLink || ''}
              onChange={(e) => onFieldChange('zoomLink', e.target.value)}
            />
          </div>
        </>
      )}

      <h3>Facilitators</h3>
      <div className="form-group">
        <select
          multiple
          value={eventData.facilitators || []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
            onFieldChange('facilitators', selected);
          }}
        >
          {facilitatorsList.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name || 'Unnamed'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EventDetailsTab;
