import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchRegistrationsByEmail,
  fetchEventsByIds,
  updateRegistration,
} from './api';
import './GuestPopup.css';

const STATUS_OPTIONS = [
  { value: 'enrolled',   label: 'Enrolled' },
  { value: 'accepted',   label: 'Accepted' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'cancelled',  label: 'Cancelled' },
];

function generatePassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const GuestPopup = ({ guest = null, eventId, onSave, onClose, onUnregister, saving }) => {
  const isEdit = !!guest;

  const [name, setName] = useState(guest?.name || '');
  const [email, setEmail] = useState(guest?.email || '');
  const [org, setOrg] = useState(guest?.organisation || '');
  const [status, setStatus] = useState(guest?.status || 'enrolled');
  const [error, setError] = useState('');

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Reset password
  const [resetSaving, setResetSaving] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Load cross-event history when editing
  const loadHistory = useCallback(async () => {
    if (!isEdit || !guest.email) return;
    setHistoryLoading(true);
    try {
      const regs = await fetchRegistrationsByEmail(guest.email);
      const otherRegs = regs.filter((r) => !r.eventIds.includes(eventId));
      const allEventIds = [...new Set(otherRegs.flatMap((r) => r.eventIds))];
      const events = await fetchEventsByIds(allEventIds);
      const eventMap = Object.fromEntries(events.map((e) => [e.id, e.fields['Event Title'] || e.id]));
      const rows = otherRegs.flatMap((r) =>
        r.eventIds.map((eid) => ({
          eventTitle: eventMap[eid] || eid,
          status: r.status,
          checkedIn: r.checkedIn,
        }))
      );
      setHistory(rows);
    } finally {
      setHistoryLoading(false);
    }
  }, [guest?.email, eventId, isEdit]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    setError('');
    onSave({ name: name.trim(), email: email.trim(), organisation: org.trim(), status });
  };

  const handleResetPassword = async () => {
    if (!guest?.id) return;
    const newPass = generatePassword();
    setResetSaving(true);
    try {
      await updateRegistration(guest.id, { password: newPass });
      setResetDone(true);
      const subject = encodeURIComponent('Your new login password');
      const body = encodeURIComponent(
        `Hi ${guest.name},\n\nYour new password is: ${newPass}\n\nPlease keep this safe.\n\nBest regards`
      );
      window.open(`mailto:${guest.email}?subject=${subject}&body=${body}`, '_blank');
      setTimeout(() => setResetDone(false), 3000);
    } finally {
      setResetSaving(false);
    }
  };

  return (
    <div className="guest-popup-overlay" onClick={onClose}>
      <div className="guest-popup" onClick={(e) => e.stopPropagation()}>
        <div className="guest-popup-header">
          <h3>{isEdit ? 'Guest Details' : 'Add Guest'}</h3>
          <button className="guest-popup-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="guest-popup-body">
          {/* ── Fields ── */}
          <div className="guest-popup-field">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoFocus
            />
          </div>

          <div className="guest-popup-field">
            <label>Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="guest-popup-field">
            <label>Organisation</label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Company / organisation"
            />
          </div>

          <div className="guest-popup-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="guest-popup-error">{error}</p>}

          {/* ── Meta (edit mode) ── */}
          {isEdit && (
            <div className="guest-popup-meta">
              <div className="guest-popup-meta-row">
                <span>Check-in</span>
                <span className={guest.checkedIn ? 'meta-positive' : 'meta-neutral'}>
                  {guest.checkedIn ? '✓ Checked in' : 'Not checked in'}
                </span>
              </div>
              <div className="guest-popup-meta-row">
                <span>Certificate</span>
                <span className={guest.certificateIssued ? 'meta-positive' : 'meta-neutral'}>
                  {guest.certificateIssued ? '✓ Issued' : 'Not issued'}
                </span>
              </div>
            </div>
          )}

          {/* ── Cross-event history ── */}
          {isEdit && (
            <div className="guest-popup-history">
              <h4>Other events attended</h4>
              {historyLoading ? (
                <p className="history-loading">Loading…</p>
              ) : history.length === 0 ? (
                <p className="history-empty">No other events found.</p>
              ) : (
                <ul className="history-list">
                  {history.map((row, i) => (
                    <li key={i} className="history-item">
                      <span className="history-event">{row.eventTitle}</span>
                      <span className={`status-badge status-${row.status}`}>{row.status}</span>
                      {row.checkedIn && <span className="history-checked">✓</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Footer actions ── */}
          <div className="guest-popup-footer">
            <div className="guest-popup-footer-left">
              {isEdit && (
                <>
                  <button
                    type="button"
                    className="reset-pwd-btn"
                    onClick={handleResetPassword}
                    disabled={resetSaving}
                    title="Generate a new password and email it to the guest"
                  >
                    {resetSaving ? 'Sending…' : resetDone ? '✓ Sent!' : '🔑 Reset Password'}
                  </button>
                  {onUnregister && (
                    <button
                      type="button"
                      className="unregister-btn"
                      onClick={onUnregister}
                      title="Remove this guest from the event"
                    >
                      Unregister
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="guest-popup-footer-right">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Guest'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestPopup;
