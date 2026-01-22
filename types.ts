
export interface Hotspot {
  id: number;
  name: string;
  type: 'Café' | 'Hotel' | 'Restaurant' | 'Beach Bar';
  description: string;
  tags: string[];
  image: string;
}

export type StatusValue = 'JA' | 'DEELS' | 'NEE';

export interface OffLeashArea {
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
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
  offLeashAreas: OffLeashArea[];
}
