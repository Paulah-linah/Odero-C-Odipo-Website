import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../../components/Reveal';
import { AuthorPortrait } from '../../components/AuthorPortrait';

const facts = [
  { label: 'Literary focus', value: 'Contemporary fiction, social commentary, literary essays' },
  { label: 'Writing style', value: 'Intimate, observational, poetic prose with social consciousness' },
  { label: 'Themes', value: 'Identity, connection, social change, human resilience' },
];

const philosophy = [
  { n: '01', title: 'Literary intimacy', text: 'Creating spaces where readers can connect deeply with characters and their emotional journeys.' },
  { n: '02', title: 'Social consciousness', text: 'Exploring how individual stories reflect broader social patterns and collective experiences.' },
  { n: '03', title: 'Narrative bridges', text: 'Building connections between diverse perspectives through shared human experiences.' },
];

export const About: React.FC = () => (
  <div>
    {/* Intro */}
    <section className="page grid grid-cols-1 items-center gap-14 pb-20 pt-14 md:pt-20 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <p className="eyebrow mb-6">About the author</p>
        <h1 className="text-balance font-serif text-5xl font-bold leading-[1.05] md:text-7xl">
          The author&rsquo;s <span className="italic font-normal">journey.</span>
        </h1>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-neutral-600 text-pretty">
          Exploring the silence between words. A Nairobi-based author dedicated to literary intimacy and storytelling.
        </p>
      </div>
      <div className="lg:col-span-5 lg:col-start-8">
        <AuthorPortrait priority className="my-8" />
      </div>
    </section>

    {/* Bio */}
    <section className="border-y border-neutral-200 bg-mist py-24">
      <div className="page grid grid-cols-1 gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <h2 className="font-serif text-4xl font-bold italic">Odipo C. Odero</h2>
          <p className="mt-6 text-lg leading-relaxed text-neutral-700">
            A contemporary writer observing the world from the margins, with quiet confidence and emotional depth.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-neutral-700">
            He writes about people who are present but not fully here, and the conversations we have when no one is watching.
          </p>
        </Reveal>
        <Reveal className="lg:col-span-5 lg:col-start-8" delay={80}>
          <dl className="divide-y divide-neutral-300 border-y border-neutral-300">
            {facts.map((f) => (
              <div key={f.label} className="py-5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">{f.label}</dt>
                <dd className="mt-2 font-serif text-lg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>

    {/* Philosophy */}
    <section className="page py-24 md:py-28">
      <Reveal className="mb-14 max-w-2xl">
        <p className="eyebrow mb-5">Writing philosophy</p>
        <h2 className="font-serif text-4xl font-bold md:text-5xl">What the work is reaching for</h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-px bg-neutral-200 md:grid-cols-3">
        {philosophy.map((p, i) => (
          <Reveal key={p.n} delay={i * 80} className="bg-white p-8 md:p-10">
            <span className="font-serif text-sm italic text-neutral-400">{p.n}</span>
            <h3 className="mt-6 font-serif text-2xl font-bold">{p.title}</h3>
            <p className="mt-4 leading-relaxed text-neutral-600">{p.text}</p>
          </Reveal>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="border-t border-neutral-200 py-24">
      <Reveal className="page text-center">
        <h2 className="font-serif text-4xl font-bold italic md:text-5xl">Connect with the author</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600">
          Interested in discussing literature, collaborations, or sharing your own story? Let&rsquo;s connect.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/contact" className="btn-dark">Get in touch</Link>
          <Link to="/books" className="btn-light">Explore books</Link>
        </div>
      </Reveal>
    </section>
  </div>
);
