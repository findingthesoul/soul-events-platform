import React, { useState, useEffect } from 'react';

const CouponFormModal = ({ coupon, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'FREE',
    amount: '',
    percentage: '',
    ticket: '',
    limit: '',
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        type: coupon.type || 'FREE',
        amount: coupon.amount || '',
        percentage: coupon.percentage || '',
        ticket: coupon.ticket || '',
        limit: coupon.limit || '',
      });
    }
  }, [coupon]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData); // Pass data back to parent
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
          <label>Coupon Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="FREE">Free</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="AMOUNT">Amount</option>
          </select>
        </div>

        {formData.type === 'AMOUNT' && (
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
          </div>
        )}

        {formData.type === 'PERCENTAGE' && (
          <div className="form-group">
            <label>Percentage</label>
            <input
              type="number"
              value={formData.percentage}
              onChange={(e) => handleChange('percentage', e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>Ticket ID (optional)</label>
          <input
            type="text"
            value={formData.ticket}
            onChange={(e) => handleChange('ticket', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Limit Uses</label>
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