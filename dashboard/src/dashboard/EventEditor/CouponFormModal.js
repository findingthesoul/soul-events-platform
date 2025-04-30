import React, { useState, useEffect } from 'react';

const CouponFormModal = ({ coupon, onSave, onClose, availableTickets = [] }) => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE', // 'FREE', 'PERCENTAGE', or 'AMOUNT'
    amount: '',
    limit: '',
    ticketId: '',
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        type: coupon.type || 'PERCENTAGE',
        amount: coupon.amount || '',
        limit: coupon.limit || '',
        ticketId: coupon.ticketId || '',
      });
    } else {
      // Generate random code for new coupons
      setFormData(prev => ({ ...prev, code: generateCode() }));
    }
  }, [coupon]);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const cleanCoupon = {
      ...formData,
      amount: formData.type !== 'FREE' ? parseFloat(formData.amount) || 0 : 0,
      limit: parseInt(formData.limit) || 0,
    };
    onSave(cleanCoupon);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{coupon ? 'Edit Coupon' : 'Add Coupon'}</h3>

        <div className="form-group">
          <label>Coupon Code</label>
          <input type="text" value={formData.code} readOnly />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="FREE">Free</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="AMOUNT">Fixed Amount</option>
          </select>
        </div>

        {formData.type !== 'FREE' && (
          <div className="form-group">
            <label>{formData.type === 'PERCENTAGE' ? 'Discount %' : 'Amount'}</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>Limit Uses</label>
          <input
            type="number"
            value={formData.limit}
            onChange={(e) => handleChange('limit', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Applies to Ticket</label>
          <select
            value={formData.ticketId}
            onChange={(e) => handleChange('ticketId', e.target.value)}
          >
            <option value="">Select Ticket</option>
            {availableTickets.map((ticket, index) => (
              <option key={index} value={ticket.id || ticket.name}>
                {ticket.name || `Ticket ${index + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save Coupon</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CouponFormModal;