import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../../services/storage';
import type { Event } from '../../types';
import { Reveal } from '../../components/Reveal';

const parts = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '', month: '', year: '', long: iso };
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
    year: String(d.getFullYear()),
    long: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

const EventRow: React.FC<{ event: Event; past?: boolean }> = ({ event, past }) => {
  const p = parts(event.date);
  return (
    <article className={`grid grid-cols-[4.5rem_1fr] gap-6 border-t border-neutral-200 py-8 sm:grid-cols-[6rem_1fr] sm:gap-10 ${past ? 'opacity-60' : ''}`}>
      <div className="text-center">
        <div className="font-serif text-4xl font-bold leading-none sm:text-5xl">{p.day}</div>
        <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{p.month} {p.year}</div>
      </div>
      <div>
        <h3 className="font-serif text-2xl font-bold">{event.title}</h3>
        <p className="mt-2 text-sm text-neutral-500">
          {p.long}
          {event.location && <> &middot; {event.location}</>}
        </p>
        {event.description && <p className="mt-4 whitespace-pre-wrap leading-relaxed text-neutral-700">{event.description}</p>}
      </div>
    </article>
  );
};

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(storage.getEvents());
  }, []);

  const visibleEvents = useMemo(
    () => events.filter((e) => e.isVisible).slice().sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );
  const upcoming = useMemo(() => visibleEvents.filter((e) => !e.isPast), [visibleEvents]);
  const past = useMemo(() => visibleEvents.filter((e) => e.isPast).reverse(), [visibleEvents]);

  return (
    <div className="page max-w-4xl pb-28 pt-14 md:pt-20">
      <header className="mb-16">
        <p className="eyebrow mb-5">Events</p>
        <h1 className="font-serif text-5xl font-bold md:text-6xl">
          Readings &amp; <span className="italic font-normal">conversations.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-neutral-600">Join readings, signings and conversations. Check back often for updates.</p>
      </header>

      <section aria-labelledby="upcoming" className="mb-20">
        <h2 id="upcoming" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="border-t border-neutral-200 py-12">
            <p className="font-serif text-2xl italic text-neutral-500">No upcoming events right now.</p>
            <p className="mt-3 text-neutral-500">
              Subscribe to the newsletter at the bottom of the page, or <Link to="/contact" className="underline underline-offset-4 hover:text-ink">get in touch</Link> to invite Odipo to an event.
            </p>
          </div>
        ) : (
          upcoming.map((e, i) => (
            <Reveal key={e.id} delay={i * 60}><EventRow event={e} /></Reveal>
          ))
        )}
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past">
          <h2 id="past" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Past events</h2>
          {past.map((e) => (
            <EventRow key={e.id} event={e} past />
          ))}
        </section>
      )}
    </div>
  );
};
