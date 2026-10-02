import { track } from '@vercel/analytics';

type SupportAction = 'steunvraag' | 'bedrag-5' | 'bedrag-10' | 'bedrag-25' | 'ander-bedrag' | 'iban-gekopieerd' | 'qr-bekeken' | 'gedeeld';

// Measure intent only: no donor data, entered amounts or claims of completed payments.
export function trackSupportAction(action: SupportAction) {
  if (typeof window === 'undefined' || !['hondaanzee.be', 'www.hondaanzee.be'].includes(window.location.hostname)
    || navigator.webdriver || navigator.doNotTrack === '1'
    || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  track('Steunactie', { actie: action, pagina: window.location.pathname });
}
