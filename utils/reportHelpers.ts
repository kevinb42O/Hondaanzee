import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  CheckCircle2,
  MapPin,
  Package,
  PawPrint,
  Skull,
  Trash2,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ReportCategory, ReportItem } from '../types.ts';

export const REPORT_CATEGORY_META: Record<
  ReportCategory,
  { label: string; accent: string; tone: string; emoji: string; icon: LucideIcon; iconTone: string }
> = {
  gif: {
    label: 'Gif of verdachte stof',
    accent: 'text-red-700',
    tone: 'bg-red-50 border-red-100',
    emoji: '☠️',
    icon: Skull,
    iconTone: 'border-red-300/20 bg-red-400/10 text-red-200',
  },
  afval: {
    label: 'Afval of sluikstort',
    accent: 'text-amber-700',
    tone: 'bg-amber-50 border-amber-100',
    emoji: '🗑️',
    icon: Trash2,
    iconTone: 'border-amber-300/20 bg-amber-400/10 text-amber-200',
  },
  weggegooid_voorwerp: {
    label: 'Weggegooid voorwerp',
    accent: 'text-orange-700',
    tone: 'bg-orange-50 border-orange-100',
    emoji: '📦',
    icon: Package,
    iconTone: 'border-orange-300/20 bg-orange-400/10 text-orange-200',
  },
  hondenpoep: {
    label: 'Hondenpoep',
    accent: 'text-emerald-700',
    tone: 'bg-emerald-50 border-emerald-100',
    emoji: '💩',
    icon: PawPrint,
    iconTone: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
  },
  gevaarlijke_situatie: {
    label: 'Gevaarlijke situatie',
    accent: 'text-fuchsia-700',
    tone: 'bg-fuchsia-50 border-fuchsia-100',
    emoji: '⚠️',
    icon: TriangleAlert,
    iconTone: 'border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200',
  },
  andere_overlast: {
    label: 'Andere overlast',
    accent: 'text-sky-700',
    tone: 'bg-sky-50 border-sky-100',
    emoji: '📍',
    icon: MapPin,
    iconTone: 'border-sky-300/20 bg-sky-400/10 text-sky-200',
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

export const getReportLeadVisual = (
  report: Pick<ReportItem, 'category' | 'city_intervention_status'>,
): { icon: LucideIcon; tone: string; label: string } => {
  if (report.city_intervention_status === 'resolved') {
    return {
      icon: CheckCircle2,
      tone: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200',
      label: 'Opgeruimd',
    };
  }

  const category = getCategoryMeta(report.category);

  return {
    icon: category.icon,
    tone: category.iconTone,
    label: category.label,
  };
};

export const getInterventionHeadline = (
  report: Pick<ReportItem, 'city_slug' | 'city_intervention_status'>,
): string => {
  if (report.city_intervention_status === 'resolved') {
    return getInterventionBadge(report) ?? 'Opgeruimd door stadsdiensten';
  }

  if (report.city_intervention_status === 'forwarded') {
    return report.city_slug === 'oostende'
      ? 'Doorgestuurd naar stadsdiensten in Oostende'
      : 'Doorgestuurd naar bevoegde diensten';
  }

  if (report.city_intervention_status === 'pending') {
    return report.city_slug === 'oostende'
      ? 'In afwachting van een update uit Oostende'
      : 'Wacht op een update van bevoegde diensten';
  }

  return 'Nog geen update van stadsdiensten';
};

export const getInterventionTone = (
  report: Pick<ReportItem, 'city_intervention_status'>,
): { panel: string; text: string; accent: string } => {
  if (report.city_intervention_status === 'resolved') {
    return {
      panel: 'border-emerald-200 bg-emerald-50',
      text: 'text-emerald-900',
      accent: 'text-emerald-700',
    };
  }

  if (report.city_intervention_status === 'forwarded') {
    return {
      panel: 'border-sky-200 bg-sky-50',
      text: 'text-sky-950',
      accent: 'text-sky-700',
    };
  }

  if (report.city_intervention_status === 'pending') {
    return {
      panel: 'border-amber-200 bg-amber-50',
      text: 'text-amber-950',
      accent: 'text-amber-700',
    };
  }

  return {
    panel: 'border-slate-200 bg-slate-50',
    text: 'text-slate-900',
    accent: 'text-slate-500',
  };
};

export const formatObservedDistance = (isoString: string): string =>
  formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: nl });

export const formatObservedAbsolute = (isoString: string): string =>
  format(new Date(isoString), "d MMMM yyyy 'om' HH:mm", { locale: nl });

export const formatReportShareText = (report: Pick<ReportItem, 'category' | 'city_name' | 'location_text'>): string => {
  const category = getCategoryMeta(report.category).label;
  return `${category} gemeld in ${report.city_name}: ${report.location_text}`;
};
