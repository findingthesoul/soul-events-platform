import React, { useState, useEffect } from 'react';
import EventDetailsTab from './EventDetailsTab';
import PricingTab from './PricingTab';
import MoreSettingsTab from './MoreSettingsTab';
import TicketFormModal from './TicketFormModal';
import CouponFormModal from './CouponFormModal';
import {
  fetchEventById,
  fetchFacilitators,
  fetchCalendars,
  saveEvent,
  deleteEvent,
  duplicateEvent,
  fetchTicketsByIds,
  fetchCouponsByIds
} from './api';
import './EventEditorModal.css';

const EventEditorModal = ({
  eventId,
  onClose,
  onSave,
  pendingEventSwitch,
  clearPendingEventSwitch,
  openEditor,
  setHasUnsavedChanges
}) => {
  const [eventData, setEventData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [facilitatorsList, setFacilitatorsList] = useState([]);
  const [calendarsList, setCalendarsList] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [nextTab, setNextTab] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setLocalUnsaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicketIndex, setEditingTicketIndex] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);  // ✅ This is missing
  const [editingCouponIndex, setEditingCouponIndex] = useState(null);
  const openEditTicket = (index = null) => {
    setEditingTicketIndex(index); 
    setShowTicketModal(true);
  };
  const openEditCoupon = (index = null) => {
    setEditingCouponIndex(index); 
    setShowCouponModal(true);
  };

  useEffect(() => {
    if (eventId) loadEvent();
    loadFacilitators();
    loadCalendars();
  }, [eventId]);

  useEffect(() => {
    if (pendingEventSwitch && hasUnsavedChanges) {
      setShowConfirm(true);
    } else if (pendingEventSwitch && !hasUnsavedChanges) {
      openEditor(pendingEventSwitch);
      clearPendingEventSwitch();
    }
  }, [pendingEventSwitch, hasUnsavedChanges]);

  const loadEvent = async () => {
    try {
      const data = await fetchEventById(eventId);
      console.log('🔍 Raw event data from Airtable:', data);
  
      if (!data) {
        console.warn('⚠️ No data returned for event ID:', eventId);
        return;
      }
  
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
        locationUrl: data['Zoom link'] || '',
        facilitators: data['Facilitators'] || [],
        calendar: data['Calendar'] || '',
        tickets: Array.isArray(data['Ticket ID']) ? data['Ticket ID'] : [],
        coupons: Array.isArray(data['Coupon ID']) ? data['Coupon ID'] : [],
        status: data['Published'] || 'Draft',
      };
    
      // 🔄 Fetch full ticket and coupon data

      // 🔄 Fetch full ticket and coupon data if IDs are present
      if (Array.isArray(mappedData.tickets) && mappedData.tickets.length > 0) {
        try {
          const ticketRecords = await fetchTicketsByIds(mappedData.tickets);
          mappedData.tickets = ticketRecords;
        } catch (err) {
          console.warn('⚠️ Failed to fetch linked tickets:', err.message);
        }
      } else {
        mappedData.tickets = [];
      }

      if (Array.isArray(mappedData.coupons) && mappedData.coupons.length > 0) {
        try {
          const couponRecords = await fetchCouponsByIds(mappedData.coupons);
          mappedData.coupons = couponRecords;
        } catch (err) {
          console.warn('⚠️ Failed to fetch linked coupons:', err.message);
        }
      } else {
        mappedData.coupons = [];
      }

      setEventData(mappedData);
      setOriginalData(mappedData);

      setEventData(mappedData);
      setOriginalData(mappedData);
    } catch (error) {
      console.error('❌ Error loading event:', error);
    }
  };
  

  const loadFacilitators = async () => {
    try {
      const data = await fetchFacilitators();
      setFacilitatorsList(data);
    } catch (err) {
      console.error('Error loading facilitators:', err);
    }
  };

  const loadCalendars = async () => {
    try {
      const data = await fetchCalendars();
      setCalendarsList(data);
    } catch (err) {
      console.error('Error loading calendars:', err);
    }
  };

  const updateUnsaved = (updated) => {
    const changed = JSON.stringify(updated) !== JSON.stringify(originalData);
    setLocalUnsaved(changed);
    if (setHasUnsavedChanges) setHasUnsavedChanges(changed);
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...eventData, [field]: value };
    setEventData(updated);
    updateUnsaved(updated);
  };

  const handleTicketChange = (updatedTickets) => {
    const updated = { ...eventData, tickets: updatedTickets };
    setEventData(updated);
    updateUnsaved(updated);
  };

  const handleCouponChange = (updatedCoupons) => {
    const updated = { ...eventData, coupons: updatedCoupons };
    setEventData(updated);
    updateUnsaved(updated);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveEvent(eventId, eventData);
      setOriginalData(eventData);
      setLocalUnsaved(false);
      if (setHasUnsavedChanges) setHasUnsavedChanges(false);
      if (typeof onSave === 'function') onSave();
      if (pendingEventSwitch) {
        clearPendingEventSwitch();
        openEditor(pendingEventSwitch);
      }
      if (nextTab) {
        setActiveTab(nextTab);
        setNextTab(null);
      }
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
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
    setLocalUnsaved(false);
    if (setHasUnsavedChanges) setHasUnsavedChanges(false);
    if (pendingClose) onClose();
    if (nextTab) {
      setActiveTab(nextTab);
      setNextTab(null);
    }
    if (pendingEventSwitch) {
      clearPendingEventSwitch();
      openEditor(pendingEventSwitch);
    }
  };

  return (
    <div className="event-editor-modal">
      <div className="modal-header">
        <h2>{eventId ? 'Edit Event' : 'New Event'}</h2>
        <button onClick={handleCloseRequest}>×</button>
      </div>

      <div className="tabs">
        <button className={activeTab === 'details' ? 'active' : ''} onClick={() => handleTabSwitch('details')}>Event Details</button>
        <button className={activeTab === 'pricing' ? 'active' : ''} onClick={() => handleTabSwitch('pricing')}>Pricing & Coupons</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleTabSwitch('settings')}>More Settings</button>
      </div>

      <div className="tab-container">
        {activeTab === 'details' && (
          <EventDetailsTab eventData={eventData} facilitatorsList={facilitatorsList} calendarsList={calendarsList} onFieldChange={handleFieldChange} />
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
          <MoreSettingsTab eventData={eventData} onFieldChange={handleFieldChange} calendarsList={calendarsList} />
        )}
      </div>

      <div className="modal-footer">
        <button type="button" className={hasUnsavedChanges ? 'unsaved' : 'saved'} onClick={handleSave} disabled={!hasUnsavedChanges || isSaving}>
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

      {showTicketModal && (
          <TicketFormModal
            ticket={editingTicketIndex !== null ? eventData.tickets[editingTicketIndex] : null}
            onSave={(updatedTicket) => {
              const newTickets = [...(eventData.tickets || [])];
              if (editingTicketIndex !== null) {
                newTickets[editingTicketIndex] = updatedTicket;
              } else {
                newTickets.push(updatedTicket);
              }
              handleTicketChange(newTickets);
              setShowTicketModal(false);
              setEditingTicketIndex(null);
            }}
            onClose={() => {
              setShowTicketModal(false);
              setEditingTicketIndex(null);
            }}
          />
        )}
       {showCouponModal && (
        <CouponFormModal
          coupon={editingCouponIndex !== null ? eventData.coupons[editingCouponIndex] : null}
          availableTickets={eventData.tickets || []}  // ✅ Pass available tickets
          onSave={(updatedCoupon) => {
            const newCoupons = [...(eventData.coupons || [])];
            if (editingCouponIndex !== null) {
              newCoupons[editingCouponIndex] = updatedCoupon;
            } else {
              newCoupons.push(updatedCoupon);
            }
            handleCouponChange(newCoupons);
            setShowCouponModal(false);
            setEditingCouponIndex(null);
          }}
          onClose={() => {
            setShowCouponModal(false);
            setEditingCouponIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default EventEditorModal;
