import React from 'react';

const PricingTab = ({
  tickets = [],
  coupons = [],
  onTicketsChange,
  onCouponsChange,
  openEditTicket,
  openEditCoupon,
  onAddTicket,
  onAddCoupon,
}) => {
  return (
    <div className="pricing-tab scrollable-panel">
      <h3>Tickets</h3>
      <div className="ticket-list">
        {tickets.length === 0 && <p>No tickets yet.</p>}
        {tickets.map((ticket, index) => (
          <div key={index} className="ticket-item" onClick={() => openEditTicket(index)}>
            <strong>{ticket.name || 'Unnamed Ticket'}</strong>
            <span>
              {ticket.type === 'PAID'
                ? `${ticket.price || 0} ${ticket.currency}`
                : 'FREE'}
            </span>
          </div>
        ))}
        <button className="add-btn" onClick={() => openEditTicket(null)}>
          + Add Ticket
        </button>
      </div>

      <h3>Coupons</h3>
      <div className="coupon-list">
        {coupons.length === 0 && <p>No coupons yet.</p>}
        {coupons.map((coupon, index) => (
          <div key={index} className="coupon-item" onClick={() => openEditCoupon(index)}>
            <strong>{coupon.code || 'Unnamed Coupon'}</strong>
            <span>
              {coupon.type === 'PERCENTAGE'
                ? `${coupon.amount}%`
                : coupon.type === 'AMOUNT'
                ? `${coupon.amount} ${coupon.currency}`
                : 'FREE'}
            </span>
          </div>
        ))}
        <button className="add-btn" onClick={() => openEditCoupon(null)}>
          + Add Coupon
        </button>
      </div>
    </div>
  );
};

export default PricingTab;
