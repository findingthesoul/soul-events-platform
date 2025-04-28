import React from 'react';

const MoreSettingsTab = ({ onDelete, onDuplicate }) => {
  return (
    <div className="more-settings-tab">
      <h3>Danger Zone</h3>
      
      <div className="danger-section">
        <p><strong>Delete this Event</strong></p>
        <button className="danger-button" onClick={onDelete}>
          Delete Event
        </button>
      </div>

      <div className="duplicate-section">
        <p><strong>Duplicate this Event</strong></p>
        <button onClick={onDuplicate}>
          Duplicate Event
        </button>
      </div>
    </div>
  );
};

export default MoreSettingsTab;