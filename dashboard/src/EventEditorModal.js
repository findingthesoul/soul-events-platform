import React, { useState, useEffect } from 'react';

export default function EventEditorModal({ event, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('event');
  const [eventData, setEventData] = useState({ ...event });

  useEffect(() => {
    if (event) setEventData({ ...event });
  }, [event]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl p-6 rounded shadow-xl relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-lg">✕</button>

        <h2 className="text-xl font-semibold mb-4">Edit Event: {event.title}</h2>

        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-4">
          {['event', 'guests', 'registration', 'more'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab ? 'border-b-2 border-indigo-500 font-medium' : 'text-gray-500'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'event' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={eventData.startDate || ''}
              onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="date"
              placeholder="End Date"
              value={eventData.endDate || ''}
              onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <textarea
              placeholder="Description"
              value={eventData.description || ''}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={eventData.image || ''}
              onChange={(e) => setEventData({ ...eventData, image: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <select
              value={eventData.format || 'online'}
              onChange={(e) => setEventData({ ...eventData, format: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>

            {eventData.format === 'online' ? (
              <input
                type="text"
                placeholder="Zoom Link"
                value={eventData.zoom || ''}
                onChange={(e) => setEventData({ ...eventData, zoom: e.target.value })}
                className="w-full border p-2 rounded"
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Google Maps URL"
                  value={eventData.location || ''}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Location Description"
                  value={eventData.locationDescription || ''}
                  onChange={(e) => setEventData({ ...eventData, locationDescription: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </>
            )}

            <input
              type="text"
              placeholder="Host (name or select)"
              value={eventData.host || ''}
              onChange={(e) => setEventData({ ...eventData, host: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        )}

        {activeTab !== 'event' && (
          <div className="text-sm text-gray-500">This tab is under construction 🚧</div>
        )}

        <div className="mt-6 text-right">
          <button onClick={() => console.log('Save event:', eventData)} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}