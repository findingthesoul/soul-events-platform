// Full backend with Airtable-powered `/events` route
const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

// Airtable config
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

// Root test
app.get('/', (req, res) => res.send('Backend is live'));

// Get events from Airtable
app.get('/events', async (req, res) => {
  try {
    const records = await base('Events').select({}).all();

    const events = records.map(record => {
      const f = record.fields;

      return {
        id: record.id,
        eventId: f['Event ID'],
        title: f['Event Title'] || '',
        date: f['Date'] || '',
        location: f['Location'] || '',
        price: f['Price (EUR)'] || 0,
        vendor: f['Vendors'] ? f['Vendors'][0] : null
      };
    });

    res.json(events);
  } catch (err) {
    console.error('Airtable error:', err);
    res.status(500).json({ error: 'Failed to fetch events from Airtable', detail: err.message });
  }
});

app.post('/events/create', async (req, res) => {
  try {
    const { title, date, location, price, capacity, vendorId } = req.body;

    const newRecord = await base('Events').create({
      "Event Title": title,
      "Date": date,
      "Location": location,
      "Price (EUR)": price,
      "Capacity": capacity,
      "Vendors": [vendorId]
    });

    res.json({ message: 'Event created successfully', recordId: newRecord.id });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event', detail: err.message });
  }
});

app.listen(3000, () => console.log('Backend running on port 3000'));
