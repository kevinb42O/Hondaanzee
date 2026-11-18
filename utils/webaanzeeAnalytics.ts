import { track } from '@vercel/analytics';

export type WebaanzeeSource = 'zaak-aanmelden' | 'over-ons' | 'footer';
export type WebaanzeeAction = 'bekeken' | 'email-geopend' | 'whatsapp-geopend' | 'voorbeelden-bekeken';

// Intent only: never send form values, contact details or claims of received leads.
export function trackWebaanzeeAction(source: WebaanzeeSource, action: WebaanzeeAction) {
  if (typeof window === 'undefined' || !['hondaanzee.be', 'www.hondaanzee.be'].includes(window.location.hostname)
    || navigator.webdriver || navigator.doNotTrack === '1'
    || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  track('Webaanzee', { plek: source, actie: action });
}

export function webaanzeeUrl(source: WebaanzeeSource) {
  return `https://www.webaanzee.be/?utm_source=hondaanzee&utm_medium=referral&utm_campaign=websitecheck&utm_content=${source}`;
}
