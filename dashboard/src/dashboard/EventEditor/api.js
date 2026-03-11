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
    if (!data.fields) return null;
    return {
      ...data.fields,
      certificate: data.fields['Certificate'] || 'none',
    };
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
    "Certificate": eventData.certificate || 'none',
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

export const saveTickets = async (tickets = [], eventId) => {
  const updates = [];
  const creates = [];

  tickets.forEach((t, index) => {
    const fields = {
      "Ticket Name": t.name || t["Ticket Name"] || '',
      "Currency": t.currency || '',
      "Type": t.type || 'FREE',
      "Price": parseFloat(t.price || t.amount || 0),
      "Limit": t.limit !== undefined && t.limit !== '' ? Number(t.limit) : null,
      "Until Date": t.untilDate || null,
      "Sort Order": index + 1,
      "Event ID": [eventId]
    };

    if (t.id) {
      updates.push({ id: t.id, fields });
    } else {
      creates.push({ fields });
    }
  });

  if (updates.length) {
    console.log('🔄 Updating tickets in Airtable:', updates);
    const patchRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ records: updates }),
      }
    );
    const patchData = await patchRes.json();
    if (!patchRes.ok) {
      console.error('❌ Airtable error on PATCH:', patchData);
      throw new Error(JSON.stringify(patchData));
    }
  }

  if (creates.length) {
    console.log('➕ Creating tickets in Airtable:', creates);
    const postRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ records: creates }),
      }
    );
    const postData = await postRes.json();
    if (!postRes.ok) {
      console.error('❌ Airtable error on POST:', postData);
      throw new Error(JSON.stringify(postData));
    }
    return postData.records;
  }
};

export const createTicket = async (ticket, eventId, sortOrder = 1) => {
  const fields = {
    "Ticket Name": ticket.name || '',
    "Currency": ticket.currency || '',
    "Type": ticket.type || 'FREE',
    "Price": parseFloat(ticket.price || 0),
    "Limit": ticket.limit !== undefined && ticket.limit !== '' ? Number(ticket.limit) : null,
    "Until Date": ticket.untilDate || null,
    "Sort Order": sortOrder,
    "Event ID": [eventId],
  };

  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ records: [{ fields }] }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Error creating ticket:', data);
    throw new Error(data.error?.message || 'Failed to create ticket');
  }

  return data.records?.[0];
};

export const saveCoupons = async (coupons = [], eventId) => {
  if (!coupons.length) return;

  const formatFields = (c) => ({
    "Coupon Name": c.name || '',
    "Coupon Code": c.code || '',
    "Coupon Type": c.type || 'FREE',
    "Amount": c.amount !== undefined ? parseInt(c.amount, 10) : 1,
    ...(c.type === 'PERCENTAGE' ? { "Discount Percentage": parseFloat(c.discount || 0) } : {}),
    ...(c.type === 'AMOUNT' ? { "Discount Amount": parseFloat(c.discount || 0) } : {}),
    "Linked Ticket": c.linkedTicket ? [c.linkedTicket] : [],
    "Event ID": [eventId],
  });

  const updates = coupons.filter(c => c.id).map((c) => ({
    id: c.id,
    fields: formatFields(c),
  }));

  const creates = coupons.filter(c => !c.id).map((c) => ({
    fields: formatFields(c),
  }));

  try {
    if (updates.length) {
      const updateRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ records: updates }),
        }
      );
      const updateResult = await updateRes.json();
      if (!updateRes.ok) throw new Error(JSON.stringify(updateResult));
    }

    if (creates.length) {
      const createRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ records: creates }),
        }
      );
      const createResult = await createRes.json();
      if (!createRes.ok) throw new Error(JSON.stringify(createResult));
      return createResult.records;
    }
  } catch (err) {
    console.error('❌ Error saving coupons:', err);
    throw err;
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

  console.log('🧾 Airtable coupons data:', data); // Add this to verify structure

  return data.records.map(rec => ({
    id: rec.id,
    name: rec.fields['Coupon Name'],
    code: rec.fields['Coupon Code'],
    type: rec.fields['Coupon Type'],
    amount: rec.fields['Amount'],
    linkedTicket: rec.fields['Linked Ticket']?.[0] || '',
  }));
};

export const deleteTicket = async (ticketId) => {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets/${ticketId}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    if (!res.ok) throw new Error('Failed to delete ticket');
  } catch (err) {
    console.error('❌ Error deleting ticket:', err);
    throw err;
  }
};

export const deleteCoupon = async (couponId) => {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons/${couponId}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    if (!res.ok) throw new Error('Failed to delete coupon');
  } catch (err) {
    console.error('❌ Error deleting coupon:', err);
    throw err;
  }
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

// ─── Registrations ────────────────────────────────────────────────────────────

const mapRegistration = (rec) => ({
  id: rec.id,
  name: rec.fields['Name'] || '',
  email: rec.fields['Email'] || '',
  organisation: rec.fields['Organisation'] || '',
  checkedIn: rec.fields['Checked In'] || false,
  certificateIssued: rec.fields['Certificate Issued'] || false,
  status: rec.fields['Status'] || 'enrolled',
  eventIds: rec.fields['Events ID'] || [],
  vendorIds: rec.fields['Vendors ID'] || [],
  password: rec.fields['Password'] || '',
});

export const fetchRegistrationsByEvent = async (eventId) => {
  if (!eventId) return [];
  const formula = `FIND("${eventId}", ARRAYJOIN({Events ID}))`;
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Registrations?filterByFormula=${encodeURIComponent(formula)}`,
      { headers }
    );
    const data = await response.json();
    return (data.records || []).map(mapRegistration);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
};

export const fetchRegistrationsByEmail = async (email) => {
  if (!email) return [];
  const formula = `{Email}="${email}"`;
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Registrations?filterByFormula=${encodeURIComponent(formula)}`,
      { headers }
    );
    const data = await response.json();
    return (data.records || []).map(mapRegistration);
  } catch (error) {
    console.error('Error fetching registrations by email:', error);
    return [];
  }
};

export const createRegistration = async (data, eventId, vendorId) => {
  const fields = {
    'Name': data.name,
    'Email': data.email,
    'Organisation': data.organisation || '',
    'Status': data.status || 'enrolled',
    'Events ID': [eventId],
    'Vendors ID': vendorId ? [vendorId] : [],
  };
  if (data.password) fields['Password'] = data.password;

  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Registrations`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields }),
    }
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Failed to create registration');
  return mapRegistration(result);
};

export const updateRegistration = async (id, data) => {
  const fields = {};
  if (data.name !== undefined) fields['Name'] = data.name;
  if (data.email !== undefined) fields['Email'] = data.email;
  if (data.organisation !== undefined) fields['Organisation'] = data.organisation;
  if (data.checkedIn !== undefined) fields['Checked In'] = data.checkedIn;
  if (data.certificateIssued !== undefined) fields['Certificate Issued'] = data.certificateIssued;
  if (data.status !== undefined) fields['Status'] = data.status;
  if (data.password !== undefined) fields['Password'] = data.password;

  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Registrations/${id}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields }),
    }
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Failed to update registration');
  return mapRegistration(result);
};

export const deleteRegistration = async (id) => {
  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Registrations/${id}`,
    { method: 'DELETE', headers }
  );
  if (!response.ok) throw new Error('Failed to delete registration');
};

export const loginGuest = async (email, password) => {
  const registrations = await fetchRegistrationsByEmail(email);
  if (!registrations.length) throw new Error('No account found with this email');
  const match = registrations.find((r) => r.password === password);
  if (!match) throw new Error('Incorrect password');
  // Gather unique event IDs across all registrations for this guest
  const allEventIds = [...new Set(registrations.flatMap((r) => r.eventIds))];
  return { email, registrations, allEventIds };
};

export const fetchEventsByIds = async (ids = []) => {
  if (!ids.length) return [];
  const formula = `OR(${ids.map((id) => `RECORD_ID()='${id}'`).join(',')})`;
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events?filterByFormula=${encodeURIComponent(formula)}`,
      { headers }
    );
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching events by ids:', error);
    return [];
  }
};