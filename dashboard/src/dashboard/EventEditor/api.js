const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

export const fetchEventById = async (eventId) => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${eventId}`,
      { headers }
    );
    const data = await response.json();
    return data.fields ? { ...data.fields } : null;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

export const saveEvent = async (eventId, eventData) => {
  const cleanFields = {
    "Event Title": eventData.name,
    "Start Date": eventData.startDate,
    "End Date": eventData.endDate,
    "Start Time (Start Date)": eventData.startTime,
    "End Time (Start Date)": eventData.endTime,
    "Start Time (End Date)": eventData.startTimeEndDate,
    "End Time (End Date)": eventData.endTimeEndDate,
    "Time Format": eventData.timeFormat,
    "Format": eventData.format,
    "Location": eventData.location,
    "Location Description": eventData.locationDescription,
    "Zoom/Teams Link": eventData.locationUrl,
    "Description": eventData.description,
    "Host ID": eventData.facilitators,
    "Calendar": eventData.calendar
  };

  try {
    console.log('Sending to Airtable:', cleanFields);
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${eventId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields: cleanFields }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Airtable PATCH failed:', result);
      throw new Error(result.error?.message || 'Failed to update event');
    }

    return result;
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${eventId}`, {
      method: 'DELETE',
      headers,
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const duplicateEvent = async (eventData, newTitle) => {
  try {
    const duplicatedData = {
      ...eventData,
      name: newTitle,
    };
    delete duplicatedData.id;

    await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields: duplicatedData }),
    });
  } catch (error) {
    console.error('Error duplicating event:', error);
    throw error;
  }
};

export const fetchFacilitators = async () => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Facilitators`,
      { headers }
    );
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching facilitators:', error);
    throw error;
  }
};

export const fetchCalendars = async () => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Calendars`,
      { headers }
    );
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw error;
  }
};