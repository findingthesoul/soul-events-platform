import React, { useEffect, useState } from 'react';
import Select from 'react-select';

const MoreSettingsTab = ({ eventData, onFieldChange, calendarsList, onDelete, onDuplicate }) => {
  const calendarOptions = calendarsList.map(c => ({
    label: c.fields?.Name || 'Unnamed',
    value: c.id,
  }));

  const selectedCalendars = (eventData.calendar || []).map((cal) => {
    if (typeof cal === 'string') {
      const match = calendarOptions.find(opt => opt.value === cal);
      return match || { label: cal, value: cal };
    }
    return {
      label: cal.fields?.Name || 'Unnamed',
      value: cal.id,
    };
  });

  const handleCalendarChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(opt => opt.value);
    onFieldChange('calendar', selectedValues);
  };

  return (
    <>
      <h3>Status</h3>
      <div className="form-group">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={eventData.status === 'Draft' ? 'active' : ''}
            onClick={() => onFieldChange('status', 'Draft')}
          >
            Draft
          </button>
          <button
            type="button"
            className={eventData.status === 'Published' ? 'active' : ''}
            onClick={() => onFieldChange('status', 'Published')}
          >
            Published
          </button>
        </div>
      </div>

      <h3>Calendars</h3>
      <div className="form-group">
        <Select
          isMulti
          placeholder="Select calendar(s)"
          options={calendarOptions}
          value={selectedCalendars}
          onChange={handleCalendarChange}
        />
      </div>

      <h3>Front-End Language</h3>
      <div className="form-group">
        <label>Select Language</label>
        <select
          value={eventData.frontendLanguage || ''}
          onChange={(e) => onFieldChange('frontendLanguage', e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="ENG">English</option>
          <option value="ES">Spanish</option>
          <option value="DE">German</option>
          <option value="NL">Dutch</option>
        </select>
      </div>

      <h3>Danger Zone</h3>
      <div className="danger-zone">
        <button className="delete-btn" onClick={onDelete}>
          Delete Event
        </button>
        <button className="duplicate-btn" onClick={onDuplicate}>
          Duplicate Event
        </button>
      </div>
    </>
  );
};

export default MoreSettingsTab;