import React, { useState, useEffect } from 'react';
import EventDetailsTab from './EventDetailsTab';
import PricingTab from './PricingTab';
import MoreSettingsTab from './MoreSettingsTab';
import TicketFormModal from './TicketFormModal';
import CouponFormModal from './CouponFormModal';
import { fetchEventById, fetchFacilitators, fetchCalendars, saveEvent, deleteEvent, duplicateEvent } from './api';
import { generateCouponCode } from './utils';
import './EventEditorModal.css';

const EventEditorModal = ({ eventId, onClose, refreshEvents, onSave }) => {
  const [eventData, setEventData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Draft',
    facilitators: [],
    calendar: '',
    tickets: [],
    coupons: [],
  });

  const [facilitatorsList, setFacilitatorsList] = useState([]);
  const [calendarsList, setCalendarsList] = useState([]);

  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicketIndex, setEditingTicketIndex] = useState(null);

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponIndex, setEditingCouponIndex] = useState(null);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
    loadFacilitators();
    loadCalendars();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      console.log('Loading eventId:', eventId); // ADD THIS LINE
      const data = await fetchEventById(eventId);
      console.log('Fetched event data:', data); // ADD THIS LINE
      if (data) {
        setEventData(prev => ({
          ...prev,
          name: data['Event Title'] || '',
          startDate: data['Start Date'] || '',
          endDate: data['End Date'] || '',
          description: data['Description'] || '',
          status: data['Published'] || 'Draft',
          format: data['Format'] || 'Online',
          location: data['Location'] || '',
          locationDescription: data['Location Description'] || '',
          timeFormat: data['Time Format'] || 'ampm',
          // you can also map tickets, vendors etc later
        }));
      }
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const loadFacilitators = async () => {
    try {
      const data = await fetchFacilitators();
      setFacilitatorsList(data);
    } catch (error) {
      console.error('Error loading facilitators:', error);
    }
  };

  const loadCalendars = async () => {
    try {
      const data = await fetchCalendars();
      setCalendarsList(data);
    } catch (error) {
      console.error('Error loading calendars:', error);
    }
  };

  const handleFieldChange = (field, value) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
    autoSave({ ...eventData, [field]: value });
  };

  const handleTicketChange = (updatedTickets) => {
    setEventData((prev) => ({ ...prev, tickets: updatedTickets }));
    autoSave({ ...eventData, tickets: updatedTickets });
  };

  const handleCouponChange = (updatedCoupons) => {
    setEventData((prev) => ({ ...prev, coupons: updatedCoupons }));
    autoSave({ ...eventData, coupons: updatedCoupons });
  };

  const autoSave = async (updatedData) => {
    if (!eventId) return;
    try {
      setIsSaving(true);
      await saveEvent(eventId, updatedData);
    } catch (error) {
      console.error('Error autosaving event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('PATCHing to Airtable with:', eventData);
      await saveEvent(eventId, eventData);
  
      if (typeof onSave === 'function') {
        onSave(); // ✅ safe usage
      } else if (typeof refreshEvents === 'function') {
        refreshEvents(); // ✅ fallback
      }
  
      if (typeof onClose === 'function') {
        onClose(); // ✅ closes modal
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = prompt('Type DELETE to confirm deletion.');
    if (confirmDelete !== 'DELETE') {
      alert('Deletion cancelled.');
      return;
    }
    try {
      await deleteEvent(eventId);
      refreshEvents();
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleDuplicate = async () => {
    const newTitle = prompt('Enter new title for duplicated event:');
    if (!newTitle) {
      alert('Duplication cancelled.');
      return;
    }
    try {
      await duplicateEvent(eventData, newTitle);
      refreshEvents();
      alert('Event duplicated successfully.');
    } catch (error) {
      console.error('Error duplicating event:', error);
    }
  };

  const openEditTicket = (index) => {
    setEditingTicketIndex(index);
    setShowTicketModal(true);
  };

  const openEditCoupon = (index) => {
    setEditingCouponIndex(index);
    setShowCouponModal(true);
  };

  const closeTicketModal = () => {
    setEditingTicketIndex(null);
    setShowTicketModal(false);
  };

  const closeCouponModal = () => {
    setEditingCouponIndex(null);
    setShowCouponModal(false);
  };

  return (
    <div className="event-editor-modal">
      <div className="modal-header">
        <h2>{eventId ? 'Edit Event' : 'New Event'}</h2>
        <button onClick={onClose}>X</button>
      </div>
  
      <div className="tabs">
        <button
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Event Details
        </button>
        <button
          className={activeTab === 'pricing' ? 'active' : ''}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing & Coupons
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          More Settings
        </button>
      </div>
  
      <div className="tab-container">
        {activeTab === 'details' && (
          <EventDetailsTab
            eventData={eventData}
            facilitatorsList={facilitatorsList}
            calendarsList={calendarsList}
            onFieldChange={handleFieldChange}
          />
        )}
        {activeTab === 'pricing' && (
          <PricingTab
            tickets={eventData.tickets}
            coupons={eventData.coupons}
            onTicketsChange={handleTicketChange}
            onCouponsChange={handleCouponChange}
            openEditTicket={openEditTicket}
            openEditCoupon={openEditCoupon}
          />
        )}
        {activeTab === 'settings' && (
          <MoreSettingsTab
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        )}
      </div>
  
      {showTicketModal && (
        <TicketFormModal
          ticket={eventData.tickets[editingTicketIndex]}
          onSave={(updatedTicket) => {
            const newTickets = [...eventData.tickets];
            newTickets[editingTicketIndex] = updatedTicket;
            handleTicketChange(newTickets);
            closeTicketModal();
          }}
          onClose={closeTicketModal}
        />
      )}
  
      {showCouponModal && (
        <CouponFormModal
          coupon={eventData.coupons[editingCouponIndex]}
          onSave={(updatedCoupon) => {
            const newCoupons = [...eventData.coupons];
            newCoupons[editingCouponIndex] = updatedCoupon;
            handleCouponChange(newCoupons);
            closeCouponModal();
          }}
          onClose={closeCouponModal}
        />
      )}
  
      <div className="modal-footer">
        {isSaving ? (
          <span>Saving...</span>
        ) : (
          <button type="button" onClick={handleSave}>
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default EventEditorModal;