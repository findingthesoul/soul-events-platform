import React from 'react';
import Select from 'react-select';

const MoreSettingsTab = ({ eventData, onFieldChange, calendarsList, onDelete, onDuplicate }) => {
  const calendarOptions = calendarsList.map((c) => ({
    value: c.id,
    label: c.fields?.Name || 'Unnamed'
  }));

  return (
    <div className="more-settings-tab">
      <h3>Calendars</h3>
      <div className="form-group">
        <Select
          isMulti
          placeholder="Select calendar(s)"
          options={calendarOptions}
          value={calendarOptions.filter(opt => (eventData.calendars || []).includes(opt.value))}
          onChange={(selectedOptions) =>
            onFieldChange('calendars', selectedOptions.map(opt => opt.value))
          }
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
    </div>
  );
};

export default MoreSettingsTab;
