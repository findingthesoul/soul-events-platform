import React from 'react';
import './StatusVisibilitySection.css';

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="slider round"></span>
  </label>
);

const StatusVisibilitySection = ({ eventData, onFieldChange }) => {
  return (
    <div className="form-group status-visibility">
      <h3>Status & Visibility</h3>

      <div className="toggle-row">
        <div className="toggle-label">
          <label>Published</label>
          <small>When enabled, the event is publicly visible on your event page.</small>
        </div>
        <ToggleSwitch
          checked={eventData.status === 'Published'}
          onChange={(e) => onFieldChange('status', e.target.checked ? 'Published' : 'Draft')}
        />
      </div>

      <div className="toggle-row">
        <div className="toggle-label">
          <label>Test Mode</label>
          <small>Use this for internal testing. Hidden from the public and search.</small>
        </div>
        <ToggleSwitch
          checked={eventData.testMode === true}
          onChange={(e) => onFieldChange('testMode', e.target.checked)}
        />
      </div>

      <div className="toggle-row">
        <div className="toggle-label">
          <label>Show in Calendar</label>
          <small>Controls whether this event appears in the public calendar view.</small>
        </div>
        <ToggleSwitch
          checked={eventData.calendarVisible === true}
          onChange={(e) => onFieldChange('calendarVisible', e.target.checked)}
        />
      </div>
    </div>
  );
};

export default StatusVisibilitySection;
