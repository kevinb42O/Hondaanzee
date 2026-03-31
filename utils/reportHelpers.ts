import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { ReportCategory, ReportItem } from '../types.ts';

export const REPORT_CATEGORY_META: Record<
  ReportCategory,
  { label: string; accent: string; tone: string; emoji: string }
> = {
  gif: {
    label: 'Gif of verdachte stof',
    accent: 'text-red-700',
    tone: 'bg-red-50 border-red-100',
    emoji: '☠️',
  },
  afval: {
    label: 'Afval of sluikstort',
    accent: 'text-amber-700',
    tone: 'bg-amber-50 border-amber-100',
    emoji: '🗑️',
  },
  weggegooid_voorwerp: {
    label: 'Weggegooid voorwerp',
    accent: 'text-orange-700',
    tone: 'bg-orange-50 border-orange-100',
    emoji: '📦',
  },
  hondenpoep: {
    label: 'Hondenpoep',
    accent: 'text-emerald-700',
    tone: 'bg-emerald-50 border-emerald-100',
    emoji: '💩',
  },
  gevaarlijke_situatie: {
    label: 'Gevaarlijke situatie',
    accent: 'text-fuchsia-700',
    tone: 'bg-fuchsia-50 border-fuchsia-100',
    emoji: '⚠️',
  },
  andere_overlast: {
    label: 'Andere overlast',
    accent: 'text-sky-700',
    tone: 'bg-sky-50 border-sky-100',
    emoji: '📍',
  },
};

export const getCategoryMeta = (category: ReportCategory) => REPORT_CATEGORY_META[category];

export const getInterventionBadge = (report: Pick<ReportItem, 'city_slug' | 'city_intervention_status'>): string | null => {
  if (report.city_intervention_status !== 'resolved') {
    return null;
  }

  if (report.city_slug === 'oostende') {
    return 'Opgeruimd door stadsdiensten Oostende';
  }

  return 'Opgeruimd door stadsdiensten';
};

export const formatObservedDistance = (isoString: string): string =>
  formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: nl });

export const formatObservedAbsolute = (isoString: string): string =>
  format(new Date(isoString), "d MMMM yyyy 'om' HH:mm", { locale: nl });

export const formatReportShareText = (report: Pick<ReportItem, 'category' | 'city_name' | 'location_text'>): string => {
  const category = getCategoryMeta(report.category).label;
  return `${category} gemeld in ${report.city_name}: ${report.location_text}`;
};
