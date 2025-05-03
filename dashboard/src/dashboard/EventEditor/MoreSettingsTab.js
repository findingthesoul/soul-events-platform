import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import StatusVisibilitySection from './StatusVisibilitySection';

const MoreSettingsTab = ({ eventData, onFieldChange, calendarsList, onDelete, onDuplicate }) => {
  const calendarOptions = calendarsList.map(c => ({
    label: c.fields?.['Calendar Name'] || 'Unnamed',
    value: c.id,
  }));

  const [localCalendars, setLocalCalendars] = useState(eventData.calendar || []);

  useEffect(() => {
    setLocalCalendars(eventData.calendar || []);
  }, [eventData.calendar]);

  const handleCalendarChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(opt => opt.value);
    setLocalCalendars(selectedValues);
    onFieldChange('calendar', selectedValues);
  };

  return (
    <>
      <StatusVisibilitySection eventData={eventData} onFieldChange={onFieldChange} />

      <h3>Calendars</h3>
      <div className="form-group">
        <Select
          isMulti
          placeholder="Select calendar(s)"
          options={calendarOptions}
          value={(eventData.calendar || []).map((cal) => {
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
          })}
          onChange={handleCalendarChange}
        />
      </div>

      <h3>Language Settings</h3>
      <div className="form-group">
        <label>Facilitation Language</label>
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

      <div className="form-group">
        <label>Page Language</label>
        <select
          value={eventData.frontendLanguage || 'ENG'}
          onChange={(e) => onFieldChange('frontendLanguage', e.target.value)}
        >
          <option value="ENG">English</option>
          <option value="ES">Spanish</option>
          <option value="NL">Dutch</option>
          <option value="DE">German</option>
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
