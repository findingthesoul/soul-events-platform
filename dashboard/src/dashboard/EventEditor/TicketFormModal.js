import React, { useState, useEffect } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';

const TicketFormModal = ({ ticket, onSave, onClose, onDelete, saveNewTicketToAirtable }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'PAID',
    price: '',
    currency: 'USD',
    limit: '',
    untilDate: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData({
        name: ticket['Ticket Name'] || ticket.name || '',
        type: ticket['Type'] || ticket.type || 'PAID',
        price: ticket['Price'] || ticket.price || '',
        currency: ticket['Currency'] || ticket.currency || 'USD',
        limit: ticket['Limit'] || ticket.limit || '',
        untilDate: ticket['Until Date'] || ticket.untilDate || '',
      });
    }
  }, [ticket]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!ticket && typeof saveNewTicketToAirtable === 'function') {
      try {
        const newTicket = await saveNewTicketToAirtable(formData);
        onSave(newTicket);
      } catch (err) {
        console.error('❌ Failed to create new ticket in Airtable:', err);
      }
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{ticket ? 'Edit Ticket' : 'Add Ticket'}</h3>

        <div className="form-group">
          <label>Ticket Name</label>
          <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)}>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {formData.type === 'PAID' && (
          <>
            <div className="form-group">
              <label>Price</label>
              <input type="number" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <input type="text" value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)} />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Limit</label>
          <input type="number" value={formData.limit || ''} onChange={(e) => handleChange('limit', e.target.value)} />
        </div>

        <div className="form-group">
          <label>Until Date</label>
          <input type="date" value={formData.untilDate || ''} onChange={(e) => handleChange('untilDate', e.target.value)} />
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save Ticket</button>
          <button onClick={onClose}>Cancel</button>
          {ticket && (
            <button onClick={() => setShowDeleteConfirm(true)} className="danger">Delete</button>
          )}
        </div>

        {showDeleteConfirm && (
          <DeleteConfirmModal
            itemType="ticket"
            onConfirm={() => {
              onDelete();
              setShowDeleteConfirm(false);
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TicketFormModal;