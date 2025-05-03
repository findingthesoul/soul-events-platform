import React, { useState, useEffect } from 'react';

const CouponFormModal = ({ coupon, onSave, onClose, onDelete, availableTickets }) => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'FREE',
    amount: '',
    currency: '',
    linkedTicket: '',
  });

  const generateCouponCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon['Coupon Code'] || coupon.code || '',
        type: coupon['Type'] || coupon.type || 'FREE',
        amount: coupon['Amount'] || coupon.amount || '',
        currency: coupon['Currency'] || coupon.currency || '',
        linkedTicket: coupon['Linked Ticket'] || coupon.linkedTicket || '',
      });
    } else {
      setFormData((prev) => ({ ...prev, code: generateCouponCode() }));
    }
  }, [coupon]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this coupon?')) {
      onDelete();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{coupon ? 'Edit Coupon' : 'Add Coupon'}</h3>

        <div className="form-group">
          <label>Coupon Code</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="FREE">Free</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="AMOUNT">Amount</option>
          </select>
        </div>

        {formData.type !== 'FREE' && (
          <>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Linked Ticket</label>
          <select
            value={formData.linkedTicket}
            onChange={(e) => handleChange('linkedTicket', e.target.value)}
          >
            <option value="">-- None --</option>
            {availableTickets.map((ticket, index) => (
              <option key={index} value={ticket.id || ticket.name}>
                {ticket['Ticket Name'] || ticket.name || 'Unnamed Ticket'}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save Coupon</button>
          <button onClick={onClose}>Cancel</button>
          {coupon && <button onClick={handleDelete} className="danger">Delete</button>}
        </div>
      </div>
    </div>
  );
};

export default CouponFormModal;
