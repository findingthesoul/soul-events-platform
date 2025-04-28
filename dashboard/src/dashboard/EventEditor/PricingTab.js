import React from 'react';

const PricingTab = ({ tickets, coupons, onTicketsChange, onCouponsChange, openEditTicket, openEditCoupon }) => {
  const handleAddTicket = () => {
    const newTicket = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      type: 'PAID',
      currency: 'USD',
      availableUntil: '',
      quantity: '',
    };
    onTicketsChange([...tickets, newTicket]);
  };

  const handleDeleteTicket = (index) => {
    const updated = [...tickets];
    updated.splice(index, 1);
    onTicketsChange(updated);
  };

  const handleAddCoupon = () => {
    const newCoupon = {
      id: Date.now().toString(),
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      type: 'PERCENTAGE',
      amount: 10,
      ticketId: '',
      limit: '',
    };
    onCouponsChange([...coupons, newCoupon]);
  };

  const handleDeleteCoupon = (index) => {
    const updated = [...coupons];
    updated.splice(index, 1);
    onCouponsChange(updated);
  };

  return (
    <div className="pricing-tab">
      <h3>Tickets</h3>
      <button onClick={handleAddTicket}>Add Ticket</button>
      <div className="tickets-list">
        {tickets.map((ticket, index) => (
          <div key={ticket.id} className="ticket-item">
            <span>{ticket.name || 'Unnamed Ticket'}</span>
            <button onClick={() => openEditTicket(index)}>Edit</button>
            <button onClick={() => handleDeleteTicket(index)}>Delete</button>
          </div>
        ))}
      </div>

      <h3>Coupons</h3>
      <button onClick={handleAddCoupon}>Add Coupon</button>
      <div className="coupons-list">
        {coupons.map((coupon, index) => (
          <div key={coupon.id} className="coupon-item">
            <span>{coupon.code}</span>
            <button onClick={() => openEditCoupon(index)}>Edit</button>
            <button onClick={() => handleDeleteCoupon(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingTab;