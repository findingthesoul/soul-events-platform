import React from 'react';

const EventDetailsTab = ({ eventData, facilitatorsList, calendarsList, onFieldChange }) => {
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

  return (
    <div className="event-details-tab">
      {/* Title */}
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          value={eventData.name || ''}
          onChange={(e) => onFieldChange('name', e.target.value)}
        />
      </div>

      {/* Start Date */}
      <div className="form-group">
        <label>Start Date</label>
        <input
          type="date"
          value={eventData.startDate || ''}
          onChange={(e) => onFieldChange('startDate', e.target.value)}
        />
      </div>

      {/* Start Time (Start Date) */}
      <div className="form-group">
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

      {/* End Time (Start Date) */}
      <div className="form-group">
        <label>End Time</label>
        <select
          value={eventData.endTime || ''}
          onChange={(e) => onFieldChange('endTime', e.target.value)}
        >
          <option value="">Select End Time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </div>

      {/* End Date */}
      <div className="form-group">
        <label>End Date</label>
        <input
          type="date"
          value={eventData.endDate || ''}
          onChange={(e) => onFieldChange('endDate', e.target.value)}
        />
      </div>

      {/* Multi-day times */}
      {isMultiDayEvent(eventData.startDate, eventData.endDate) && (
        <>
          <div className="form-group">
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

          <div className="form-group">
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
        </>
      )}

      {/* Time Format Toggle */}
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

      {/* Description */}
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={eventData.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          rows={5}
        />
      </div>

      {/* Facilitator */}
      <div className="form-group">
        <label>Facilitator</label>
        <select
          value={eventData.facilitators?.[0] || ''}
          onChange={(e) => onFieldChange('facilitators', [e.target.value])}
        >
          <option value="">Select Facilitator</option>
          {facilitatorsList.map((facilitator) => (
            <option key={facilitator.id} value={facilitator.id}>
              {facilitator.fields?.name || 'Unnamed'}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar */}
      <div className="form-group">
        <label>Calendar</label>
        <select
          value={eventData.calendar || ''}
          onChange={(e) => onFieldChange('calendar', e.target.value)}
        >
          <option value="">Select Calendar</option>
          {calendarsList.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.fields?.name || 'Unnamed'}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EventDetailsTab;