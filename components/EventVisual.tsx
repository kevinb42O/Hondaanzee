import React, { useState } from 'react';
import { CalendarDays, PawPrint } from 'lucide-react';
import type { DogEvent } from '../data/events.ts';

/** A missing image never falls back to an unrelated dog or another event. */
const EventVisual: React.FC<{ event: DogEvent; className?: string }> = ({ event, className = '' }) => {
  const [failedSource, setFailedSource] = useState<string>();
  if (event.image && failedSource !== event.image) {
    return <img
      src={event.image}
      alt={event.imageAlt || event.title}
      className={`w-full h-full ${event.imageKind === 'poster' ? 'object-contain bg-slate-100 p-3' : 'object-cover'} ${className}`}
      style={{ objectPosition: event.imagePosition || 'center' }}
      width={800} height={600} loading="lazy" decoding="async"
      onError={() => setFailedSource(event.image)}
    />;
  }
  return <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-100 text-sky-800" aria-hidden="true">
    <div className="relative"><CalendarDays size={60} strokeWidth={1.25} /><PawPrint size={25} className="absolute -bottom-1 -right-3 bg-blue-50 rounded-full p-1" /></div>
    <span className="text-sm font-bold tracking-wide">{event.category}</span>
  </div>;
};

export default EventVisual;
