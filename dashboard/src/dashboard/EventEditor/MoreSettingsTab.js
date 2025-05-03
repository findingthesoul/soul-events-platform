import React, { useEffect, useState } from 'react';
import Select from 'react-select';

const MoreSettingsTab = ({ eventData, onFieldChange, calendarsList, onDelete, onDuplicate }) => {
  const calendarOptions = calendarsList.map(c => ({
    label: c.fields?.['Calendar Name'] || 'Unnamed',
    value: c.id,
  }));

  const selectedCalendars = (eventData.calendar || []).map((cal) => {
    if (typeof cal === 'string') {
      const match = calendarsList.find(c => c.id === cal);
      return {
        label: match?.fields?.['Calendar Name'] || 'Unnamed',
        value: cal,
      };
    }
    return {
      label: cal.fields?.['Calendar Name'] || 'Unnamed',
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

      <h3>Page Language</h3>
      <div className="form-group">
        <select
          value={eventData.frontendLanguage || 'ENG'}
          onChange={(e) => onFieldChange('frontendLanguage', e.target.value)}
        >
          <option value="ENG">English</option>
          <option value="ES">Spanish</option>
          <option value="DE">German</option>
          <option value="NL">Dutch</option>
        </select>
      </div>

      <h3>Facilitation Language</h3>
      <div className="form-group">
        <select
          value={eventData.facilitationLanguage || 'English'}
          onChange={(e) => onFieldChange('facilitationLanguage', e.target.value)}
        >
          <option value="English">English</option>
          <option value="Español">Español</option>
          <option value="Nederlands">Nederlands</option>
          <option value="Deutsch">Deutsch</option>
        </select>
      </div>

      <h3>Time Zone</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="e.g. Europe/Amsterdam"
          value={eventData.timeZone || ''}
          onChange={(e) => onFieldChange('timeZone', e.target.value)}
        />
      </div>

      <h3>Calendar Visibility</h3>
      <div className="form-group">
        <label className="switch">
          <input
            type="checkbox"
            checked={eventData.calendarVisibility || false}
            onChange={(e) => onFieldChange('calendarVisibility', e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <h3>Test Mode</h3>
      <div className="form-group">
        <label className="switch">
          <input
            type="checkbox"
            checked={eventData.testMode || false}
            onChange={(e) => onFieldChange('testMode', e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <h3>Tags</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="Comma-separated tags"
          value={eventData.tags || ''}
          onChange={(e) => onFieldChange('tags', e.target.value)}
        />
      </div>

      <h3>Slug</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="friendly-url-path"
          value={eventData.slug || ''}
          onChange={(e) => onFieldChange('slug', e.target.value)}
        />
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
