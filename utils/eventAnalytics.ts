import type { DogEvent } from "../data/events.ts";
import { recordSiteEvent } from "./siteAnalytics.ts";
export function eventRouteUrl(event: DogEvent): string | undefined {
  return event.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`
    : undefined;
}
export function eventLinkAction(
  event: DogEvent,
  url: string,
): "ticket" | "website" | "telefoon" | "email" | "social" | "route" {
  if (url.startsWith("tel:")) return "telefoon";
  if (url.startsWith("mailto:")) return "email";
  if (url === event.ticketUrl) return "ticket";
  if (url === eventRouteUrl(event)) return "route";
  try {
    if (/(^|\.)(facebook\.com|instagram\.com)$/.test(new URL(url).hostname))
      return "social";
  } catch {
    /* internal navigation is handled separately */
  }
  return "website";
}
export function trackEventLink(event: DogEvent, url: string) {
  if (
    typeof window === "undefined" ||
    window.location.pathname !== `/agenda/${event.slug}`
  )
    return;
  recordSiteEvent(`/agenda/${event.slug}`, eventLinkAction(event, url));
}
