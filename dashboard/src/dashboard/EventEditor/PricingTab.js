import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './PricingTab.css';
import { updateTicketOrderInAirtable } from './api';
import { ClipboardCopy, Trash2 } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';

const PricingTab = ({
  tickets = [],
  coupons = [],
  onTicketsChange,
  onCouponsChange,
  openEditTicket,
  openEditCoupon,
  deleteTicket,
  deleteCoupon,
  availableTickets = [],
}) => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(tickets);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    onTicketsChange(reordered);

    try {
      await updateTicketOrderInAirtable(reordered);
    } catch (err) {
      console.error('Failed to update sort order:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 1500);
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
            <div className="item-list" ref={provided.innerRef} {...provided.droppableProps}>
              {tickets.map((ticket, index) => (
                <Draggable key={ticket.id || index} draggableId={ticket.id || `ticket-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="item-card ticket-item"
                      ref={provided.innerRef}
                    >
                      <span className="drag-icon" {...provided.dragHandleProps}>⋮⋮</span>
                      <span className="item-name clickable" onClick={() => openEditTicket(index)}>
                        {ticket['Ticket Name'] || ticket.name || 'Unnamed Ticket'}
                      </span>
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
        {coupons.map((coupon, index) => {
          const code = coupon['Coupon Code'] || coupon.code || 'Unnamed Coupon';
          const linkedTicket = availableTickets.find(
            t => t.id === coupon['Linked Ticket'] || t.id === coupon.linkedTicket
          );
          return (
            <div key={index} className="item-card coupon-item">
              <span className="item-name clickable" onClick={() => openEditCoupon(index)}>
                {code}{' '}
                <span className="linked-ticket">
                  ({linkedTicket?.['Ticket Name'] || linkedTicket?.name || 'No Ticket'})
                </span>
              </span>
              <span
                className="copy-icon"
                onClick={() => copyToClipboard(code)}
                title="Copy code"
              >
                <ClipboardCopy size={16} color={copiedCode === code ? 'green' : 'gray'} />
              </span>
            </div>
          );
        })}
      </div>

      {deleteIndex !== null && (
        <DeleteConfirmModal
          onCancel={() => setDeleteIndex(null)}
          onConfirm={() => {
            deleteTicket(deleteIndex);
            setDeleteIndex(null);
          }}
          itemType="ticket"
        />
      )}
    </div>
  );
};

export default PricingTab;