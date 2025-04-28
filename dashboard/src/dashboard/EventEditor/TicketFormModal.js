import React, { useState, useEffect } from 'react';

const TicketFormModal = ({ ticket, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    type: 'PAID',
    currency: 'USD',
    availableUntil: '',
    quantity: '',
  });

  useEffect(() => {
    if (ticket) {
      setFormData(ticket);
    }
  }, [ticket]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Ticket</h3>

        <div className="form-group">
          <label>Ticket Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="PAID">Paid</option>
            <option value="FREE">Free</option>
          </select>
        </div>

        <div className="form-group">
          <label>Currency</label>
          <input
            type="text"
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
          />
        </div>

        <div className="form-group">
          <label>Available Until</label>
          <input
            type="date"
            value={formData.availableUntil}
            onChange={(e) => handleChange('availableUntil', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save Ticket</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TicketFormModal;