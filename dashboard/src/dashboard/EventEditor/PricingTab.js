import React from 'react';

const PricingTab = ({
  tickets = [],
  coupons = [],
  onTicketsChange,
  onCouponsChange,
  openEditTicket,
  openEditCoupon
}) => {
  return (
    <div className="pricing-tab scrollable-panel">
      <h3>Tickets</h3>
      <button type="button" onClick={() => openEditTicket(null)}>
        + Add Ticket
      </button>
      <ul>
        {tickets.map((ticket, index) => (
          <li key={index}>
            {ticket.name || 'Unnamed Ticket'} – {ticket.price || 'Free'}
            <button onClick={() => openEditTicket(index)}>Edit</button>
          </li>
        ))}
      </ul>

      <h3>Coupons</h3>
      <button type="button" onClick={() => openEditCoupon(null)}>
        + Add Coupon
      </button>
      <ul>
        {coupons.map((coupon, index) => (
          <li key={index}>
            {coupon.code || 'Unnamed Coupon'}
            <button onClick={() => openEditCoupon(index)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingTab;