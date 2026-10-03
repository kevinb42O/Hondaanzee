import { describe, it, expect } from "vitest";
import { EVENT_DEFAULTS } from "../data/eventDefaults.ts";
import {
  eventPatch,
  eventRequest,
  mergeEvent,
  eventImageUrls,
} from "../supabase/functions/_shared/eventDraft.ts";
import {
  eventLocalTimestamp,
  eventDateDisplay,
} from "../supabase/functions/_shared/eventSchedule.ts";
import {
  getEventStructuredData,
  getUpcomingEvents,
  getEventSEO,
} from "./events.ts";
import { eventLinkAction } from "./eventAnalytics.ts";
const original = EVENT_DEFAULTS.find((e) => e.slug === "dogs-friends-2027")!;
describe("agenda drafts and real local times", () => {
  it("preserves every optional field and ordered gallery on a text-only save", () => {
    const merged = mergeEvent(original as unknown as Record<string, unknown>, {
      subtitle: "Andere subtitel",
    });
    expect(merged).toEqual({ ...original, subtitle: "Andere subtitel" });
  });
  it("validates all current published objects without modifying their contents", () => {
    for (const event of EVENT_DEFAULTS) {
      const { id: _, slug: __, ...fields } = event;
      expect(eventPatch.safeParse(fields).success, event.slug).toBe(true);
      expect(
        mergeEvent(event as unknown as Record<string, unknown>, {}),
      ).toEqual(event);
    }
  });
  it("clears unknown price and image fields without inventing values", () => {
    const merged = mergeEvent(original as unknown as Record<string, unknown>, {
      entryPrice: null,
      isAccessibleForFree: null,
      image: null,
    });
    expect(merged).not.toHaveProperty("entryPrice");
    expect(merged).not.toHaveProperty("isAccessibleForFree");
    expect(merged).not.toHaveProperty("image");
    expect(merged.detailGallery).toEqual(original.detailGallery);
  });
  it("protects identity and rejects unsafe source URLs and forged fields", () => {
    expect(eventPatch.safeParse({ slug: "changed" }).success).toBe(false);
    expect(
      eventPatch.safeParse({ website: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      eventRequest.safeParse({
        action: "restore",
        id: "bad",
        revisionId: "bad",
        version: 1,
      }).success,
    ).toBe(false);
  });
  it("keeps date-only announcements and derives the right winter/summer offset", () => {
    expect(eventLocalTimestamp("2026-11-15", "")).toBe("2026-11-15");
    expect(eventLocalTimestamp("2026-11-15", "12:00")).toBe(
      "2026-11-15T12:00:00+01:00",
    );
    expect(eventLocalTimestamp("2027-05-23", "09:00", "NL")).toBe(
      "2027-05-23T09:00:00+02:00",
    );
    expect(eventDateDisplay("2027-05-23", "2027-05-23")).toContain(
      "23 mei 2027",
    );
  });
  it("rejects impossible dates and the missing spring clock hour", () => {
    expect(() => eventLocalTimestamp("2026-02-30", "10:00")).toThrow();
    expect(() => eventLocalTimestamp("2027-03-28", "02:30")).toThrow(
      "zomertijd",
    );
    expect(eventLocalTimestamp("2026-10-25", "02:30")).toBe(
      "2026-10-25T02:30:00+02:00",
    );
  });
  it("rejects inconsistent dates, end times and fake free entry", () => {
    expect(() =>
      mergeEvent(original as any, { endDate: "2027-05-22" }),
    ).toThrow();
    expect(() =>
      mergeEvent(original as any, {
        schemaStartDate: "2027-05-23T09:00:00+01:00",
      }),
    ).toThrow("tijdzone");
    expect(() =>
      mergeEvent(original as any, {
        isAccessibleForFree: true,
        entryPrice: 12,
      }),
    ).toThrow("Gratis");
  });
  it("requires reasons for cancellation and withdrawal, and an original date on rescheduling", () => {
    expect(() =>
      mergeEvent(original as any, { eventStatus: "cancelled" }),
    ).toThrow("toelichting");
    expect(() =>
      mergeEvent(original as any, { visibility: "withdrawn" }),
    ).toThrow("reden");
    expect(() =>
      mergeEvent(original as any, {
        eventStatus: "rescheduled",
        statusNote: "Nieuwe datum",
      }),
    ).toThrow("oorspronkelijke");
  });
  it("renders cancellation and rescheduling honestly and removes expired offers", () => {
    const cancelled = {
      ...original,
      eventStatus: "cancelled" as const,
      statusNote: "Gaat niet door",
      entryPrice: 10,
      ticketUrl: "https://tickets.example",
    };
    expect(
      getEventStructuredData(cancelled, new Date("2026-10-03")).eventStatus,
    ).toBe("https://schema.org/EventCancelled");
    expect(
      getEventStructuredData(cancelled, new Date("2026-10-03")),
    ).not.toHaveProperty("offers");
    expect(getUpcomingEvents([cancelled], new Date("2026-10-03"))).toEqual([]);
    expect(
      getEventSEO(cancelled, new Date("2026-10-03")).description,
    ).toContain("Geannuleerd");
    expect(
      getEventStructuredData({
        ...original,
        eventStatus: "rescheduled",
        previousStartDate: "2027-05-22",
      }).previousStartDate,
    ).toBe("2027-05-22");
  });
  it("classifies one ticket click independently of the same organizer URL", () => {
    const event = { ...original, ticketUrl: original.website };
    expect(eventLinkAction(event, original.website!)).toBe("ticket");
    expect(eventLinkAction(event, "mailto:info@example.com")).toBe("email");
    expect(eventLinkAction(event, "tel:123")).toBe("telefoon");
    expect(eventImageUrls(original as any)).toHaveLength(2);
  });
});
