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
  saveTickets,
  saveCoupons,
  deleteEvent,
  duplicateEvent,
  deleteTicket as deleteTicketFromAirtable,
  fetchTicketsByIds,
  fetchCouponsByIds,
  createTicket,
} from './api';
import './EventEditorModal.css';

const EventEditorModal = ({
  eventId,
  onClose,
  onSave,
  pendingEventSwitch,
  clearPendingEventSwitch,
  openEditor,
  setHasUnsavedChanges,
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
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponIndex, setEditingCouponIndex] = useState(null);

  const openEditTicket = (index = null) => {
    setEditingTicketIndex(index);
    setShowTicketModal(true);
  };

  const openEditCoupon = (index = null) => {
    setEditingCouponIndex(index);
    setShowCouponModal(true);
  };

  const deleteTicket = async (index) => {
    const ticket = eventData.tickets[index];
    const ticketId = ticket?.id;
  
    if (!ticketId) return;
  
    // Find linked coupons
    const linkedCoupons = eventData.coupons.filter(c => c.linkedTicket === ticketId);
  
    let confirmed = true;
    if (linkedCoupons.length > 0) {
      confirmed = window.confirm(
        `This ticket is linked to ${linkedCoupons.length} coupon(s). Deleting it will also remove those. Proceed?`
      );
    }
  
    if (!confirmed) return;
  
    // Delete coupons from Airtable
    for (const coupon of linkedCoupons) {
      if (coupon.id) {
        try {
          await deleteCoupon(coupon.id);
        } catch (err) {
          console.warn(`❌ Failed to delete coupon ${coupon.code}:`, err);
        }
      }
    }

   // Delete ticket from Airtable
      try {
        console.log('🧨 Deleting ticket from Airtable:', ticketId);
        await deleteTicketFromAirtable(ticketId);
      } catch (err) {
        console.error(`❌ Failed to delete ticket:`, err);
        return;
      }
  
    // Update local state
    const updatedTickets = [...eventData.tickets];
    updatedTickets.splice(index, 1);
  
    const updatedCoupons = eventData.coupons.filter(c => c.linkedTicket !== ticketId);
  
    handleTicketChange(updatedTickets);
    handleCouponChange(updatedCoupons);
  };

  const deleteCoupon = async (index) => {
    const coupon = eventData.coupons[index];
    if (coupon?.id) {
      try {
        await deleteCoupon(coupon.id);
      } catch (err) {
        alert('Failed to delete coupon from Airtable.');
        return;
      }
    }
  
    const updated = [...eventData.coupons];
    updated.splice(index, 1);
    handleCouponChange(updated);
  };

  const generateSlug = (title = '') => {
    const cleanTitle = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').substring(0, 30);
    const randomPart = Math.random().toString(16).substring(2, 8);
    return `${cleanTitle}-${randomPart}`;
  };

  useEffect(() => {
    if (eventId) loadEvent();
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
    console.log('🔍 loadEvent() triggered with eventId:', eventId);

    try {
      const data = await fetchEventById(eventId);
      const allFacilitators = await fetchFacilitators();
      const allCalendars = await fetchCalendars();
      setFacilitatorsList(allFacilitators);
      setCalendarsList(allCalendars);

      const rawCalendarIds = Array.isArray(data['Calendar ID']) ? data['Calendar ID'] : [data['Calendar ID']];
      const rawFacilitatorIds = Array.isArray(data['Host ID']) ? data['Host ID'] : [data['Host ID']];

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
        status: data['Published'] ? 'Published' : 'Draft',
        facilitationLanguage: data['Facilitation Language'] || 'English',
        frontendLanguage: data['Page Language'] || 'ENG',
        timeZone: data['Time Zone'] || 'Europe/Amsterdam',
        calendarVisible: data['Calendar Visible'] === true,
        testMode: data['Test Mode'] === true,
        tags: data['Tags'] || '',
        slug: data['Slug'] || '',
        facilitators: rawFacilitatorIds.map(id => allFacilitators.find(f => f.id === id)).filter(Boolean),
        calendar: rawCalendarIds.map(id => allCalendars.find(c => c.id === id)).filter(Boolean),
        tickets: Array.isArray(data['Ticket ID']) ? data['Ticket ID'] : [],
        coupons: Array.isArray(data['Coupon ID']) ? data['Coupon ID'] : [],
      };

      console.log('🧾 Raw Coupon IDs:', data['Coupon ID']);

      if (mappedData.tickets.length > 0) {
        const validTicketIds = mappedData.tickets.map(id => typeof id === 'string' ? id.trim() : '').filter(Boolean);
        mappedData.tickets = await fetchTicketsByIds(validTicketIds);
      }

      if (mappedData.coupons.length > 0) {
        const validCouponIds = mappedData.coupons.map(id => typeof id === 'string' ? id.trim() : '').filter(Boolean);
        console.log('📤 Fetching coupons with IDs:', validCouponIds);
        mappedData.coupons = await fetchCouponsByIds(validCouponIds);
        console.log('✅ Loaded coupons:', mappedData.coupons);
      }

      setEventData(mappedData);
      setOriginalData(mappedData);
    } catch (error) {
      console.error('❌ Error loading event:', error);
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

      if (!eventData.slug || eventData.slug.trim() === '') {
        const generatedSlug = generateSlug(eventData.name);
        eventData.slug = generatedSlug;
      }

      console.log('🔄 Saving Event:', eventData);

      await saveTickets(eventData.tickets, eventId);

      const createdCoupons = await saveCoupons(eventData.coupons, eventId);
      const allCoupons = [...(eventData.coupons || [])];

      createdCoupons?.forEach((created) => {
        const existingIndex = allCoupons.findIndex(c => !c.id && c.code === created['Coupon Code']);
        if (existingIndex !== -1) {
          allCoupons[existingIndex] = { ...allCoupons[existingIndex], id: created.id };
        }
      });

      eventData.coupons = allCoupons;

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

  const saveNewCouponToAirtable = async (couponData) => {
    try {
      const result = await saveCoupons([{ ...couponData }], eventId);
      if (result && result.length > 0) {
        return { ...couponData, id: result[0].id };
      }
    } catch (error) {
      console.error('❌ Failed to save coupon to Airtable:', error);
      throw error;
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
            deleteTicket={deleteTicket}
            deleteCoupon={deleteCoupon}
            availableTickets={eventData.tickets || []}
          />
        )}
        {activeTab === 'settings' && (
          <MoreSettingsTab
            eventData={eventData}
            onFieldChange={handleFieldChange}
            calendarsList={calendarsList}
            onDelete={() => {
              if (window.confirm('Delete this event?')) deleteEvent(eventId).then(onClose);
            }}
            onDuplicate={() => {
              const title = prompt('New title?');
              if (title) duplicateEvent(eventData, title).then(() => alert('Duplicated'));
            }}
          />
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
          onSave={async (updatedTicket) => {
            const newTickets = [...(eventData.tickets || [])];
            if (editingTicketIndex !== null) {
              newTickets[editingTicketIndex] = updatedTicket;
            } else {
              const created = await createTicket(updatedTicket, eventId);
              if (created?.id) {
                newTickets.push({ ...updatedTicket, id: created.id });
              }
            }
            handleTicketChange(newTickets);
            setShowTicketModal(false);
            setEditingTicketIndex(null);
          }}
          onClose={() => {
            setShowTicketModal(false);
            setEditingTicketIndex(null);
          }}
          onDelete={() => {
            if (editingTicketIndex !== null) {
              deleteTicket(editingTicketIndex);
              setShowTicketModal(false);
              setEditingTicketIndex(null);
            }
          }}
        />
      )}

      {showCouponModal && (
        <CouponFormModal
          coupon={editingCouponIndex !== null ? eventData.coupons[editingCouponIndex] : null}
          availableTickets={eventData.tickets || []}
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
          onDelete={() => {
            if (editingCouponIndex !== null) {
              deleteCoupon(editingCouponIndex);
              setShowCouponModal(false);
              setEditingCouponIndex(null);
            }
          }}
          saveNewCouponToAirtable={saveNewCouponToAirtable}
        />
      )}
    </div>
  );
};

export default EventEditorModal;