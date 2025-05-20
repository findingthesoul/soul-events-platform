import React, { useState, useEffect } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';

const CouponFormModal = ({ coupon, onSave, onClose, onDelete, availableTickets }) => {
  const [formData, setFormData] = useState({
    code: '',
    type: 'FREE',
    amount: '',
    linkedTicket: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const generateCouponCode = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon['Coupon Code'] || coupon.code || '',
        type: coupon['Coupon Type'] || coupon.type || 'FREE',
        amount: coupon['Amount'] || coupon.amount || '',
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

  const linkedTicketCurrency = () => {
    const ticket = availableTickets.find(t => t.id === formData.linkedTicket);
    return ticket?.Currency || ticket?.currency || '';
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
          <label>Linked Ticket</label>
          <select
            value={formData.linkedTicket}
            onChange={(e) => handleChange('linkedTicket', e.target.value)}
          >
            <option value="">-- None --</option>
            {availableTickets.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {ticket['Ticket Name'] || ticket.name || 'Unnamed Ticket'}
              </option>
            ))}
          </select>
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
          <div className="form-group">
            <label>Amount</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
              />
              <span style={{ marginLeft: '0.5em' }}>
                {formData.type === 'PERCENTAGE' ? '%' : linkedTicketCurrency()}
              </span>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={handleSubmit}>Save Coupon</button>
          <button onClick={onClose}>Cancel</button>
          {coupon && (
            <button onClick={() => setShowDeleteConfirm(true)} className="danger">Delete</button>
          )}
        </div>

        {showDeleteConfirm && (
          <DeleteConfirmModal
            itemType="coupon"
            onConfirm={() => {
              if (deleteConfirmText === 'DELETE') {
                onDelete();
              }
            }}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setDeleteConfirmText('');
            }}
          >
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
            />
            <div className="modal-actions">
              <button
                className="danger"
                disabled={deleteConfirmText !== 'DELETE'}
                style={{
                  backgroundColor: deleteConfirmText === 'DELETE' ? 'blue' : '#ccc',
                  color: 'white',
                }}
                onClick={() => {
                  if (deleteConfirmText === 'DELETE') onDelete();
                }}
              >
                Confirm Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </DeleteConfirmModal>
        )}
      </div>
    </div>
  );
};

export default CouponFormModal;