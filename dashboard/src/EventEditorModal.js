import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const EventEditorModal = ({ isOpen, onRequestClose, selectedEvent, onSave }) => {
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({});
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      setForm({
        name: selectedEvent.fields['Event Title'] || '',
        startDate: selectedEvent.fields['Start Date'] || '',
        endDate: selectedEvent.fields['End Date'] || '',
        description: selectedEvent.fields['Description'] || '',
        format: selectedEvent.fields['Format'] || '',
        zoomLink: selectedEvent.fields['Zoom link'] || '',
        location: selectedEvent.fields['Location URL'] || '',
        locationDescription: selectedEvent.fields['Location Description'] || '',
      });
      setTickets(selectedEvent.fields['Tickets'] || []);
    }
  }, [selectedEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const fields = {
        'Event Title': form.name,
        'Start Date': form.startDate,
        'End Date': form.endDate,
        'Description': form.description,
        'Format': form.format,
        'Zoom link': form.zoomLink,
        'Location URL': form.location,
        'Location Description': form.locationDescription,
      };

      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/events/${selectedEvent.id}`,
        { fields },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Saved successfully!');
      onSave();
    } catch (err) {
      console.error(err);
      setMessage('Failed to save.');
    }
  };

  const handleAddTicket = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/tickets`,
        {
          eventId: selectedEvent.id,
          fields: newTicket,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets([...tickets, response.data]);
      setShowTicketModal(false);
      setNewTicket({});
    } catch (err) {
      console.error(err);
      setMessage('Failed to add ticket.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Event"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Edit Event</h2>
      <input
        name="name"
        value={form.name || ''}
        onChange={handleChange}
        placeholder="Event Title"
      />
      <input
        name="startDate"
        value={form.startDate || ''}
        onChange={handleChange}
        type="date"
        placeholder="Start Date"
      />
      <input
        name="endDate"
        value={form.endDate || ''}
        onChange={handleChange}
        type="date"
        placeholder="End Date"
      />
      <textarea
        name="description"
        value={form.description || ''}
        onChange={handleChange}
        placeholder="Description"
      />
      <select name="format" value={form.format || ''} onChange={handleChange}>
        <option value="">Select Format</option>
        <option value="Online">Online</option>
        <option value="In-person">In-person</option>
      </select>
      {form.format === 'Online' && (
        <input
          name="zoomLink"
          value={form.zoomLink || ''}
          onChange={handleChange}
          placeholder="Zoom link"
        />
      )}
      {form.format === 'In-person' && (
        <>
          <input
            name="location"
            value={form.location || ''}
            onChange={handleChange}
            placeholder="Location URL"
          />
          <input
            name="locationDescription"
            value={form.locationDescription || ''}
            onChange={handleChange}
            placeholder="Location Description"
          />
        </>
      )}

      <button onClick={handleSave}>Save</button>
      <p>{message}</p>
      <hr />
      <h3>Tickets</h3>
      {tickets.map((ticket, i) => (
        <div key={i}>{ticket.fields?.['Ticket Name']}</div>
      ))}
      <button onClick={() => setShowTicketModal(true)}>Add Ticket</button>

      {showTicketModal && (
        <Modal isOpen={showTicketModal} onRequestClose={() => setShowTicketModal(false)}>
          <h4>New Ticket</h4>
          <input
            placeholder="Ticket Name"
            value={newTicket['Ticket Name'] || ''}
            onChange={(e) =>
              setNewTicket({ ...newTicket, 'Ticket Name': e.target.value })
            }
          />
          <input
            placeholder="Price"
            value={newTicket['Price'] || ''}
            onChange={(e) => setNewTicket({ ...newTicket, 'Price': parseFloat(e.target.value) })}
            type="number"
          />
          <button onClick={handleAddTicket}>Save Ticket</button>
        </Modal>
      )}
    </Modal>
  );
};

export default EventEditorModal;