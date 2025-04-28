import React from 'react';

const EventDetailsTab = ({ eventData, facilitatorsList, calendarsList, onFieldChange }) => {
  return (
    <div className="event-details-tab">
      <div className="form-group">
        <label>Event Name</label>
        <input
          type="text"
          value={eventData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Start Date</label>
        <input
          type="datetime-local"
          value={eventData.startDate}
          onChange={(e) => onFieldChange('startDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>End Date</label>
        <input
          type="datetime-local"
          value={eventData.endDate}
          onChange={(e) => onFieldChange('endDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={eventData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          value={eventData.status}
          onChange={(e) => onFieldChange('status', e.target.value)}
        >
          <option value="Draft">Draft</option>
          <option value="Public">Public</option>
        </select>
      </div>

      <div className="form-group">
        <label>Facilitator</label>
        <select
          value={eventData.facilitators[0] || ''}
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