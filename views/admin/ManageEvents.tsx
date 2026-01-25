import React, { useEffect, useMemo, useState } from 'react';
import { storage } from '../../services/storage';
import type { Event } from '../../types';

const emptyForm: Omit<Event, 'id'> = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  location: '',
  description: '',
  isPast: false,
  isVisible: true
};

export const ManageEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Event, 'id'>>(emptyForm);

  useEffect(() => {
    setEvents(storage.getEvents());
  }, []);

  const sorted = useMemo(() => {
    return events
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const resetForm = () => setForm(emptyForm);

  const beginCreate = () => {
    setError(null);
    setEditingId(null);
    resetForm();
    setIsCreating(true);
  };

  const beginEdit = (event: Event) => {
    setError(null);
    setIsCreating(true);
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      isPast: event.isPast,
      isVisible: event.isVisible
    });
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const saveAll = (next: Event[]) => {
    setEvents(next);
    storage.saveEvents(next);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this event?')) return;
    saveAll(events.filter(e => e.id !== id));
  };

  const handleToggleVisible = (id: string) => {
    const next = events.map(e => (e.id === id ? { ...e, isVisible: !e.isVisible } : e));
    saveAll(next);
  };

  const handleTogglePast = (id: string) => {
    const next = events.map(e => (e.id === id ? { ...e, isPast: !e.isPast } : e));
    saveAll(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError('Title is required');
    if (!form.location.trim()) return setError('Location is required');
    if (!form.date.trim()) return setError('Date is required');
    if (!form.description.trim()) return setError('Description is required');

    if (editingId) {
      const next = events.map(ev => (ev.id === editingId ? { ...ev, ...form } : ev));
      saveAll(next);
      closeModal();
      return;
    }

    const newEvent: Event = {
      id: `${Date.now()}`,
      ...form
    };

    saveAll([newEvent, ...events]);
    closeModal();
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-serif font-bold">Manage Scheduled Events</h2>
        <button
          onClick={beginCreate}
          className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors w-full sm:w-auto"
        >
          Add Event
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border border-black overflow-x-auto">
        {sorted.length === 0 ? (
          <div className="p-8 md:p-12 text-center text-gray-500">
            No events yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 min-w-[700px]">
            {sorted.map(event => (
              <div key={event.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-serif font-bold truncate">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs uppercase tracking-widest font-bold ${event.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {event.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                      <span className={`px-2 py-1 text-xs uppercase tracking-widest font-bold ${event.isPast ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'}`}>
                        {event.isPast ? 'Past' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 flex flex-wrap items-center gap-2">
                      <span className="font-bold">{event.date}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                    <p className="text-gray-700 mt-3 whitespace-pre-wrap line-clamp-2">{event.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => beginEdit(event)}
                      className="px-3 py-2 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleVisible(event.id)}
                      className="px-3 py-2 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100"
                      title={event.isVisible ? 'Hide' : 'Show'}
                    >
                      {event.isVisible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleTogglePast(event.id)}
                      className="px-3 py-2 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100"
                      title={event.isPast ? 'Mark Upcoming' : 'Mark Past'}
                    >
                      {event.isPast ? 'Mark Upcoming' : 'Mark Past'}
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-2 text-xs font-bold bg-gray-700 text-white rounded hover:bg-gray-800"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold">
                  {editingId ? 'Edit Event' : 'Create Event'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm uppercase tracking-widest font-bold mb-3">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm uppercase tracking-widest font-bold mb-3">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm uppercase tracking-widest font-bold mb-3">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-widest font-bold mb-3">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={6}
                    className="w-full border-b-2 border-gray-200 p-3 focus:outline-none focus:border-black transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-bold">Visible on public site</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isPast}
                      onChange={(e) => setForm({ ...form, isPast: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-bold">Mark as past</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-black text-sm uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
                  >
                    {editingId ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
