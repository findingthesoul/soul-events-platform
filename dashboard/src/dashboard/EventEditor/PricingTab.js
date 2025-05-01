import React from 'react';

const PricingTab = ({
  tickets = [],
  coupons = [],
  onTicketsChange,
  onCouponsChange,
  openEditTicket,
  openEditCoupon,
  deleteTicket,
  deleteCoupon
}) => {
  return (
    <div className="pricing-tab scrollable-panel">
      <h3>🎫 Tickets</h3>
      <button type="button" onClick={() => openEditTicket(null)}>
        + Add Ticket
      </button>
      <ul className="item-list">
        {tickets.map((ticket, index) => (
          <li key={index} className="item-card">
            <div className="item-title">{ticket['Ticket Name'] || ticket.name || 'Unnamed Ticket'}</div>
            <div className="item-details">
              <span className="badge">{ticket['Type'] || ticket.type || 'FREE'}</span>
              {ticket['Type'] === 'PAID' && (
                <span>
                  {ticket['Price'] || ticket.price || 0} {ticket['Currency'] || ticket.currency || 'USD'}
                </span>
              )}
              {ticket['Available Until'] && <span>• Until {ticket['Available Until']}</span>}
              {ticket['Quantity'] && <span>• {ticket['Quantity']} total</span>}
            </div>
            <div className="item-actions">
              <button onClick={() => openEditTicket(index)}>✏️ Edit</button>
              <button onClick={() => deleteTicket(index)} className="danger">🗑 Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <h3>🏷 Coupons</h3>
      <button type="button" onClick={() => openEditCoupon(null)}>
        + Add Coupon
      </button>
      <ul className="item-list">
        {coupons.map((coupon, index) => (
          <li key={index} className="item-card">
            <div className="item-title">{coupon['Coupon Code'] || coupon.code || 'Unnamed Coupon'}</div>
            <div className="item-details">
              <span className="badge">{coupon['Type'] || coupon.type || 'FREE'}</span>
              {coupon['Type'] === 'PERCENTAGE' && <span>• {coupon['Amount']}%</span>}
              {coupon['Type'] === 'AMOUNT' && <span>• {coupon['Amount']} {coupon['Currency']}</span>}
              {coupon['Linked Ticket'] && <span>• for {coupon['Linked Ticket']}</span>}
            </div>
            <div className="item-actions">
              <button onClick={() => openEditCoupon(index)}>✏️ Edit</button>
              <button onClick={() => deleteCoupon(index)} className="danger">🗑 Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingTab;
