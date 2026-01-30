
export interface Hotspot {
  id: number;
  name: string;
  type: 'Café' | 'Hotel' | 'Restaurant' | 'Beach Bar';
  description: string;
  tags: string[];
  image: string;
  imagePosition?: string; // e.g. 'center top' or '50% 25%'
  city: string; // city slug
  address: string;
  website: string;
}

export interface Service {
  id: number;
  name: string;
  type: 'Dierenarts' | 'Dierenspeciaalzaak';
  description: string;
  tags: string[];
  image: string;
  imagePosition?: string; // e.g. 'center top' or '50% 25%'
  city: string; // city slug
  address: string;
  website: string;
}

export type StatusValue = 'JA' | 'DEELS' | 'NEE';

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
