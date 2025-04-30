import React from 'react';

const MoreSettingsTab = ({ eventData, onFieldChange, calendarsList, onDelete, onDuplicate }) => {
  return (
    <div className="more-settings-tab">
      <h3>More Settings</h3>

      <div className="form-group">
        <label htmlFor="calendar">Calendar</label>
        <select
          id="calendar"
          value={eventData.calendar || ''}
          onChange={(e) => onFieldChange('calendar', e.target.value)}
        >
          <option value="">Select a calendar</option>
          {calendarsList.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.fields?.Name || 'Unnamed'}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <button className="delete-btn" onClick={onDelete}>
          Delete Event
        </button>
        <button className="duplicate-btn" onClick={onDuplicate}>
          Duplicate Event
        </button>
      </div>
    </div>
  );
};

export default MoreSettingsTab;