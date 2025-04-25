import React, { useState, useEffect, useRef } from 'react';
import './EventEditorModal.css';

// Airtable Config
const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;

// Helpers
const generateTimeOptions = (format) => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      if (format === '24') {
        options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      } else {
        const hour = h % 12 || 12;
        const suffix = h < 12 ? 'AM' : 'PM';
        options.push(`${hour}:${String(m).padStart(2, '0')} ${suffix}`);
      }
    }
  }
  return options;
};

const compareTimes = (t1, t2) => {
  const parse = (time) => {
    if (!time) return 0;
    let [hours, minutes] = time.split(':');
    if (minutes.includes('AM') || minutes.includes('PM')) {
      const [m, period] = minutes.split(' ');
      minutes = m;
      if (period === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
      if (period === 'AM' && hours === '12') hours = 0;
    }
    return parseInt(hours) * 60 + parseInt(minutes);
  };
  return parse(t1) - parse(t2);
};

// Ticket Popup
const TicketPopup = ({ ticket, onSave, onClose, onDelete }) => {
  const [form, setForm] = useState(ticket || {
    type: 'FREE',
    name: '',
    price: '',
    currency: 'EUR',
    limit: '',
    untilDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = () => {
    onSave({ ...form, id: ticket?.id || crypto.randomUUID() });
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>{ticket ? 'Edit Ticket' : 'Add Ticket'}</h3>

        <label>Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="FREE">FREE</option>
          <option value="PAID">PAID</option>
        </select>

        <label>Ticket Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        {form.type === 'PAID' && (
          <>
            <label>Price</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} />
          </>
        )}

        <label>Currency</label>
        <select name="currency" value={form.currency} onChange={handleChange}>
          <option>EUR</option>
          <option>USD</option>
          <option>GBP</option>
        </select>

        <label>Limit</label>
        <input type="number" name="limit" value={form.limit} onChange={handleChange} />

        <label>Until Date</label>
        <input type="date" name="untilDate" value={form.untilDate} onChange={handleChange} />

        <div className="popup-footer">
          <button onClick={handleSave}>Save</button>
          {ticket && <button className="delete-btn" onClick={() => { onDelete(ticket.id); onClose(); }}>Delete</button>}
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Coupon Popup
const CouponPopup = ({ coupon, tickets, onSave, onClose, onDelete }) => {
  const [form, setForm] = useState(coupon || {
    ticketId: '',
    code: generateCouponCode(),
    name: '',
    type: 'FREE',
    amount: '',
    percentage: '',
  });

  function generateCouponCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = () => {
    onSave({ ...form, id: coupon?.id || crypto.randomUUID() });
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>{coupon ? 'Edit Coupon' : 'Add Coupon'}</h3>

        <label>Ticket</label>
        <select name="ticketId" value={form.ticketId} onChange={handleChange}>
          <option value="">Select Ticket</option>
          {tickets.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label>Coupon Code</label>
        <input name="code" value={form.code} disabled />

        <label>Coupon Name</label>
        <input name="name" value={form.name} onChange={handleChange} />

        <label>Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="FREE">FREE</option>
          <option value="AMOUNT">AMOUNT</option>
          <option value="PERCENTAGE">PERCENTAGE</option>
        </select>

        {form.type === 'AMOUNT' && (
          <>
            <label>Amount</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} />
          </>
        )}

        {form.type === 'PERCENTAGE' && (
          <>
            <label>Percentage</label>
            <input type="number" name="percentage" value={form.percentage} onChange={handleChange} />
          </>
        )}

        <div className="popup-footer">
          <button onClick={handleSave}>Save</button>
          {coupon && <button className="delete-btn" onClick={() => { onDelete(coupon.id); onClose(); }}>Delete</button>}
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};const EventEditorModal = ({ event, vendorId, onClose, onSave }) => {
  const [form, setForm] = useState({
    id: '',
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    format: 'Online',
    zoomLink: '',
    location: '',
    locationUrl: '',
    locationDescription: '',
    startTime1: '',
    endTime1: '',
    startTime2: '',
    endTime2: '',
    timeFormat: '24',
  });

  const [tickets, setTickets] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [showTicketPopup, setShowTicketPopup] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const saveTimeout = useRef(null);
  const timeOptions = generateTimeOptions(form.timeFormat);

  const resetForm = () => {
    setForm({
      id: '',
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      format: 'Online',
      zoomLink: '',
      location: '',
      locationUrl: '',
      locationDescription: '',
      startTime1: '',
      endTime1: '',
      startTime2: '',
      endTime2: '',
      timeFormat: '24',
    });
    setTickets([]);
    setCoupons([]);
    setIsDirty(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      // Autosave would happen here if needed
    }, 1200);
  };

  const handleClose = () => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Save before closing?');
      if (!confirm) return;
    }
    onClose();
  };

  const handleSave = async (data = form) => {
    try {
      const updatedFields = {
        'Event Title': data.title,
        'Start Date': data.startDate,
        'End Date': data.endDate,
        'Description': data.description,
        'Format': data.format,
        'Zoom link': data.format === 'Online' ? data.zoomLink : '',
        'Location': data.format === 'In-person' ? data.location : '',
        'Location URL': data.format === 'In-person' ? data.locationUrl : '',
        'Location Description': data.format === 'In-person' ? data.locationDescription : '',
        'Start Time (Start Date)': data.startTime1,
        'End Time (Start Date)': data.endTime1,
        'Start Time (End Date)': data.startTime2,
        'End Time (End Date)': data.endTime2,
        'Time Format': data.timeFormat,
        Vendors: vendorId ? [vendorId] : [],
      };

      Object.keys(updatedFields).forEach(
        (key) => (updatedFields[key] === '' || updatedFields[key] == null) && delete updatedFields[key]
      );

      const url = event === null
        ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events`
        : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${event.id}`;
      const method = event === null ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: updatedFields }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('❌ Airtable Event Error:', result);
        alert('Failed to save event');
        throw new Error('Failed');
      }

      const eventId = result.id;

      await saveTicketsToAirtable(event.id);
await saveCouponsToAirtable(); // no eventId needed

      setIsDirty(false);
      if (onSave) onSave();
      setSuccessMessage('Event, Tickets, and Coupons saved! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const saveTicketsToAirtable = async (eventId) => {
    const updatedTickets = [];
  
    for (const ticket of tickets) {
      try {
        const fields = {
          'Ticket Name': ticket.name,
          'Type': ticket.type,
          'Price': ticket.type === 'PAID' ? Number(ticket.price) : 0,
          'Currency': ticket.currency,
          'Limit': ticket.limit ? Number(ticket.limit) : undefined,
          'Until Date': ticket.untilDate || undefined,
          'Event': [eventId], // 🧠 Link to event
        };
  
        Object.keys(fields).forEach(
          (key) => fields[key] === '' || fields[key] == null ? delete fields[key] : null
        );
  
        const url = ticket.airtableId
          ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets/${ticket.airtableId}`
          : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets`;
  
        const method = ticket.airtableId ? 'PATCH' : 'POST';
  
        const res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields }),
        });
  
        const result = await res.json();
        if (!res.ok) {
          console.error('❌ Failed to save ticket:', result);
          continue;
        }
  
        updatedTickets.push({
          ...ticket,
          airtableId: result.id, // ✅ Save Airtable ID
        });
  
      } catch (err) {
        console.error('Ticket Save Error:', err);
      }
    }
  
    // 🔄 Reflect latest state in UI
    setTickets(updatedTickets);
  };

  const saveCouponsToAirtable = async () => {
    const updatedCoupons = [];
  
    for (const coupon of coupons) {
      try {
        const fields = {
          'Coupon Code': coupon.code,
          'Coupon Name': coupon.name,
          'Type': coupon.type,
          'Amount': coupon.amount ? Number(coupon.amount) : undefined,
          'Percentage': coupon.percentage ? Number(coupon.percentage) : undefined,
          'Linked Ticket': coupon.ticketId ? [coupon.ticketId] : [], // 🧠 Link to ticket
        };
  
        Object.keys(fields).forEach(
          (key) => fields[key] === '' || fields[key] == null ? delete fields[key] : null
        );
  
        const url = coupon.airtableId
          ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons/${coupon.airtableId}`
          : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons`;
  
        const method = coupon.airtableId ? 'PATCH' : 'POST';
  
        const res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields }),
        });
  
        const result = await res.json();
        if (!res.ok) {
          console.error('❌ Failed to save coupon:', result);
          continue;
        }
  
        updatedCoupons.push({
          ...coupon,
          airtableId: result.id, // ✅ Save Airtable ID
        });
  
      } catch (err) {
        console.error('Coupon Save Error:', err);
      }
    }
  
    // 🔄 Reflect latest state in UI
    setCoupons(updatedCoupons);
  };

  const loadTickets = async (eventId) => {
    try {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tickets?filterByFormula=FIND("${eventId}", ARRAYJOIN(Event))`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();

      if (!res.ok) {
        console.error('❌ Error loading tickets:', result);
        return;
      }

      const loadedTickets = result.records.map((record) => ({
        id: crypto.randomUUID(),
        airtableId: record.id,
        name: record.fields['Ticket Name'] || '',
        type: record.fields['Type'] || 'FREE',
        price: record.fields['Price'] || '',
        currency: record.fields['Currency'] || 'EUR',
        limit: record.fields['Limit'] || '',
        untilDate: record.fields['Until Date'] || '',
      }));

      setTickets(loadedTickets);

      const ticketIds = loadedTickets.map(t => t.airtableId);
      await loadCoupons(ticketIds);

    } catch (err) {
      console.error('Error loading tickets:', err);
    }
  };

  const loadCoupons = async (ticketIds) => {
    try {
      if (!ticketIds.length) return;

      const filterFormula = `OR(${ticketIds.map(id => `FIND("${id}", ARRAYJOIN({Linked Ticket}))`).join(", ")})`;

      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Coupons?filterByFormula=${encodeURIComponent(filterFormula)}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();

      if (!res.ok) {
        console.error('❌ Error loading coupons:', result);
        return;
      }

      const loadedCoupons = result.records.map((record) => ({
        id: crypto.randomUUID(),
        airtableId: record.id,
        ticketId: record.fields['Linked Ticket'] ? record.fields['Linked Ticket'][0] : '',
        code: record.fields['Coupon Code'] || '',
        name: record.fields['Coupon Name'] || '',
        type: record.fields['Type'] || 'FREE',
        amount: record.fields['Amount'] || '',
        percentage: record.fields['Percentage'] || '',
      }));

      setCoupons(loadedCoupons);

    } catch (err) {
      console.error('Error loading coupons:', err);
    }
  };

  useEffect(() => {
    if (!event) {
      resetForm();
      return;
    }
    if (event.id !== form.id) {
      const f = event.fields;
      setForm({
        id: event.id,
        title: f['Event Title'] || '',
        startDate: f['Start Date'] || '',
        endDate: f['End Date'] || '',
        description: f['Description'] || '',
        format: f['Format'] || 'Online',
        zoomLink: f['Zoom link'] || '',
        location: f['Location'] || '',
        locationUrl: f['Location URL'] || '',
        locationDescription: f['Location Description'] || '',
        startTime1: f['Start Time (Start Date)'] || '',
        endTime1: f['End Time (Start Date)'] || '',
        startTime2: f['Start Time (End Date)'] || '',
        endTime2: f['End Time (End Date)'] || '',
        timeFormat: f['Time Format'] || '24',
      });
      setTickets([]);
      setCoupons([]);
      setIsDirty(false);

      loadTickets(event.id);
    }
  }, [event]);

  return (
    <div className="editor-overlay">
      <div className="editor-panel">

        {/* Header */}
        <div className="editor-header">
          <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        {/* Success Toast */}
        {successMessage && <div className="success-toast">{successMessage}</div>}

        {/* Tabs */}
        <div className="tab-bar">
          <button onClick={() => setActiveTab('details')} className={activeTab === 'details' ? 'active' : ''}>
            Event Details
          </button>
          <button onClick={() => setActiveTab('pricing')} className={activeTab === 'pricing' ? 'active' : ''}>
            Pricing & Coupons
          </button>
        </div>

        {/* Event Details Tab */}
        {activeTab === 'details' && (
          <>
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            </div>

            <div className="time-row">
              <div className="time-col">
                <label>Start Time</label>
                <select name="startTime1" value={form.startTime1} onChange={handleChange}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="time-col">
                <label>End Time</label>
                <select name="endTime1" value={form.endTime1} onChange={handleChange}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>

            {form.startDate !== form.endDate && (
              <div className="time-row">
                <div className="time-col">
                  <label>Start Time (End Date)</label>
                  <select name="startTime2" value={form.startTime2} onChange={handleChange}>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="time-col">
                  <label>End Time (End Date)</label>
                  <select name="endTime2" value={form.endTime2} onChange={handleChange}>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Time Format</label>
              <select name="timeFormat" value={form.timeFormat} onChange={handleChange}>
                <option value="24">24-hour</option>
                <option value="ampm">AM/PM</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Format</label>
              <div className="format-toggle">
                <button
                  className={form.format === 'In-person' ? 'active' : ''}
                  onClick={() => handleChange({ target: { name: 'format', value: 'In-person' } })}
                >
                  In-person
                </button>
                <button
                  className={form.format === 'Online' ? 'active' : ''}
                  onClick={() => handleChange({ target: { name: 'format', value: 'Online' } })}
                >
                  Online
                </button>
              </div>
            </div>

            {form.format === 'Online' && (
              <div className="form-group">
                <label>Zoom Link</label>
                <input name="zoomLink" value={form.zoomLink} onChange={handleChange} />
              </div>
            )}

            {form.format === 'In-person' && (
              <>
                <div className="form-group">
                  <label>Location</label>
                  <input name="location" value={form.location} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Location URL</label>
                  <input name="locationUrl" value={form.locationUrl} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Location Description</label>
                  <textarea name="locationDescription" value={form.locationDescription} onChange={handleChange} />
                </div>
              </>
            )}
          </>
        )}

        {/* Pricing & Coupons Tab */}
        {activeTab === 'pricing' && (
          <>
            <h3>Tickets</h3>
            <button onClick={() => { setEditingTicket(null); setShowTicketPopup(true); }}>+ Add Ticket</button>
            <ul>
              {tickets.map((ticket, i) => (
                <li key={i} onClick={() => { setEditingTicket(ticket); setShowTicketPopup(true); }}>
                  {ticket.name} – {ticket.type} – {ticket.price} {ticket.currency}
                </li>
              ))}
            </ul>

            <h3>Coupons</h3>
            <button onClick={() => { setEditingCoupon(null); setShowCouponPopup(true); }}>+ Add Coupon</button>
            <ul>
              {coupons.map((coupon, i) => (
                <li key={i} onClick={() => { setEditingCoupon(coupon); setShowCouponPopup(true); }}>
                  {coupon.code} – {coupon.type}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Ticket Popup */}
        {showTicketPopup && (
          <TicketPopup
            ticket={editingTicket}
            onClose={() => setShowTicketPopup(false)}
            onSave={(ticket) => {
              setTickets(prev => {
                const existing = prev.findIndex(t => t.id === ticket.id);
                if (existing > -1) {
                  const copy = [...prev];
                  copy[existing] = ticket;
                  return copy;
                } else {
                  return [...prev, ticket];
                }
              });
            }}
            onDelete={(id) => setTickets(prev => prev.filter(t => t.id !== id))}
          />
        )}

        {/* Coupon Popup */}
        {showCouponPopup && (
          <CouponPopup
            coupon={editingCoupon}
            tickets={tickets}
            onClose={() => setShowCouponPopup(false)}
            onSave={(coupon) => {
              setCoupons(prev => {
                const existing = prev.findIndex(c => c.id === coupon.id);
                if (existing > -1) {
                  const copy = [...prev];
                  copy[existing] = coupon;
                  return copy;
                } else {
                  return [...prev, coupon];
                }
              });
            }}
            onDelete={(id) => setCoupons(prev => prev.filter(c => c.id !== id))}
          />
        )}

        {/* Save Button */}
        <div className="editor-footer">
          <button
            className={`save-btn ${isDirty ? 'dirty' : ''}`}
            onClick={() => handleSave()}
            disabled={!isDirty}
          >
            {isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventEditorModal;