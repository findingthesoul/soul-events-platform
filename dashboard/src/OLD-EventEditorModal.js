import React, { useState, useEffect } from 'react';

const EventEditorModal = ({ eventId, onClose, refreshEvents }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [eventData, setEventData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Draft',
    facilitators: [],
    calendar: '',
    tickets: [],
    coupons: [],
  });
  const [facilitatorsList, setFacilitatorsList] = useState([]);
  const [calendarsList, setCalendarsList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
    fetchFacilitators();
    fetchCalendars();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.fields) {
        setEventData({
          ...eventData,
          ...data.fields,
          tickets: data.fields.tickets || [],
          coupons: data.fields.coupons || [],
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchFacilitators = async () => {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Facilitators`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.records) {
        setFacilitatorsList(data.records);
      }
    } catch (error) {
      console.error('Error fetching facilitators:', error);
    }
  };

  const fetchCalendars = async () => {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Calendars`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data.records) {
        setCalendarsList(data.records);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }
  };

  const handleChange = (field, value) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
    autoSave({ ...eventData, [field]: value });
  };

  const autoSave = async (data) => {
    if (!eventId) return;
    try {
      setIsSaving(true);
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${eventId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: data,
        }),
      });
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${eventId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: eventData }),
      });
      refreshEvents();
    } catch (error) {
      console.error('Error manually saving event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = prompt('Type DELETE to confirm deletion.');
    if (confirmDelete !== 'DELETE') {
      alert('Deletion cancelled.');
      return;
    }
    try {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      });
      refreshEvents();
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleDuplicate = async () => {
    const newTitle = prompt('Enter the new title for duplicated event:');
    if (!newTitle) {
      alert('Duplication cancelled.');
      return;
    }
    try {
      const duplicatedEvent = {
        ...eventData,
        name: newTitle,
      };
      delete duplicatedEvent.id;
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: duplicatedEvent }),
      });
      refreshEvents();
      alert('Event duplicated successfully.');
    } catch (error) {
      console.error('Error duplicating event:', error);
    }
  };

  const addTicket = () => {
    const newTicket = {
      id: Date.now(),
      name: '',
      price: 0,
      type: 'PAID',
      currency: 'USD',
      availableUntil: '',
      quantity: '',
    };
    const updatedTickets = [...eventData.tickets, newTicket];
    setEventData((prev) => ({ ...prev, tickets: updatedTickets }));
    autoSave({ ...eventData, tickets: updatedTickets });
  };

  const updateTicket = (index, field, value) => {
    const updatedTickets = [...eventData.tickets];
    updatedTickets[index][field] = value;
    setEventData((prev) => ({ ...prev, tickets: updatedTickets }));
    autoSave({ ...eventData, tickets: updatedTickets });
  };

  const deleteTicket = (index) => {
    const updatedTickets = [...eventData.tickets];
    updatedTickets.splice(index, 1);
    setEventData((prev) => ({ ...prev, tickets: updatedTickets }));
    autoSave({ ...eventData, tickets: updatedTickets });
  };
  const addCoupon = () => {
    const newCoupon = {
      id: Date.now(),
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      type: 'PERCENTAGE',
      amount: 10,
      ticketId: '',
      limit: '',
    };
    const updatedCoupons = [...eventData.coupons, newCoupon];
    setEventData((prev) => ({ ...prev, coupons: updatedCoupons }));
    autoSave({ ...eventData, coupons: updatedCoupons });
  };

  const updateCoupon = (index, field, value) => {
    const updatedCoupons = [...eventData.coupons];
    updatedCoupons[index][field] = value;
    setEventData((prev) => ({ ...prev, coupons: updatedCoupons }));
    autoSave({ ...eventData, coupons: updatedCoupons });
  };

  const deleteCoupon = (index) => {
    const updatedCoupons = [...eventData.coupons];
    updatedCoupons.splice(index, 1);
    setEventData((prev) => ({ ...prev, coupons: updatedCoupons }));
    autoSave({ ...eventData, coupons: updatedCoupons });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'pricing':
        return renderPricingTab();
      case 'settings':
        return renderMoreSettingsTab();
      default:
        return null;
    }
  };

  const renderDetailsTab = () => (
    <div className="tab-content">
      <label>Event Name:</label>
      <input
        type="text"
        value={eventData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleSave()}
      />
      <label>Start Date:</label>
      <input
        type="datetime-local"
        value={eventData.startDate}
        onChange={(e) => handleChange('startDate', e.target.value)}
        onBlur={() => handleSave()}
      />
      <label>End Date:</label>
      <input
        type="datetime-local"
        value={eventData.endDate}
        onChange={(e) => handleChange('endDate', e.target.value)}
        onBlur={() => handleSave()}
      />
      <label>Description:</label>
      <textarea
        value={eventData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        onBlur={() => handleSave()}
      />
      <label>Status:</label>
      <select
        value={eventData.status}
        onChange={(e) => handleChange('status', e.target.value)}
        onBlur={() => handleSave()}
      >
        <option value="Draft">Draft</option>
        <option value="Public">Public</option>
      </select>
      <label>Facilitator:</label>
      <select
        value={eventData.facilitators[0] || ''}
        onChange={(e) => handleChange('facilitators', [e.target.value])}
        onBlur={() => handleSave()}
      >
        <option value="">Select Facilitator</option>
        {facilitatorsList.map((facilitator) => (
          <option key={facilitator.id} value={facilitator.id}>
            {facilitator.fields?.name}
          </option>
        ))}
      </select>
      <label>Calendar:</label>
      <select
        value={eventData.calendar}
        onChange={(e) => handleChange('calendar', e.target.value)}
        onBlur={() => handleSave()}
      >
        <option value="">Select Calendar</option>
        {calendarsList.map((calendar) => (
          <option key={calendar.id} value={calendar.id}>
            {calendar.fields?.name}
          </option>
        ))}
      </select>
    </div>
  );
  const renderPricingTab = () => (
    <div className="tab-content">
      <h3>Tickets</h3>
      <button onClick={addTicket}>Add Ticket</button>
      {eventData.tickets.map((ticket, index) => (
        <div key={ticket.id} className="ticket-item">
          <input
            type="text"
            placeholder="Ticket Name"
            value={ticket.name}
            onChange={(e) => updateTicket(index, 'name', e.target.value)}
            onBlur={handleSave}
          />
          <input
            type="number"
            placeholder="Price"
            value={ticket.price}
            onChange={(e) => updateTicket(index, 'price', parseFloat(e.target.value))}
            onBlur={handleSave}
          />
          <select
            value={ticket.type}
            onChange={(e) => updateTicket(index, 'type', e.target.value)}
            onBlur={handleSave}
          >
            <option value="PAID">Paid</option>
            <option value="FREE">Free</option>
          </select>
          <button onClick={() => deleteTicket(index)}>Delete</button>
        </div>
      ))}

      <h3>Coupons</h3>
      <button onClick={addCoupon}>Add Coupon</button>
      {eventData.coupons.map((coupon, index) => (
        <div key={coupon.id} className="coupon-item">
          <input
            type="text"
            placeholder="Coupon Code"
            value={coupon.code}
            readOnly
          />
          <select
            value={coupon.type}
            onChange={(e) => updateCoupon(index, 'type', e.target.value)}
            onBlur={handleSave}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="AMOUNT">Amount</option>
            <option value="FREE">Free Ticket</option>
          </select>
          <input
            type="number"
            placeholder="Amount or %"
            value={coupon.amount}
            onChange={(e) => updateCoupon(index, 'amount', parseFloat(e.target.value))}
            onBlur={handleSave}
          />
          <button onClick={() => deleteCoupon(index)}>Delete</button>
        </div>
      ))}
    </div>
  );

  const renderMoreSettingsTab = () => (
    <div className="tab-content">
      <button className="danger" onClick={handleDelete}>
        Delete Event
      </button>
      <button onClick={handleDuplicate}>Duplicate Event</button>
    </div>
  );

  return (
    <div className="event-editor-modal">
      <div className="modal-header">
        <h2>{eventId ? 'Edit Event' : 'New Event'}</h2>
        <button onClick={onClose}>X</button>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Event Details
        </button>
        <button
          className={activeTab === 'pricing' ? 'active' : ''}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing & Coupons
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          More Settings
        </button>
      </div>

      <div className="tab-container">{renderTabContent()}</div>

      <div className="modal-footer">
        {isSaving ? <span>Saving...</span> : <button onClick={handleSave}>Save</button>}
      </div>
    </div>
  );
};

export default EventEditorModal;