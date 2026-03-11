import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchRegistrationsByEvent,
  updateRegistration,
  deleteRegistration,
  createRegistration,
} from './api';
import GuestPopup from './GuestPopup';
import './GuestsTab.css';

const STATUS_LABELS = {
  enrolled: 'Enrolled',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  cancelled: 'Cancelled',
};

const GuestsTab = ({ eventId, vendorId, hasCertificate }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const regs = await fetchRegistrationsByEvent(eventId);
    setRegistrations(regs);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === registrations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(registrations.map((r) => r.id)));
    }
  };

  // ── Check-in ───────────────────────────────────────────────────────────────
  const handleCheckIn = async (e, reg) => {
    e.stopPropagation();
    const updated = await updateRegistration(reg.id, { checkedIn: !reg.checkedIn });
    setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? updated : r)));
  };

  // ── Bulk: send email ───────────────────────────────────────────────────────
  const handleBulkEmail = () => {
    const recipients = registrations
      .filter((r) => selected.has(r.id) && r.email)
      .map((r) => r.email)
      .join(',');
    if (recipients) window.open(`mailto:${recipients}`, '_blank');
  };

  // ── Bulk: provide certificate ──────────────────────────────────────────────
  const handleBulkCertificate = async () => {
    if (!window.confirm(`Mark certificate as issued for ${selected.size} guest(s)?`)) return;
    setSaving(true);
    await Promise.all(
      [...selected].map((id) => updateRegistration(id, { certificateIssued: true }))
    );
    await load();
    setSelected(new Set());
    setSaving(false);
  };

  // ── Add guest ──────────────────────────────────────────────────────────────
  const handleAddGuest = async (data) => {
    setSaving(true);
    try {
      const reg = await createRegistration(data, eventId, vendorId);
      setRegistrations((prev) => [...prev, reg]);
      setAddPopupOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit guest ─────────────────────────────────────────────────────────────
  const handleEditGuest = async (data) => {
    setSaving(true);
    try {
      const updated = await updateRegistration(editGuest.id, data);
      setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditGuest(null);
    } finally {
      setSaving(false);
    }
  };

  // ── Unregister ─────────────────────────────────────────────────────────────
  const handleUnregister = async (id) => {
    if (!window.confirm('Remove this guest from the event?')) return;
    await deleteRegistration(id);
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    setEditGuest(null);
  };

  const allChecked = registrations.length > 0 && selected.size === registrations.length;
  const someChecked = selected.size > 0;

  return (
    <div className="guests-tab">
      {/* ── Toolbar ── */}
      <div className="guests-toolbar">
        <button className="add-btn" onClick={() => setAddPopupOpen(true)}>+ Add Guest</button>

        {someChecked && (
          <div className="guests-bulk-actions">
            <span className="guests-selected-count">{selected.size} selected</span>
            <button className="bulk-btn" onClick={handleBulkEmail}>✉ Send Email</button>
            {hasCertificate && (
              <button className="bulk-btn" onClick={handleBulkCertificate} disabled={saving}>
                🎓 Provide Certificate
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <p className="guests-loading">Loading guests…</p>
      ) : registrations.length === 0 ? (
        <p className="guests-empty">No guests yet. Click "+ Add Guest" to register someone.</p>
      ) : (
        <table className="guests-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleSelectAll}
                  title="Select all"
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Organisation</th>
              <th>Status</th>
              <th>Check-in</th>
              {hasCertificate && <th>Certificate</th>}
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr
                key={reg.id}
                className={`guest-row${selected.has(reg.id) ? ' selected' : ''}`}
                onClick={() => setEditGuest(reg)}
              >
                <td onClick={(e) => { e.stopPropagation(); toggleSelect(reg.id); }}>
                  <input
                    type="checkbox"
                    checked={selected.has(reg.id)}
                    onChange={() => {}}
                    readOnly
                  />
                </td>
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.organisation}</td>
                <td>
                  <span className={`status-badge status-${reg.status}`}>
                    {STATUS_LABELS[reg.status] || reg.status}
                  </span>
                </td>
                <td onClick={(e) => handleCheckIn(e, reg)}>
                  <span className={`checkin-toggle${reg.checkedIn ? ' checked' : ''}`} title="Toggle check-in">
                    {reg.checkedIn ? '✓' : '○'}
                  </span>
                </td>
                {hasCertificate && (
                  <td>
                    <span className={reg.certificateIssued ? 'cert-yes' : 'cert-no'}>
                      {reg.certificateIssued ? '✓' : '—'}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Add popup ── */}
      {addPopupOpen && (
        <GuestPopup
          guest={null}
          eventId={eventId}
          onSave={handleAddGuest}
          onClose={() => setAddPopupOpen(false)}
          saving={saving}
        />
      )}

      {/* ── Edit popup ── */}
      {editGuest && (
        <GuestPopup
          guest={editGuest}
          eventId={eventId}
          onSave={handleEditGuest}
          onClose={() => setEditGuest(null)}
          onUnregister={() => handleUnregister(editGuest.id)}
          saving={saving}
        />
      )}
    </div>
  );
};

export default GuestsTab;
