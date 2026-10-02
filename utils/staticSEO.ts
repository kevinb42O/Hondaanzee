import { createContext } from 'react';
import type { SEOProps } from './seo';

// Build-only consumers collect the same metadata that the page applies in the
// browser. The normal application uses the default null context.
export const StaticSEOContext = createContext<((seo: SEOProps) => void) | null>(null);
