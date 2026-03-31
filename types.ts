
export interface Hotspot {
  id: number;
  slug: string;
  name: string;
  summary?: string;
  recommendationNote?: string;
  type: 'Café' | 'Koffiebar' | 'Slapen' | 'Restaurant' | 'Brasserie' | 'Shoppen';
  description: string;
  tags: string[];
  image: string;
  images?: string[];
  imagePosition?: string; // e.g. 'center top' or '50% 25%'
  city: string; // city slug
  address: string;
  phone?: string;
  website?: string;
  websiteLabel?: string;
  sameAs?: string[];
}

export interface Service {
  id: number;
  slug: string;
  name: string;
  summary?: string;
  recommendationNote?: string;
  type: 'Dierenarts' | 'Dierenspeciaalzaak';
  description: string;
  tags: string[];
  image: string;
  images?: string[];
  imagePosition?: string; // e.g. 'center top' or '50% 25%'
  city: string; // city slug
  address: string;
  phone?: string;
  website: string;
  websiteLabel?: string;
  sameAs?: string[];
}

export type StatusValue = 'JA' | 'DEELS' | 'NEE';

export interface RulePeriodOverride {
  start: string; // MM-DD
  end: string;   // MM-DD
  status: StatusValue;
  rule: string;
  label?: string;
}

export interface OffLeashArea {
  name: string;
  slug: string; // Unique identifier for reviews
  address: string;
  lat: number;
  lng: number;
  city: string; // city slug
  description: string; // Changed from optional to required
  image?: string; // Path to primary image (for backwards compatibility)
  images?: string[]; // Array of image paths for gallery
  imagePosition?: string;
  rating?: number; // 1-5 stars
  openingHours?: {
    open: string; // HH:mm
    close: string; // HH:mm
  };
}

export interface CityRule {
  overrides?: RulePeriodOverride[];
  summer?: {
    start: string; // MM-DD
    end: string;   // MM-DD
    startTime?: string; // HH:mm
    endTime?: string;   // HH:mm
    rule: string;
    status: StatusValue;
  };
  winter: {
    rule: string;
    status: StatusValue;
  };
  special?: string;
  note?: string;
}

export interface City {
  slug: string;
  name: string;
  rules: CityRule;
  image: string;
  description: string;
  lat: number;
  lng: number;
  mapX?: number; // X coordinate on the SVG map (0-625)
  mapY?: number; // Y coordinate on the SVG map (0-372)
  labelOverride?: { x: number; y: number }; // Manual override for label position
  offLeashAreas: OffLeashArea[];
}

export type ReportCategory =
  | 'gif'
  | 'afval'
  | 'weggegooid_voorwerp'
  | 'hondenpoep'
  | 'gevaarlijke_situatie'
  | 'andere_overlast';

export type ReportStatus = 'published' | 'removed';

export type ReportInterventionStatus = 'not_applicable' | 'pending' | 'forwarded' | 'resolved';

export type ObservedPreset = 'now' | 'today-earlier' | 'yesterday' | 'custom';

export interface ReportItem {
  id: string;
  public_id: string;
  category: ReportCategory;
  city_slug: string;
  city_name: string;
  location_text: string;
  description: string;
  observed_at: string;
  created_at: string;
  status: ReportStatus;
  is_hidden: boolean;
  report_count: number;
  city_intervention_status: ReportInterventionStatus;
  city_intervention_note?: string | null;
  resolved_at?: string | null;
}

export interface ReportFilters {
  city: string;
  category: 'all' | ReportCategory;
}
