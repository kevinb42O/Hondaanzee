import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.tsx';
import EventDetailContent from '../components/EventDetailContent.tsx';
import { RelatedEventLinks } from '../components/EventLinks.tsx';
import { EVENTS } from '../data/events.ts';
import { getEventSEO } from '../utils/events.ts';
import { useEventClock } from '../utils/useEventClock.ts';
import { useSEO } from '../utils/seo.ts';

const SITE_ORIGIN = 'https://hondaanzee.be';

const EventDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = EVENTS.find((item) => item.slug === slug);
  const now = useEventClock();

  useSEO(event ? getEventSEO(event, now) : {
    title: 'Evenement niet gevonden | HondAanZee.be',
    description: 'Dit evenement werd niet gevonden in de agenda van HondAanZee.be.',
    canonical: `${SITE_ORIGIN}/agenda`,
    noindex: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!event) {
    return <Navigate to="/agenda" replace />;
  }

  return (
    <div className="animate-in fade-in bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-28 sm:pt-32">
        <Link
          to="/agenda"
          className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-sky-600 transition-colors mb-5 active:opacity-70 touch-target py-2"
        >
          <ArrowLeft size={18} />
          Terug naar agenda
        </Link>
        <Breadcrumb
          className="mb-5 sm:mb-6"
          items={[
            { label: 'Home', to: '/' },
            { label: 'Agenda', to: '/agenda' },
            { label: event.title },
          ]}
        />
      </div>

      <article className="max-w-6xl mx-auto px-4 md:px-6 pb-12 sm:pb-16 md:pb-20">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/70 border border-slate-100">
          <EventDetailContent event={event} />
        </div>
        <RelatedEventLinks event={event} />
      </article>
    </div>
  );
};

export default EventDetail;
