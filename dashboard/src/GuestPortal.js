import React, { useState, useEffect } from 'react';
import {
  fetchRegistrationsByEmail,
  fetchEventsByIds,
} from './dashboard/EventEditor/api';
import './GuestPortal.css';

const STATUS_LABELS = {
  enrolled: 'Enrolled',
  accepted: 'Accepted',
  waitlisted: 'Waitlisted',
  cancelled: 'Cancelled',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const GuestPortal = ({ guestEmail, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const registrations = await fetchRegistrationsByEmail(guestEmail);
        const allEventIds = [...new Set(registrations.flatMap((r) => r.eventIds))];
        const events = await fetchEventsByIds(allEventIds);

        const now = new Date();
        const upcomingList = [];
        const pastList = [];

        events.forEach((ev) => {
          const startDate = new Date(ev.fields['Start Date'] || ev.fields['Start Date']);
          const reg = registrations.find((r) => r.eventIds.includes(ev.id));
          const row = {
            id: ev.id,
            title: ev.fields['Event Title'] || 'Untitled',
            startDate: ev.fields['Start Date'],
            location: ev.fields['Location'] || '',
            status: reg?.status || 'enrolled',
            checkedIn: reg?.checkedIn || false,
            certificateIssued: reg?.certificateIssued || false,
          };
          if (isNaN(startDate) || startDate >= now) {
            upcomingList.push(row);
          } else {
            pastList.push(row);
          }
        });

        upcomingList.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        pastList.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        setUpcoming(upcomingList);
        setPast(pastList);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [guestEmail]);

  return (
    <div className="guest-portal">
      <div className="guest-portal-header">
        <h1>My Events</h1>
        <div className="guest-portal-meta">
          <span className="guest-email">{guestEmail}</span>
          <button className="logout-link" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {loading ? (
        <p className="portal-loading">Loading your events…</p>
      ) : (
        <>
          {/* ── Upcoming ── */}
          <section className="portal-section">
            <h2 className="portal-section-title">Upcoming Events</h2>
            {upcoming.length === 0 ? (
              <p className="portal-empty">No upcoming events.</p>
            ) : (
              <div className="portal-event-list">
                {upcoming.map((ev) => (
                  <EventCard key={ev.id} ev={ev} />
                ))}
              </div>
            )}
          </section>

          {/* ── Past ── */}
          <section className="portal-section">
            <h2 className="portal-section-title">Past Events</h2>
            {past.length === 0 ? (
              <p className="portal-empty">No past events.</p>
            ) : (
              <div className="portal-event-list">
                {past.map((ev) => (
                  <EventCard key={ev.id} ev={ev} past />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const EventCard = ({ ev, past }) => (
  <div className={`portal-event-card${past ? ' past' : ''}`}>
    <div className="portal-event-info">
      <h3 className="portal-event-title">{ev.title}</h3>
      <p className="portal-event-date">{formatDate(ev.startDate)}</p>
      {ev.location && <p className="portal-event-location">📍 {ev.location}</p>}
    </div>
    <div className="portal-event-badges">
      <span className={`status-badge status-${ev.status}`}>
        {STATUS_LABELS[ev.status] || ev.status}
      </span>
      {ev.checkedIn && <span className="badge badge-checkin">✓ Attended</span>}
      {ev.certificateIssued && <span className="badge badge-cert">🎓 Certificate</span>}
    </div>
  </div>
);

export default GuestPortal;
