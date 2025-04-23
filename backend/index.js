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
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

app.get('/events', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const vendorId = decoded.vendorId;

    const records = await base('Events').select({
      filterByFormula: `{Vendors} = '${vendorId}'`
    }).all();

    const events = records.map(record => {
      const f = record.fields;
      return {
        id: record.id,
        eventId: f['Event ID'],
        title: f['Event Title'] || '',
        date: f['Date'] || '',
        location: f['Location'] || '',
        price: f['Price (EUR)'] || 0,
        capacity: f['Capacity'] || 0,
        vendor: f['Vendors'] ? f['Vendors'][0] : null
      };
    });

    res.json(events);
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized', detail: err.message });
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
res.status(500).json({ 
  error: 'Failed to create event', 
  detail: err.message, 
  airtableError: err?.response?.data 
});
  }
});



// Temporary secret key (store in .env in the future)

app.post('/vendors/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const records = await base('Vendors').select({
      filterByFormula: `{Contact Email} = '${email}'`
    }).firstPage();

    if (records.length === 0) {
      return res.status(401).json({ error: 'Vendor not found' });
    }

    const vendor = records[0];
    const storedPassword = vendor.fields['Password'];

    if (storedPassword !== password) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ vendorId: vendor.id }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token, vendorId: vendor.id, vendorName: vendor.fields['Vendor Name'] });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

app.listen(3001, () => console.log('Backend running on port 3001'));


app.post('/vendors/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const records = await base('Vendors').select({
      filterByFormula: `{Contact Email} = '${email}'`
    }).firstPage();

    if (records.length === 0) {
      return res.status(401).json({ error: 'Vendor not found' });
    }

    const vendor = records[0];
    const storedPassword = vendor.fields['Password'];

    if (storedPassword !== password) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { vendorId: vendor.id, email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      vendorId: vendor.id,
      vendorName: vendor.fields['Name'],
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

app.patch('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, date, location, price, capacity } = req.body;

  try {
    await base('Events').update(id, {
      "Event Title": title,
      "Date": date,
      "Location": location,
      "Price (EUR)": price,
      "Capacity": capacity
    });

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update event', detail: err.message });
  }
});