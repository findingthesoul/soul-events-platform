import React, { useState, useEffect } from 'react';
import EventDetailsTab from './EventDetailsTab';
import PricingTab from './PricingTab';
import MoreSettingsTab from './MoreSettingsTab';
import TicketFormModal from './TicketFormModal';
import CouponFormModal from './CouponFormModal';
import { fetchEventById, fetchFacilitators, fetchCalendars, saveEvent, deleteEvent, duplicateEvent } from './api';
import './EventEditorModal.css';

const EventEditorModal = ({ eventId, onClose, refreshEvents }) => {
  const [eventData, setEventData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [facilitatorsList, setFacilitatorsList] = useState([]);
  const [calendarsList, setCalendarsList] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [nextTab, setNextTab] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicketIndex, setEditingTicketIndex] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponIndex, setEditingCouponIndex] = useState(null);

  useEffect(() => {
    if (eventId) loadEvent();
    loadFacilitators();
    loadCalendars();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const data = await fetchEventById(eventId);
      console.log('Fetched Airtable event:', data); // optional: for debugging
  
      if (data) {
        const mappedData = {
          name: data['Event Title'] || '',
          startDate: data['Start Date'] || '',
          endDate: data['End Date'] || '',
          startTime: data['Start Time (Start Date)'] || '',
          endTime: data['End Time (Start Date)'] || '',
          startTimeEndDate: data['Start Time (End Date)'] || '',
          endTimeEndDate: data['End Time (End Date)'] || '',
          timeFormat: data['Time Format'] || 'ampm',
          description: data['Description'] || '',
          format: data['Format'] || 'Online',
          location: data['Location'] || '',
          locationDescription: data['Location Description'] || '',
          locationUrl: data['Zoom link'] || '',              // Make sure field name matches Airtable
          facilitators: data['Facilitators'] || [],
          calendar: data['Calendar'] || '',
          tickets: data['Tickets'] || [],
          coupons: data['Coupons'] || [],
          status: data['Published'] || 'Draft',
        };
  
        setEventData(mappedData);
        setOriginalData(mappedData);
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
    setEventData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTicketChange = (updatedTickets) => {
    setEventData(prev => ({ ...prev, tickets: updatedTickets }));
    setHasUnsavedChanges(true);
  };

  const handleCouponChange = (updatedCoupons) => {
    setEventData(prev => ({ ...prev, coupons: updatedCoupons }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveEvent(eventId, eventData);
      setOriginalData(eventData);
      setHasUnsavedChanges(false);
      refreshEvents();
      if (pendingClose) onClose();
      if (nextTab) {
        setActiveTab(nextTab);
        setNextTab(null);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
      setPendingClose(false);
    }
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      setShowConfirm(true);
      setPendingClose(true);
    } else {
      onClose();
    }
  };

  const handleTabSwitch = (tabName) => {
    if (tabName === activeTab) return;
    if (hasUnsavedChanges) {
      setNextTab(tabName);
      setShowConfirm(true);
    } else {
      setActiveTab(tabName);
    }
  };

  const handleConfirmDiscard = () => {
    setShowConfirm(false);
    setHasUnsavedChanges(false);
    if (pendingClose) onClose();
    if (nextTab) {
      setActiveTab(nextTab);
      setNextTab(null);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = prompt('Type DELETE to confirm deletion.');
    if (confirmDelete !== 'DELETE') return;
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
    if (!newTitle) return;
    try {
      await duplicateEvent(eventData, newTitle);
      refreshEvents();
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
        <button onClick={handleCloseRequest}>X</button>
      </div>

      <div className="tabs">
        <button className={activeTab === 'details' ? 'active' : ''} onClick={() => handleTabSwitch('details')}>Event Details</button>
        <button className={activeTab === 'pricing' ? 'active' : ''} onClick={() => handleTabSwitch('pricing')}>Pricing & Coupons</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleTabSwitch('settings')}>More Settings</button>
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
            eventData={eventData}
            onFieldChange={handleFieldChange}
            calendarsList={calendarsList}
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
        <button
          type="button"
          className={hasUnsavedChanges ? 'unsaved' : 'saved'}
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
        >
          {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
        </button>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>You have unsaved changes. What would you like to do?</p>
            <button onClick={handleSave}>Save Changes</button>
            <button onClick={() => setShowConfirm(false)}>Cancel</button>
            <button onClick={handleConfirmDiscard}>Discard Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventEditorModal;
