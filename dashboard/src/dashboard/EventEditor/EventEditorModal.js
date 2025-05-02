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

  const deleteTicket = (index) => {
    const updated = [...eventData.tickets];
    updated.splice(index, 1);
    handleTicketChange(updated);
  };

  const deleteCoupon = (index) => {
    const updated = [...eventData.coupons];
    updated.splice(index, 1);
    handleCouponChange(updated);
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
      console.log("🧩 Field names from Airtable:", Object.keys(data));

      const allFacilitators = await fetchFacilitators();
      setFacilitatorsList(allFacilitators);

      const allCalendars = await fetchCalendars();
      setCalendarsList(allCalendars);

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
        status: data['Published'] || 'Draft',
        facilitators: (data['Host ID'] || []).map((id) =>
          allFacilitators.find((f) => f.id === id)
        ).filter(Boolean),
        calendar: (data['Calendar'] || []).map((id) =>
          allCalendars.find((c) => c.id === id)
        ).filter(Boolean),
        tickets: Array.isArray(data['Ticket ID']) ? data['Ticket ID'] : [],
        coupons: Array.isArray(data['Coupon ID']) ? data['Coupon ID'] : [],
      };

      if (mappedData.tickets.length > 0) {
        const ticketRecords = await fetchTicketsByIds(mappedData.tickets);
        mappedData.tickets = ticketRecords;
      } else {
        mappedData.tickets = [];
      }

      if (mappedData.coupons.length > 0) {
        const couponRecords = await fetchCouponsByIds(mappedData.coupons);
        mappedData.coupons = couponRecords;
      } else {
        mappedData.coupons = [];
      }

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
      {/* The rest of the component remains the same */}
    </div>
  );
};

export default EventEditorModal;