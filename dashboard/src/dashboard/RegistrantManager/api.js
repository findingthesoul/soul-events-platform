// --- Airtable Setup ---
// Suggested fields for the 'Registrants' table:
// - Name (Single line text)
// - Email (Email)
// - Organization (Single line text)
// - Event (Linked to Events table)
// - Ticket (Linked to Tickets table)
// - Status (Single select: invited, enrolled, confirmed, paid)
// - Checked In (Checkbox)
// - Certificate Issued (Checkbox)

// --- api.js ---
import axios from 'axios';

export async function createRegistrant(data) {
  try {
    const response = await axios.post('/api/registrants', data);
    return response.data;
  } catch (error) {
    console.error('Error creating registrant:', error);
    throw error;
  }
}

// --- Express API route (/api/registrants) ---
import express from 'express';
import Airtable from 'airtable';

const router = express.Router();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

router.post('/registrants', async (req, res) => {
  const {
    name,
    email,
    organization,
    eventId,
    ticketId,
    status = 'invited',
    checkedIn = false,
    certificateIssued = false
  } = req.body;

  if (!name || !email || !eventId || !ticketId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const createdRecord = await base('Registrants').create({
      Name: name,
      Email: email,
      Organization: organization || '',
      Event: [eventId],
      Ticket: [ticketId],
      Status: status,
      'Checked In': checkedIn,
      'Certificate Issued': certificateIssued
    });

    res.status(201).json({ id: createdRecord.id, fields: createdRecord.fields });
  } catch (err) {
    console.error('Failed to create registrant:', err);
    res.status(500).json({ error: 'Failed to create registrant' });
  }
});

export default router;