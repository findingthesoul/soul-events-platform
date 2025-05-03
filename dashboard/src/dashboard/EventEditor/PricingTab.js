import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './PricingTab.css';
import { updateTicketOrderInAirtable } from './api';

const PricingTab = ({
  tickets = [],
  coupons = [],
  onTicketsChange,
  onCouponsChange,
  openEditTicket,
  openEditCoupon,
}) => {
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(tickets);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    onTicketsChange(reordered);

    // Save new order to Airtable
    const updates = reordered.map((ticket, index) => ({
      id: ticket.id,
      fields: { 'Sort Order': index + 1 },
    }));
    try {
      await updateTicketOrderInAirtable(updates);
    } catch (err) {
      console.error('Failed to update sort order:', err);
    }
  };

  const handleCouponDelete = (index) => {
    const updated = [...coupons];
    updated.splice(index, 1);
    onCouponsChange(updated);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="pricing-tab">
      <div className="section-header">
        <h3>Tickets</h3>
        <button className="add-btn" onClick={() => openEditTicket(null)}>+ New Ticket</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="ticketList">
          {(provided) => (
            <div
              className="item-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tickets.map((ticket, index) => (
                <Draggable key={ticket.id || index} draggableId={ticket.id || `ticket-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="item-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <span className="drag-icon">⋮⋮</span>
                      <span className="item-name">{ticket['Ticket Name'] || ticket.name || 'Unnamed Ticket'}</span>
                      <button onClick={() => openEditTicket(index)} className="edit-btn">Edit</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="section-header">
        <h3>Coupons</h3>
        <button className="add-btn" onClick={() => openEditCoupon(null)}>+ New Coupon</button>
      </div>

      <div className="item-list">
        {coupons.map((coupon, index) => (
          <div key={index} className="item-card">
            <span className="item-name">
              <span className="clickable" onClick={() => copyToClipboard(coupon['Coupon Code'] || coupon.code)}>
                {coupon['Coupon Code'] || coupon.code || 'Unnamed Coupon'}
              </span>{' '}
              ({coupon['Linked Ticket'] || coupon.linkedTicket || 'No Ticket'})
            </span>
            <button onClick={() => openEditCoupon(index)} className="edit-btn">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingTab;