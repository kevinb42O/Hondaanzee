import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bed,
  Beer,
  Coffee,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Phone,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Tag,
  Utensils,
  Wine,
} from 'lucide-react';
import { HOTSPOTS, SERVICES } from '../constants.ts';
import { CITIES } from '../cityData.ts';
import { getPlaceSEO, useSEO } from '../utils/seo.ts';
import { getPlaceCollectionPath, type PlaceKind } from '../utils/placeRoutes.ts';
import type { Hotspot, Service } from '../types.ts';
import ImageModal from '../components/ImageModal.tsx';
import NotFound from './NotFound.tsx';

interface PlaceDetailProps {
  kind: PlaceKind;
}

type Place = Hotspot | Service;

const getDirectionsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

const truncateText = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3).trimEnd()}...` : value;

const getFirstSentence = (description: string): string => {
  const match = description.replace(/\s+/g, ' ').trim().match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] || description).trim();
};

const splitDescription = (description: string): string[] =>
  description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const formatDutchList = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} en ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`;
};

const sortRecommendedFirst = <T extends { tags: string[]; name: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const aRecommended = a.tags.includes('Aanrader') ? 1 : 0;
    const bRecommended = b.tags.includes('Aanrader') ? 1 : 0;
    if (bRecommended !== aRecommended) return bRecommended - aRecommended;
    return a.name.localeCompare(b.name, 'nl');
  });

const getAccentClasses = (kind: PlaceKind) =>
  kind === 'hotspot'
    ? {
        badge: 'bg-sky-50 text-sky-700 border-sky-100',
        tag: 'bg-sky-50 text-sky-700 border-sky-100',
        link: 'text-sky-600 hover:text-sky-700',
        button: 'bg-sky-600 hover:bg-sky-700',
        panel: 'bg-sky-50 border-sky-100',
      }
    : {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        tag: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        link: 'text-emerald-600 hover:text-emerald-700',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        panel: 'bg-emerald-50 border-emerald-100',
      };

const getPriorityTags = (place: Place): string[] => {
  const preferredOrder = [
    'Aanrader',
    'Specialty Coffee',
    'Nabij strand',
    'Hondenmenu',
    'Hondensnacks',
    'Waterbak aanwezig',
    'Terras',
    'Indoor toegelaten',
    'Hondvriendelijk team',
    'Honden toegelaten op kamer',
    'Consultatie op afspraak',
    'Online afspraak',
    'Trimsalon',
  ];

  return [...place.tags]
    .sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .filter((tag) => tag !== 'Aanrader')
    .slice(0, 3);
};

const getIntentLabel = (place: Place, kind: PlaceKind): string => {
  if (kind === 'service') {
    return place.type === 'Dierenarts' ? 'zorg en opvolging' : 'advies, voeding en spullen';
  }

  switch (place.type) {
    case 'Koffiebar':
      return 'een ontspannen koffiestop met hond';
    case 'Café':
      return 'een losse stop voor een drankje met hond';
    case 'Restaurant':
      return 'een volwaardig etentje zonder gedoe aan de deur';
    case 'Brasserie':
      return 'een klassieke, toegankelijke stop waar sfeer telt';
    case 'Slapen':
      return 'een verblijf waar je hond echt mee kan inplannen';
    case 'Shoppen':
      return 'een winkelstop waar je hond mee welkom is';
    default:
      return 'een hondvriendelijk adres aan zee';
  }
};

const getPlaceTypeIcon = (type: Place['type'], size = 18): React.ReactNode => {
  switch (type) {
    case 'Café':
      return <Beer size={size} />;
    case 'Koffiebar':
      return <Coffee size={size} />;
    case 'Restaurant':
      return <Utensils size={size} />;
    case 'Brasserie':
      return <Wine size={size} />;
    case 'Slapen':
      return <Bed size={size} />;
    case 'Shoppen':
    case 'Dierenspeciaalzaak':
      return <ShoppingBag size={size} />;
    case 'Dierenarts':
      return <Stethoscope size={size} />;
    default:
      return <Tag size={size} />;
  }
};

const getPracticalHighlight = (place: Place, kind: PlaceKind): string => {
  const focusTags = getPriorityTags(place);
  if (focusTags.length > 0) {
    return formatDutchList(focusTags.slice(0, 2).map((tag) => tag.toLowerCase()));
  }

  if (kind === 'service') {
    return place.type === 'Dierenarts' ? 'consultaties zonder veel gedoe' : 'voeding, accessoires en bruikbaar advies';
  }

  switch (place.type) {
    case 'Slapen':
      return 'verblijven waar je hond echt mee kan';
    case 'Restaurant':
    case 'Brasserie':
      return 'comfortabel tafelen met hond';
    case 'Koffiebar':
    case 'Café':
      return 'een vlotte stop voor koffie of apero';
    default:
      return 'een hondvriendelijke stop zonder drempel';
  }
};

const getStreetLabel = (address: string): string => address.split(',')[0].trim();

type OverviewPanelTheme = {
  style: React.CSSProperties;
  gridOpacityClass: string;
  gridStyle?: React.CSSProperties;
  orbOneClass: string;
  orbTwoClass: string;
  waveClass: string;
};

const getOverviewPanelTheme = (citySlug: string, kind: PlaceKind): OverviewPanelTheme => {
  const themes: Record<string, Omit<OverviewPanelTheme, 'waveClass'>> = {
    blankenberge: {
      style: {
        backgroundImage: `
          linear-gradient(180deg, rgba(240, 249, 255, 0.98) 0%, rgba(255,255,255,0.99) 28%, rgba(255,255,255,0.99) 68%, rgba(248,250,252,0.97) 100%),
          linear-gradient(90deg, rgba(14, 165, 233, 0.06) 0%, rgba(14, 165, 233, 0) 26%, rgba(255,255,255,0) 74%, rgba(148, 163, 184, 0.06) 100%),
          radial-gradient(circle at 88% 14%, rgba(255,255,255,0.82) 0, transparent 18%)
        `,
      },
      gridOpacityClass: 'opacity-20',
      gridStyle: {
        backgroundImage:
          'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,232,240,0.5) 1px, transparent 1px)',
        backgroundSize: '52px 100%, 100% 22px',
        maskImage: 'linear-gradient(135deg, black 8%, rgba(0,0,0,0.18) 55%, transparent 100%)',
      },
      orbOneClass: 'bg-white/80',
      orbTwoClass: 'bg-sky-50/45',
    },
    oostende: {
      style: {
        backgroundImage: `
          radial-gradient(circle at 14% 16%, rgba(15, 23, 42, 0.08) 0, transparent 24%),
          radial-gradient(circle at 85% 14%, rgba(56, 189, 248, 0.18) 0, transparent 24%),
          radial-gradient(circle at 72% 82%, rgba(251, 191, 36, 0.12) 0, transparent 26%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.96) 42%, rgba(241,245,249,0.98) 100%)
        `,
      },
      gridOpacityClass: 'opacity-45',
      orbOneClass: 'bg-slate-100/70',
      orbTwoClass: 'bg-sky-50/70',
    },
    'knokke-heist': {
      style: {
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(2, 132, 199, 0.12) 0, transparent 24%),
          radial-gradient(circle at 84% 16%, rgba(250, 204, 21, 0.14) 0, transparent 20%),
          radial-gradient(circle at 72% 82%, rgba(226, 232, 240, 0.7) 0, transparent 30%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(250,250,249,0.98) 46%, rgba(248,250,252,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-30',
      orbOneClass: 'bg-stone-100/80',
      orbTwoClass: 'bg-sky-50/65',
    },
    'de-haan': {
      style: {
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(163, 230, 53, 0.14) 0, transparent 26%),
          radial-gradient(circle at 84% 18%, rgba(251, 191, 36, 0.14) 0, transparent 20%),
          radial-gradient(circle at 76% 84%, rgba(110, 231, 183, 0.1) 0, transparent 24%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(250,250,249,0.98) 42%, rgba(248,250,252,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-30',
      orbOneClass: 'bg-lime-50/70',
      orbTwoClass: 'bg-amber-50/65',
    },
    wenduine: {
      style: {
        backgroundImage: `
          radial-gradient(circle at 10% 16%, rgba(125, 211, 252, 0.16) 0, transparent 25%),
          radial-gradient(circle at 88% 18%, rgba(255, 237, 213, 0.9) 0, transparent 22%),
          radial-gradient(circle at 78% 84%, rgba(186, 230, 253, 0.12) 0, transparent 26%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(249,250,251,0.98) 45%, rgba(255,255,255,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-30',
      orbOneClass: 'bg-sky-50/70',
      orbTwoClass: 'bg-orange-50/65',
    },
    middelkerke: {
      style: {
        backgroundImage: `
          radial-gradient(circle at 12% 20%, rgba(45, 212, 191, 0.14) 0, transparent 24%),
          radial-gradient(circle at 86% 16%, rgba(253, 224, 71, 0.15) 0, transparent 20%),
          radial-gradient(circle at 74% 84%, rgba(56, 189, 248, 0.1) 0, transparent 28%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.98) 44%, rgba(255,255,255,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-35',
      orbOneClass: 'bg-teal-50/70',
      orbTwoClass: 'bg-yellow-50/70',
    },
    nieuwpoort: {
      style: {
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(96, 165, 250, 0.16) 0, transparent 26%),
          radial-gradient(circle at 85% 16%, rgba(251, 191, 36, 0.14) 0, transparent 18%),
          radial-gradient(circle at 72% 84%, rgba(191, 219, 254, 0.16) 0, transparent 28%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(247,250,252,0.98) 46%, rgba(255,255,255,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-35',
      orbOneClass: 'bg-blue-50/70',
      orbTwoClass: 'bg-amber-50/65',
    },
    'de-panne': {
      style: {
        backgroundImage: `
          radial-gradient(circle at 10% 16%, rgba(110, 231, 183, 0.14) 0, transparent 25%),
          radial-gradient(circle at 86% 15%, rgba(253, 186, 116, 0.15) 0, transparent 20%),
          radial-gradient(circle at 74% 84%, rgba(45, 212, 191, 0.1) 0, transparent 28%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(250,250,249,0.98) 44%, rgba(255,255,255,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-30',
      orbOneClass: 'bg-emerald-50/70',
      orbTwoClass: 'bg-orange-50/65',
    },
    koksijde: {
      style: {
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(14, 165, 233, 0.16) 0, transparent 24%),
          radial-gradient(circle at 86% 16%, rgba(251, 191, 36, 0.14) 0, transparent 20%),
          radial-gradient(circle at 74% 84%, rgba(125, 211, 252, 0.12) 0, transparent 30%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.98) 44%, rgba(255,255,255,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-35',
      orbOneClass: 'bg-sky-50/70',
      orbTwoClass: 'bg-amber-50/60',
    },
    zeebrugge: {
      style: {
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(15, 23, 42, 0.09) 0, transparent 24%),
          radial-gradient(circle at 86% 16%, rgba(14, 165, 233, 0.16) 0, transparent 22%),
          radial-gradient(circle at 76% 84%, rgba(251, 191, 36, 0.1) 0, transparent 26%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.98) 44%, rgba(255,255,255,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-40',
      orbOneClass: 'bg-slate-100/70',
      orbTwoClass: 'bg-sky-50/65',
    },
    bredene: {
      style: {
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(56, 189, 248, 0.16) 0, transparent 24%),
          radial-gradient(circle at 84% 16%, rgba(253, 224, 71, 0.14) 0, transparent 20%),
          radial-gradient(circle at 74% 84%, rgba(191, 219, 254, 0.14) 0, transparent 28%),
          linear-gradient(135deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.98) 44%, rgba(255,255,255,0.99) 100%)
        `,
      },
      gridOpacityClass: 'opacity-30',
      orbOneClass: 'bg-blue-50/70',
      orbTwoClass: 'bg-yellow-50/65',
    },
  };

  const fallback =
    kind === 'hotspot'
      ? {
          style: {
            backgroundImage: `
              radial-gradient(circle at 12% 18%, rgba(56, 189, 248, 0.18) 0, transparent 28%),
              radial-gradient(circle at 82% 14%, rgba(251, 191, 36, 0.18) 0, transparent 24%),
              radial-gradient(circle at 74% 82%, rgba(14, 165, 233, 0.08) 0, transparent 28%),
              linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.97) 46%, rgba(255,255,255,0.99) 100%)
            `,
          },
          gridOpacityClass: 'opacity-40',
          orbOneClass: 'bg-sky-100/70',
          orbTwoClass: 'bg-amber-50/70',
        }
      : {
          style: {
            backgroundImage: `
              radial-gradient(circle at 12% 18%, rgba(16, 185, 129, 0.16) 0, transparent 28%),
              radial-gradient(circle at 82% 14%, rgba(251, 191, 36, 0.14) 0, transparent 22%),
              radial-gradient(circle at 74% 82%, rgba(5, 150, 105, 0.08) 0, transparent 28%),
              linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.97) 46%, rgba(255,255,255,0.99) 100%)
            `,
          },
          gridOpacityClass: 'opacity-35',
          orbOneClass: 'bg-emerald-100/70',
          orbTwoClass: 'bg-amber-50/65',
        };

  const baseTheme = themes[citySlug] || fallback;

  return {
    ...baseTheme,
    waveClass:
      kind === 'hotspot'
        ? 'text-sky-100/70'
        : 'text-emerald-100/70',
  };
};

const getRecommendationReasons = (place: Place, kind: PlaceKind): string[] => {
  const reasons: string[] = [];
  const hasTag = (tag: string) => place.tags.includes(tag);

  if (hasTag('Hondvriendelijk team')) reasons.push('de ontvangst voor honden hier opvallend vanzelfsprekend aanvoelt');
  if (hasTag('Waterbak aanwezig')) reasons.push('er ook in de kleine dingen aan je hond gedacht wordt');
  if (hasTag('Indoor toegelaten')) reasons.push('je niet moet hopen op mooi weer om samen binnen te kunnen');
  if (hasTag('Terras')) reasons.push('je bij goed weer ook buiten rustig kan blijven zitten');
  if (hasTag('Hondenmaaltijden') || hasTag('Hondenijsjes')) reasons.push('de zaak ook echt moeite doet om honden mee in de ervaring te trekken');
  if (hasTag('Specialty Coffee')) reasons.push('de kwaliteit van koffie en zaakbeleving hier gewoon klopt');
  if (hasTag('Sharing')) reasons.push('dit goed werkt voor een losse, ontspannen stop zonder formele sfeer');
  if (hasTag('Visgerechten')) reasons.push('de kaart duidelijk inzet op degelijke kustklassiekers');
  if (hasTag('Belgische bieren')) reasons.push('het karakter van de zaak meteen voelbaar is');
  if (hasTag('Live muziek')) reasons.push('de plek meer eigen smoel heeft dan een doorsnee café');
  if (hasTag('Creatieve keuken')) reasons.push('de keuken net iets spannender kookt dan je op deze locatie zou verwachten');
  if (hasTag('Wisselend menu')) reasons.push('de kaart niet vastroest maar mee evolueert met wat goed is');
  if (hasTag('Doorlopende keuken')) reasons.push('je hier makkelijk op een flexibel uur kan aanschuiven');
  if (hasTag('Verwarmd terras')) reasons.push('het terras ook buiten de warmste dagen bruikbaar blijft');

  if (reasons.length === 0) {
    if (kind === 'service') {
      reasons.push('de praktische ervaring voor baas en hond hier opvallend vlot verloopt');
    } else {
      reasons.push('de combinatie van sfeer, gemak en hondvriendelijkheid hier gewoon goed zit');
    }
  }

  return reasons.slice(0, 2);
};

const getRecommendedNote = (place: Place, cityName: string, kind: PlaceKind): string => {
  if (place.recommendationNote) {
    return place.recommendationNote;
  }

  const reasons = getRecommendationReasons(place, kind);
  return kind === 'service'
    ? `${place.name} hoort bij onze aanraders in ${cityName}, vooral omdat ${formatDutchList(reasons)}.`
    : `${place.name} hoort bij onze aanraders in ${cityName}, vooral omdat ${formatDutchList(reasons)}.`;
};

const getRelatedTeaser = (place: Place): string =>
  truncateText(place.summary || getFirstSentence(place.description), 110);

const getExternalLabel = (url: string): string => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch {
    return url;
  }
};

interface RelatedPlaceCardProps {
  accents: ReturnType<typeof getAccentClasses>;
  entry: Place;
  eyebrow: string;
  placePath: string;
  previousPath: string;
}

const RelatedPlaceCard: React.FC<RelatedPlaceCardProps> = ({
  accents,
  entry,
  eyebrow,
  placePath,
  previousPath,
}) => {
  const entryTags = entry.tags.filter((tag) => tag !== 'Aanrader').slice(0, 2);

  return (
    <Link
      to={`/${entry.city}/${placePath}/${entry.slug}`}
      state={{ from: previousPath }}
      className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative overflow-hidden">
        <img
          src={entry.image}
          alt={entry.name}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          style={{ objectPosition: entry.imagePosition || 'center' }}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/0 to-transparent" />
        {entry.tags.includes('Aanrader') && (
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-amber-400/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-950">
            Aanrader
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
        <p className={`mt-1 text-lg font-black tracking-tight ${accents.link}`}>{entry.name}</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{getRelatedTeaser(entry)}</p>
        {entryTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entryTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

const PlaceDetail: React.FC<PlaceDetailProps> = ({ kind }) => {
  const { city, slug } = useParams<{ city: string; slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [activeHeroImageIndex, setActiveHeroImageIndex] = useState(0);

  const place = useMemo<Place | undefined>(() => {
    if (!city || !slug) return undefined;
    const collection = kind === 'hotspot' ? HOTSPOTS : SERVICES;
    return collection.find((entry) => entry.city === city && entry.slug === slug);
  }, [city, kind, slug]);

  const cityData = CITIES.find((entry) => entry.slug === city);

  if (!place || !cityData) {
    return <NotFound />;
  }

  const collection = kind === 'hotspot' ? HOTSPOTS : SERVICES;
  const images = place.images?.length ? place.images : [place.image];
  const paragraphs = splitDescription(place.description);
  const focusTags = getPriorityTags(place);
  const summary = truncateText(
    place.summary || getFirstSentence(place.description),
    155,
  );
  useSEO(getPlaceSEO(place, cityData, kind));

  const accents = getAccentClasses(kind);
  const overviewTheme = getOverviewPanelTheme(cityData.slug, kind);
  const collectionPath = getPlaceCollectionPath(kind);
  const from = typeof location.state?.from === 'string' ? location.state.from : null;
  const placePath = kind === 'hotspot' ? 'hotspots' : 'diensten';
  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const snapshotCards = [
    {
      label: 'Type',
      value: place.type,
      labelIcon: getPlaceTypeIcon(place.type, 14),
      contentIcon: getPlaceTypeIcon(place.type, 22),
      variant: 'default' as const,
    },
    {
      label: 'Past goed bij',
      value: getIntentLabel(place, kind),
      labelIcon: <Sparkles size={14} />,
      variant: 'default' as const,
    },
    {
      label: 'Handig om weten',
      value: getPracticalHighlight(place, kind),
      labelIcon: <Tag size={14} />,
      variant: 'default' as const,
    },
    {
      label: 'Adres',
      value: getStreetLabel(place.address),
      labelIcon: <MapPin size={14} />,
      href: getDirectionsUrl(place.address),
      variant: 'link' as const,
    },
  ];

  const moreInCity = useMemo(
    () =>
      sortRecommendedFirst(
        collection.filter((entry) => entry.city === place.city && entry.slug !== place.slug),
      ).slice(0, 3),
    [collection, place.city, place.slug],
  );

  const similarPlaces = useMemo(
    () =>
      sortRecommendedFirst(
        collection.filter(
          (entry) =>
            entry.slug !== place.slug &&
            entry.type === place.type &&
            !moreInCity.some((candidate) => candidate.slug === entry.slug),
        ),
      ).slice(0, 3),
    [collection, moreInCity, place.slug, place.type],
  );

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    if (from) {
      navigate(from);
      return;
    }

    navigate(`/${place.city}`);
  };

  const openGalleryAt = (index: number) => {
    setInitialImageIndex(index);
    setIsGalleryOpen(true);
  };

  useEffect(() => {
    setActiveHeroImageIndex(0);
  }, [place.slug]);

  useEffect(() => {
    if (images.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroImageIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [images]);

  const cityLogoSrc =
    cityData.slug === 'oostende'
      ? '/oostendelogo.png'
      : cityData.slug === 'blankenberge'
        ? '/blankenbergelogo.png'
        : cityData.slug === 'knokke-heist'
          ? '/knokkelogo.png'
          : cityData.slug === 'de-haan'
            || cityData.slug === 'wenduine'
            ? '/logodehaan.png'
            : cityData.slug === 'de-panne'
              ? '/logodepanne.gif'
              : cityData.slug === 'nieuwpoort'
                ? '/logonieuwpoort.png'
                : cityData.slug === 'koksijde'
                  ? '/logokoksijde.png'
                  : cityData.slug === 'middelkerke'
                    ? '/logomiddelkerke.png'
        : null;

  const practicalInfoCard = (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-4 text-xl font-black tracking-tight text-slate-900">Praktische info</h2>

      <div className={`mb-5 rounded-2xl border ${cityLogoSrc ? 'flex h-[5.5rem] items-center justify-center overflow-hidden p-2' : 'p-4'} ${accents.panel}`}>
        {cityLogoSrc ? (
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={cityLogoSrc}
              alt={cityData.name}
              className="max-h-full w-auto object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Locatie</p>
            <p className="font-bold text-slate-900">{cityData.name}</p>
          </>
        )}
      </div>

      <a
        href={getDirectionsUrl(place.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <MapPin size={18} className="mt-0.5 shrink-0 text-slate-500" />
        <div className="ml-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Adres</p>
          <p className="font-bold text-slate-900">{place.address}</p>
          <p className={`mt-1 text-sm font-bold ${accents.link}`}>Open route in Google Maps</p>
        </div>
      </a>

      {place.phone && (
        <a
          href={`tel:${place.phone}`}
          className="mb-4 flex rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Phone size={18} className="mt-0.5 shrink-0 text-slate-500" />
          <div className="ml-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Telefoon</p>
            <p className={`font-bold ${accents.link}`}>{place.phone}</p>
          </div>
        </a>
      )}

      {place.website && (
        <a
          href={place.website}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-white transition ${accents.button}`}
        >
          <ExternalLink size={18} />
          {place.websiteLabel || 'Bezoek website'}
        </a>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in bg-slate-50 min-h-full">
      <div data-header-hero="light" className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          {images.map((heroImage, index) => (
            <img
              key={heroImage}
              src={heroImage}
              alt={index === activeHeroImageIndex ? place.name : ''}
              aria-hidden={index !== activeHeroImageIndex}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                index === activeHeroImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ objectPosition: place.imagePosition || 'center' }}
            />
          ))}
          <div className="absolute inset-0 bg-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/74 via-slate-950/36 to-slate-950/16" />
        </div>

        <div className="relative mx-auto flex min-h-[24rem] max-w-6xl flex-col justify-end px-4 pb-10 pt-16 sm:px-6 md:pb-14 md:pt-24">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm font-bold">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
            >
              <ArrowLeft size={16} />
              Terug
            </button>
            <Link to={`/${place.city}`} className="text-slate-200 transition hover:text-white">
              {cityData.name}
            </Link>
            <span className="text-slate-500">/</span>
            <Link to={collectionPath} className="text-slate-200 transition hover:text-white">
              {kind === 'hotspot' ? 'Hotspots' : 'Diensten'}
            </Link>
          </div>

          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] ${accents.badge}`}>
                {place.type}
              </span>
              {place.tags.includes('Aanrader') && (
                <span className="inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-amber-200 ring-1 ring-amber-300/30">
                  Aanrader
                </span>
              )}
            </div>

            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              {place.name}
            </h1>
            <p className="max-w-2xl text-sm font-black uppercase tracking-[0.22em] text-slate-300 sm:text-base">
              {cityData.name} • {kind === 'hotspot' ? 'Hondvriendelijke hotspot' : 'Praktische dienst'}
            </p>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-slate-100 sm:text-xl">
              {summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {focusTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-8 left-0 z-10 w-full overflow-hidden leading-[0] md:-bottom-10">
          <div className="wave-animation" style={{ display: 'flex', width: '200%' }}>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[110px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-slate-50"
              />
            </svg>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[110px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-slate-50"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_22rem] md:items-start md:py-14">
        <section className="space-y-8">
          <div
            className="relative overflow-hidden rounded-[2rem] p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
            style={overviewTheme.style}
          >
            <div
              className={`absolute inset-0 ${overviewTheme.gridOpacityClass}`}
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
                maskImage: 'linear-gradient(135deg, black 5%, rgba(0,0,0,0.12) 58%, transparent 100%)',
                ...overviewTheme.gridStyle,
              }}
            />
            <div className={`absolute -right-16 top-8 h-44 w-44 rounded-full border border-white/70 blur-[2px] ${overviewTheme.orbOneClass}`} />
            <div className={`absolute -left-12 bottom-10 h-28 w-72 rounded-full border border-white/60 blur-sm ${overviewTheme.orbTwoClass}`} />
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] opacity-45">
              <svg
                className={`block h-[76px] w-full ${overviewTheme.waveClass}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                  className="fill-current"
                />
              </svg>
            </div>

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Snel gelezen</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Wat je hier mag verwachten</h2>
                </div>
                {place.tags.includes('Aanrader') && (
                  <div className="ml-auto inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-black text-amber-900 ring-1 ring-amber-200 shadow-sm sm:self-center">
                    <Sparkles size={16} />
                    Aanrader
                  </div>
                )}
              </div>

              <div className="mt-6 grid auto-rows-fr grid-cols-2 gap-3 xl:grid-cols-4">
                {snapshotCards.map((card) => (
                  card.href ? (
                    <a
                      key={card.label}
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full min-h-[12.5rem] flex-col rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-slate-300"
                    >
                      <div className="min-h-[3.6rem]">
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                            {card.labelIcon}
                          </span>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] leading-[1.35]">{card.label}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-1 flex-col">
                        <p className="max-w-full text-[1.08rem] font-semibold leading-[1.42] text-slate-900 sm:text-[1.1rem]">
                          {card.value}
                        </p>
                        <span className={`mt-auto inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[13px] font-bold ${accents.link} bg-slate-50 transition hover:bg-slate-100`}>
                          Open in Google Maps
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div key={card.label} className="flex h-full min-h-[12.5rem] flex-col rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                      <div className="min-h-[3.6rem]">
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                            {card.labelIcon}
                          </span>
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] leading-[1.35]">{card.label}</p>
                        </div>
                      </div>
                      {card.label === 'Type' && card.contentIcon ? (
                        <div className="mt-3 flex flex-1 flex-col items-center text-center">
                          <p className="max-w-full text-[1.08rem] font-semibold leading-[1.42] text-slate-900 sm:text-[1.1rem]">
                            {card.value}
                          </p>
                          <span className="mt-4 inline-flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-slate-100 text-slate-700 ring-1 ring-slate-200/80">
                            {card.contentIcon}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-3 flex-1">
                          <p className="max-w-full text-[1.08rem] font-semibold leading-[1.42] text-slate-900 sm:text-[1.1rem]">
                            {card.value}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>

              {place.tags.includes('Aanrader') && (
                <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white px-5 py-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Waarom dit een aanrader is</p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-amber-950 sm:text-base">
                        {getRecommendedNote(place, cityData.name, kind)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Beelden</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Foto{images.length > 1 ? '\'s' : ''} van deze plek</h2>
              </div>
              <button
                type="button"
                onClick={() => openGalleryAt(0)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${accents.link} bg-slate-50 hover:bg-slate-100`}
              >
                <ImageIcon size={16} />
                Vergroot
              </button>
            </div>

            <button
              type="button"
              onClick={() => openGalleryAt(0)}
              className="group relative block w-full overflow-hidden rounded-[1.5rem] text-left"
            >
              <div className="relative h-[18rem] w-full sm:h-[24rem]">
                {images.map((galleryImage, index) => (
                  <img
                    key={galleryImage}
                    src={galleryImage}
                    alt={index === activeHeroImageIndex ? place.name : ''}
                    aria-hidden={index !== activeHeroImageIndex}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 group-hover:scale-[1.03] ${
                      index === activeHeroImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ objectPosition: place.imagePosition || 'center' }}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-white/75">
                    {images.length > 1 ? `${images.length} foto\'s` : 'Foto'}
                  </p>
                  <p className="text-lg font-black text-white">Klik om groter te bekijken</p>
                </div>
              </div>
            </button>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((galleryImage, index) => (
                  <button
                    key={galleryImage}
                    type="button"
                    onClick={() => openGalleryAt(index)}
                    className="overflow-hidden rounded-2xl ring-1 ring-slate-200 transition hover:ring-slate-300"
                  >
                    <img
                      src={galleryImage}
                      alt={`${place.name} foto ${index + 1}`}
                      className="h-28 w-full object-cover transition duration-300 hover:scale-105"
                      style={{ objectPosition: place.imagePosition || 'center' }}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900">Over deze plek</h2>
            <div className="space-y-4 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            {practicalInfoCard}
          </div>

          {place.tags.filter((tag) => tag !== 'Aanrader').length > 0 && (
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="mb-4 flex items-center gap-2">
                <Tag size={16} className="text-slate-400" />
                <h2 className="text-xl font-black tracking-tight text-slate-900">Kenmerken</h2>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {place.tags
                  .filter((tag) => tag !== 'Aanrader')
                  .map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${accents.tag}`}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {moreInCity.length > 0 && (
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900">Meer in {cityData.name}</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {moreInCity.map((entry) => (
                  <RelatedPlaceCard
                    key={entry.slug}
                    accents={accents}
                    entry={entry}
                    eyebrow={entry.type}
                    placePath={placePath}
                    previousPath={currentPath}
                  />
                ))}
              </div>
            </div>
          )}

          {similarPlaces.length > 0 && (
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900">Gelijkaardige plekken</h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {similarPlaces.map((entry) => (
                  <RelatedPlaceCard
                    key={entry.slug}
                    accents={accents}
                    entry={entry}
                    eyebrow={`${CITIES.find((cityEntry) => cityEntry.slug === entry.city)?.name || entry.city} • ${entry.type}`}
                    placePath={placePath}
                    previousPath={currentPath}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="h-fit md:sticky md:top-28 md:self-start">
          <div className="space-y-6">
          <div className="hidden md:block">
            {practicalInfoCard}
          </div>

          {place.sameAs && place.sameAs.length > 0 && (
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-3 text-xl font-black tracking-tight text-slate-900">Meer links</h2>
              <div className="space-y-3 text-sm font-bold">
                {place.sameAs.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${accents.link}`}
                  >
                    {getExternalLabel(url)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-3 text-xl font-black tracking-tight text-slate-900">Verder kijken</h2>
            <div className="space-y-3 text-sm font-bold">
              <Link to={`/${place.city}`} className={`block ${accents.link}`}>
                Bekijk {cityData.name}
              </Link>
              <Link to={collectionPath} className={`block ${accents.link}`}>
                Bekijk alle {kind === 'hotspot' ? 'hotspots' : 'diensten'}
              </Link>
              {moreInCity[0] && (
                <Link to={`/${moreInCity[0].city}/${placePath}/${moreInCity[0].slug}`} className={`block ${accents.link}`}>
                  Volgende tip in {cityData.name}
                </Link>
              )}
            </div>
          </div>
          </div>
        </aside>
      </div>

      <ImageModal
        images={images}
        altText={place.name}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={initialImageIndex}
      />
    </div>
  );
};

export default PlaceDetail;
