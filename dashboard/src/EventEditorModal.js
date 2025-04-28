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
    if (!form.ticketId) {
      alert('Please select a Ticket for this Coupon.');
      return;
    }
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
            <option key={t.id} value={t.airtableId}>
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
          {coupon && (
            <button className="delete-btn" onClick={() => { onDelete(coupon.id); onClose(); }}>
              Delete
            </button>
          )}
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
// Start EventEditorModal
const EventEditorModal = ({ event, vendorId, onClose, onSave }) => {
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
    status: 'Draft', // ✅ Added status (Draft | Public)
    hosts: [],
    calendar: '',
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
      status: 'Draft',
      hosts: [],
      calendar: '',
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
      // Autosave ready if needed
    }, 1200);
  };

  const handleClose = () => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Save before closing?');
      if (!confirm) return;
    }
    onClose();
  };

  const toggleStatus = () => {
    setForm(prev => ({
      ...prev,
      status: prev.status === 'Draft' ? 'Public' : 'Draft',
    }));
    setIsDirty(true);
  };

  const addHost = (host) => {
    if (!form.hosts.includes(host)) {
      setForm(prev => ({ ...prev, hosts: [...prev.hosts, host] }));
      setIsDirty(true);
    }
  };

  const removeHost = (host) => {
    setForm(prev => ({
      ...prev,
      hosts: prev.hosts.filter(h => h !== host),
    }));
    setIsDirty(true);
  };
  const handleSave = async () => {
    try {
      const updatedFields = {
        'Event Title': form.title,
        'Start Date': form.startDate,
        'End Date': form.endDate,
        'Description': form.description,
        'Format': form.format,
        'Zoom link': form.format === 'Online' ? form.zoomLink : '',
        'Location': form.format === 'In-person' ? form.location : '',
        'Location URL': form.format === 'In-person' ? form.locationUrl : '',
        'Location Description': form.format === 'In-person' ? form.locationDescription : '',
        'Start Time (Start Date)': form.startTime1,
        'End Time (Start Date)': form.endTime1,
        'Start Time (End Date)': form.startTime2,
        'End Time (End Date)': form.endTime2,
        'Time Format': form.timeFormat,
        'Status': form.status,
        'Hosts': form.hosts.length > 0 ? form.hosts : undefined,
        'Calendar': form.calendar || undefined,
        Vendors: vendorId ? [vendorId] : [],
      };

      Object.keys(updatedFields).forEach(
        (key) => (updatedFields[key] === '' || updatedFields[key] == null) && delete updatedFields[key]
      );

      const url = form.id
        ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${form.id}`
        : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events`;

      const method = form.id ? 'PATCH' : 'POST';

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
        console.error('❌ Failed to save event:', result.error?.message || result);
        throw new Error('Save failed');
      }

      setIsDirty(false);
      if (onSave) onSave();
      setSuccessMessage('Saved successfully ✅');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Save Error:', err);
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
        status: f['Status'] || 'Draft',
        hosts: f['Hosts'] || [],
        calendar: f['Calendar'] || '',
      });
      setIsDirty(false);
    }
  }, [event]);

  return (
    <div className="editor-overlay">
      <div className="editor-panel">

        {/* Header */}
        <div className="editor-header">
          <h2>{form.id ? 'Edit Event' : 'Create Event'}</h2>
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
          <button onClick={() => setActiveTab('more')} className={activeTab === 'more' ? 'active' : ''}>
            More
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="tab-content">
            {/* Your event detail fields here */}
          </div>
        )}
        {activeTab === 'pricing' && (
          <div className="tab-content">
            {/* Ticket and Coupon management */}
          </div>
        )}
        {activeTab === 'more' && (
          <div className="tab-content">
            <h3>Status</h3>
            <div className="format-toggle">
              <button
                className={form.status === 'Draft' ? 'active' : ''}
                onClick={toggleStatus}
              >
                Draft
              </button>
              <button
                className={form.status === 'Public' ? 'active' : ''}
                onClick={toggleStatus}
              >
                Public
              </button>
            </div>

            <h3>Hosts</h3>
            <input
              type="text"
              placeholder="Add Host Name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  addHost(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
            <ul>
              {form.hosts.map((host, i) => (
                <li key={i}>
                  {host}
                  <button onClick={() => removeHost(host)}>x</button>
                </li>
              ))}
            </ul>

            <h3>Calendar</h3>
            <input
              type="text"
              name="calendar"
              value={form.calendar}
              onChange={handleChange}
              placeholder="Calendar Name"
            />
          </div>
        )}

        {/* Save Button */}
        <div className="editor-footer">
          <button
            className={`save-btn ${isDirty ? 'dirty' : ''}`}
            onClick={handleSave}
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