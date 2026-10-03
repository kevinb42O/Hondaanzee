export type EventRegion = 'kust' | 'west-vlaanderen' | 'belgie' | 'zeeland';

export interface DogEvent {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  city: string; // internal id
  citySlug?: string; // Only set when we have a coastal town guide.
  cityName: string;
  date: string; // YYYY-MM-DD for sorting
  endDate?: string; // Inclusive final calendar day, including multi-day events.
  dateDisplay: string; // Human-readable date
  timeDisplay: string; // e.g. "11:00 - 17:00"
  schemaStartDate: string; // Use a date-only value when no start time is announced.
  schemaEndDate: string;
  season: 'Lente' | 'Zomer' | 'Herfst' | 'Winter';
  category: string; // e.g. 'Festival', 'Wandeling', 'Workshop'
  description: string;
  descriptionHighlight?: string;
  highlights: string[];
  location: string; // Venue name
  address?: string;
  structuredAddress?: { streetAddress?: string; postalCode?: string; addressLocality?: string };
  country?: 'BE' | 'NL';
  region?: EventRegion;
  price: string; // e.g. 'Gratis' or '€10'
  isAccessibleForFree?: boolean; // Never infer this from a free child/dog ticket.
  ticketUrl?: string; // Verified booking page; set only when the listed price is confirmed.
  entryPrice?: number; // Main visitor/participant ticket, only when confirmed.
  image?: string;
  imageAlt?: string;
  imageKind?: 'photo' | 'poster';
  imageCaption?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  imagePosition?: string;
  lastVerified?: string;
  status?: 'confirmed' | 'save-the-date' | 'announced';
  dogPolicy?: string;
  practicalNotes?: string[];
  sources?: Array<{ label: string; url: string }>;
  website?: string;
  websiteLabel?: string;
  organizerName?: string;
  organizerUrl?: string;
  additionalLinks?: Array<{
    label: string;
    url: string;
  }>;
  email?: string;
  phone?: string;
  accessibility?: string[];
  detailGallery?: {
    eyebrow?: string;
    title: string;
    description?: string;
    images: Array<{
      src: string;
      alt: string;
      label: string;
      credit?: string;
      sourceUrl?: string;
    }>;
  };
  eventStatus?: 'scheduled' | 'cancelled' | 'postponed' | 'rescheduled';
  previousStartDate?: string;
  statusNote?: string;
  visibility?: 'visible' | 'withdrawn';
  withdrawalReason?: string;
  tags: string[];
}

import dashboardCatalog from './dashboardCatalog.json';
import { EVENT_DEFAULTS } from './eventDefaults.ts';

export const EVENTS: DogEvent[] = (((dashboardCatalog as unknown as { events?: DogEvent[] | null }).events) ?? EVENT_DEFAULTS).filter(event => event.visibility !== 'withdrawn');
