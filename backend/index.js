// Full backend with Airtable-powered `/events` route
const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

// Airtable config
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

// Root test
app.get('/', (req, res) => res.send('Backend is live'));

// Get events from Airtable
app.get('/events', async (req, res) => {
  try {
    const records = await base('Events').select({}).all();
    const events = records.map(record => ({
      id: record.id,
      title: record.fields['Event Title'],
      date: record.fields['Date'],
      location: record.fields['Location'],
      price: record.fields['Price (EUR)'],
      capacity: record.fields['Capacity'],
      vendor: record.fields['Vendor ID']
    }));
    res.json(events);
  } catch (err) {
    console.error('Airtable error:', err);
    res.status(500).json({ error: 'Failed to fetch events from Airtable' });
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));
