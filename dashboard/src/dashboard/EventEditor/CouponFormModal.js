import React, { useState, useEffect } from 'react';

const CouponFormModal = ({ coupon, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    amount: 10,
    ticketId: '',
    limit: '',
  });

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
    }
  }, [coupon]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Coupon</h3>

        <div className="form-group">
          <label>Coupon Code</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="PERCENTAGE">Percentage Discount</option>
            <option value="AMOUNT">Fixed Amount Discount</option>
            <option value="FREE">Free Ticket</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount or Percentage</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Limit Use (optional)</label>
          <input
            type="number"
            value={formData.limit}
            onChange={(e) => handleChange('limit', e.target.value)}
          />
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