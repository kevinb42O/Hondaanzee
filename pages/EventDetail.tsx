import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.tsx';
import EventDetailContent from '../components/EventDetailContent.tsx';
import { EVENTS } from '../data/events.ts';
import { useSEO } from '../utils/seo.ts';

const SITE_ORIGIN = 'https://hondaanzee.be';

const getEventPrice = (price: string) => {
  if (price.toLowerCase().includes('gratis')) return '0';
  return price.match(/\d+(?:[,.]\d+)?/)?.[0]?.replace(',', '.') || '0';
};

const EventDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = EVENTS.find((item) => item.slug === slug);
  const eventUrl = event ? `${SITE_ORIGIN}/agenda/${event.slug}` : `${SITE_ORIGIN}/agenda`;
  const eventImage = event ? `${SITE_ORIGIN}${event.image}` : undefined;

  useSEO({
    title: event ? `${event.title} | Agenda HondAanZee.be` : 'Evenement niet gevonden | HondAanZee.be',
    description: event ? `${event.dateDisplay} in ${event.cityName}: ${event.description}` : 'Dit evenement werd niet gevonden in de agenda van HondAanZee.be.',
    keywords: event ? `${event.title}, ${event.cityName}, ${event.category}, hondenevenement, honden aan zee, belgische kust` : '',
    canonical: eventUrl,
    ogImage: eventImage,
    ogImageAlt: event?.title,
    structuredData: event ? [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_ORIGIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Agenda", "item": `${SITE_ORIGIN}/agenda` },
          { "@type": "ListItem", "position": 3, "name": event.title, "item": eventUrl }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.title,
        "description": event.description,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": eventUrl
        },
        "startDate": event.schemaStartDate,
        "endDate": event.schemaEndDate,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": event.location,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": event.address.split(',')[0]?.trim(),
            "addressLocality": event.cityName,
            "addressCountry": "BE"
          }
        },
        "image": eventImage,
        "url": eventUrl,
        "isAccessibleForFree": event.price.toLowerCase().includes('gratis'),
        "offers": {
          "@type": "Offer",
          "price": getEventPrice(event.price),
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": eventUrl
        },
        "organizer": {
          "@type": "Organization",
          "name": event.organizerName || event.title,
          "url": event.organizerUrl || event.website || SITE_ORIGIN
        }
      }
    ] : undefined,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!event) {
    return <Navigate to="/agenda" replace />;
  }

  return (
    <div className="animate-in fade-in bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 sm:pt-12">
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
      </article>
    </div>
  );
};

export default EventDetail;