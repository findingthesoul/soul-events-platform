// EventEditorModal.js — All-in-one screen with grouped fields, fixed name/date, and one save button

import React, { useState, useEffect } from 'react';

export default function EventEditorModal({ event, isOpen, onClose }) {
  const [eventData, setEventData] = useState({ ...event });

  useEffect(() => {
    if (event) setEventData({ ...event });
  }, [event]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded shadow-xl relative max-h-screen overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-4 text-lg">✕</button>

        <h2 className="text-xl font-semibold mb-6">Edit Event</h2>

        {/* Fixed Top Fields */}
        <div className="sticky top-0 bg-white pb-4 z-10">
          <input type="text" placeholder="Name" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value })} className="w-full border p-2 rounded mb-2" />
          <input type="date" placeholder="Start Date" value={eventData.startDate || ''} onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })} className="w-full border p-2 rounded mb-4" />
        </div>

        {/* EVENT DETAILS */}
        <h3 className="text-lg font-semibold mb-2">Event Details</h3>
        <textarea placeholder="Description" value={eventData.description || ''} onChange={(e) => setEventData({ ...eventData, description: e.target.value })} className="w-full border p-2 rounded mb-2" />
        <input type="text" placeholder="Image URL" value={eventData.image || ''} onChange={(e) => setEventData({ ...eventData, image: e.target.value })} className="w-full border p-2 rounded mb-2" />
        <select value={eventData.format || 'online'} onChange={(e) => setEventData({ ...eventData, format: e.target.value })} className="w-full border p-2 rounded mb-2">
          <option value="online">Online</option>
          <option value="in-person">In-Person</option>
        </select>
        {eventData.format === 'online' ? (
          <input type="text" placeholder="Zoom Link" value={eventData.zoom || ''} onChange={(e) => setEventData({ ...eventData, zoom: e.target.value })} className="w-full border p-2 rounded mb-2" />
        ) : (
          <>
            <input type="text" placeholder="Google Maps URL" value={eventData.location || ''} onChange={(e) => setEventData({ ...eventData, location: e.target.value })} className="w-full border p-2 rounded mb-2" />
            <input type="text" placeholder="Location Description" value={eventData.locationDescription || ''} onChange={(e) => setEventData({ ...eventData, locationDescription: e.target.value })} className="w-full border p-2 rounded mb-2" />
          </>
        )}
        <input type="text" placeholder="Host (name or select)" value={eventData.host || ''} onChange={(e) => setEventData({ ...eventData, host: e.target.value })} className="w-full border p-2 rounded mb-4" />

        {/* GUESTS */}
        <h3 className="text-lg font-semibold mb-2">Guests Overview (coming soon)</h3>
        <p className="text-sm text-gray-500 mb-4">Fields like email, name, status, check-in and certificate will go here.</p>

        {/* REGISTRATION */}
        <h3 className="text-lg font-semibold mb-2">Registration Settings (coming soon)</h3>
        <p className="text-sm text-gray-500 mb-4">Fields for ticket tiers, prices, limits, and coupon codes will go here.</p>

        {/* MORE */}
        <h3 className="text-lg font-semibold mb-2">More (coming soon)</h3>
        <p className="text-sm text-gray-500 mb-6">Cloning, URLs, calendar links and more will be added here.</p>

        <div className="mt-6 text-right">

<button
  onClick={async () => {
    try {
      await fetch(`https://soul-events-platform-1.onrender.com/events/${eventData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      alert('✅ Event updated!');
      onClose(); // close modal
    } catch (err) {
      console.error('Update failed', err);
      alert('❌ Failed to update event');
    }
  }}
  className="bg-indigo-600 text-white px-6 py-2 rounded"
>
  Save
</button>

        </div>
      </div>
    </div>
  );
}
