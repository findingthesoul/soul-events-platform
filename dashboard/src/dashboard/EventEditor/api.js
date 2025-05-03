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
  const rawFields = {
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
    "Location URL": eventData.locationUrl || '',
    "Zoom link": eventData.zoomLink || '',
    "Description": eventData.description,
    "Facilitation Language": eventData.facilitationLanguage || 'English',
    "Page Language": eventData.frontendLanguage || 'ENG',
    "Time Zone": eventData.timeZone || 'Europe/Amsterdam',
    "Calendar Visible": !!eventData.calendarVisible,
    "Test Mode": !!eventData.testMode,
    "Published": !!(eventData.status === 'Published'),
    "Tags": eventData.tags || '',
    "Slug": eventData.slug?.trim() || '',
    "Host ID": Array.isArray(eventData.facilitators)
      ? eventData.facilitators.map((f) => (typeof f === 'string' ? f : f.id)).filter(Boolean)
      : [],
    "Calendar ID": Array.isArray(eventData.calendar)
      ? eventData.calendar.map((c) => (typeof c === 'string' ? c : c.id)).filter(Boolean)
      : [],
    "Ticket ID": Array.isArray(eventData.tickets)
      ? eventData.tickets.map(t => t.id).filter(id => typeof id === 'string' && id.trim() !== '')
      : [],
    "Coupon ID": Array.isArray(eventData.coupons)
      ? eventData.coupons.map(c => c.id).filter(id => typeof id === 'string' && id.trim() !== '')
      : [],
  };

  const cleanFields = Object.fromEntries(
    Object.entries(rawFields).filter(([_, v]) => v !== undefined && v !== "")
  );

  console.log('Sending to Airtable:', cleanFields);

  try {
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

export const saveTickets = async (tickets = []) => {
  if (!tickets.length) return;

  const createOrUpdate = tickets.map((t, index) => {
    const fields = {
      "Ticket Name": t.name || t["Ticket Name"] || '',
      "Currency": t.currency || '',
      "Type": t.type || 'FREE',
      "Price": parseFloat(t.price || t.amount || 0),
      "Limit": t.limit || null,
      "Until Date": t.untilDate || '',
      "Sort Order": index + 1,
    };
    return t.id ? { id: t.id, fields } : { fields };
  });

  console.log("📦 Full ticket payload to Airtable:", JSON.stringify({ records: createOrUpdate }, null, 2));

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ records: createOrUpdate }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Airtable error response:', data);
      throw new Error(data.error?.message || 'Failed to save tickets');
    }

    return data;
  } catch (error) {
    console.error('❌ Error saving tickets:', error);
    throw error;
  }
};

export const saveCoupons = async (coupons = []) => {
  if (!coupons.length) return;
  const createOrUpdate = coupons.map((c) => {
    const fields = {
      "Coupon Code": c.code,
      "Type": c.type || 'FREE',
      "Amount": c.amount || '',
      "Currency": c.currency || '',
      "Linked Ticket": c.linkedTicket || '',
    };
    return c.id ? { id: c.id, fields } : { fields };
  });

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ records: createOrUpdate }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving coupons:', error);
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
    return data.records.map(rec => ({ id: rec.id, name: rec.fields['Name'] || 'Unnamed' }));
  } catch (error) {
    console.error('Error fetching facilitators:', error);
    return [];
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

export const fetchTicketsByIds = async (ids = []) => {
  if (!ids.length) return [];
  const formula = `OR(${ids.map(id => `RECORD_ID()='${id}'`).join(',')})`;
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets?filterByFormula=${encodeURIComponent(formula)}`,
    { headers }
  );
  const data = await response.json();
  return data.records
    .map(rec => ({ id: rec.id, ...rec.fields }))
    .sort((a, b) => (a['Sort Order'] || 0) - (b['Sort Order'] || 0));
};

export const fetchCouponsByIds = async (ids = []) => {
  if (!ids.length) return [];
  const formula = `OR(${ids.map(id => `RECORD_ID()='${id}'`).join(',')})`;
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons?filterByFormula=${encodeURIComponent(formula)}`,
    { headers }
  );
  const data = await response.json();
  return data.records.map(rec => ({ id: rec.id, ...rec.fields }));
};

export const updateTicketOrderInAirtable = async (tickets) => {
  const updates = tickets.map((ticket, index) => ({
    id: ticket.id,
    fields: { 'Sort Order': index + 1 },
  }));

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: updates }),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error updating ticket sort order:', error);
    throw error;
  }
};
