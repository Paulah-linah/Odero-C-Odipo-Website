import React, { useEffect, useMemo, useState } from 'react';
import { storage } from '../../services/storage';
import type { Event } from '../../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(storage.getEvents());
  }, []);

  const visibleEvents = useMemo(() => {
    return events
      .filter(e => e.isVisible)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  const upcoming = useMemo(() => visibleEvents.filter(e => !e.isPast), [visibleEvents]);
  const past = useMemo(() => visibleEvents.filter(e => e.isPast), [visibleEvents]);

  return (
    <div className="min-h-screen bg-white">
      <div className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <h1 className="text-5xl font-serif font-bold mb-6 italic text-center">Literary Events</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-center mb-12">
          Join readings, signings, and conversations. Check back often for updates.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif font-bold mb-6">Upcoming</h2>
            {upcoming.length === 0 ? (
              <div className="bg-white border border-black p-8 text-center text-gray-500">
                No upcoming events at the moment.
              </div>
            ) : (
              <div className="space-y-6">
                {upcoming.map(event => (
                  <article key={event.id} className="bg-white border border-black p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-bold mb-2">{event.title}</h3>
                        <div className="text-sm text-gray-600 mb-4">
                          <span className="font-bold">{event.date}</span>
                          <span className="mx-2">•</span>
                          <span>{event.location}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold mb-6">Past</h2>
            {past.length === 0 ? (
              <div className="bg-white border border-black p-8 text-center text-gray-500">
                No past events yet.
              </div>
            ) : (
              <div className="space-y-6">
                {past.map(event => (
                  <article key={event.id} className="bg-white border border-black p-6 opacity-80">
                    <h3 className="text-xl font-serif font-bold mb-2">{event.title}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-bold">{event.date}</span>
                      <span className="mx-2">•</span>
                      <span>{event.location}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
