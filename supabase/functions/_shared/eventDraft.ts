import { z } from "zod";
import { CONTENT_CITIES } from "./contentDraft.ts";
import { validEventDate, eventLocalTimestamp } from "./eventSchedule.ts";
const text = (max: number) => z.string().trim().max(max);
const web = text(1000).refine((value) => {
  if (!value) return true;
  try {
    const u = new URL(value);
    return (
      ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
}, "Gebruik een volledige http- of https-link.");
const date = text(10).refine(validEventDate, "Kies een geldige datum.");
const timestamp = text(40).refine(
  (v) =>
    validEventDate(v) ||
    (/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:00\+(01|02):00$/.test(v) &&
      Number.isFinite(Date.parse(v))),
  "Kies een geldige datum met een bevestigd uur.",
);
const image = text(1000).refine(
  (v) => !v || /^\/(?!\/)[^\s]+$/.test(v) || web.safeParse(v).success,
  "Kies een geldige afbeelding.",
);
const list = (max = 1000) => z.array(text(max).min(1)).max(40);
const links = z
  .array(
    z
      .object({
        label: text(200).min(1),
        url: web.refine(Boolean, "Vul een link in."),
      })
      .strict(),
  )
  .max(30);
export const eventPatch = z
  .object({
    title: text(200).min(1),
    subtitle: text(400),
    city: text(160).min(1),
    cityName: text(200).min(1),
    citySlug: z.enum(CONTENT_CITIES).nullable(),
    date,
    endDate: date.nullable(),
    dateDisplay: text(200).min(1),
    timeDisplay: text(400).min(1),
    schemaStartDate: timestamp,
    schemaEndDate: timestamp,
    season: z.enum(["Lente", "Zomer", "Herfst", "Winter"]),
    category: text(100).min(1),
    description: text(16000).min(1),
    descriptionHighlight: text(2000).nullable(),
    highlights: list(),
    location: text(400).min(1),
    address: text(600).nullable(),
    structuredAddress: z
      .object({
        streetAddress: text(400).optional(),
        postalCode: text(40).optional(),
        addressLocality: text(200).optional(),
      })
      .strict()
      .nullable(),
    country: z.enum(["BE", "NL"]),
    region: z.enum(["kust", "west-vlaanderen", "belgie", "zeeland"]),
    price: text(1000).min(1),
    isAccessibleForFree: z.boolean().nullable(),
    entryPrice: z.number().finite().min(0).max(100000).nullable(),
    ticketUrl: web.nullable(),
    website: web.nullable(),
    websiteLabel: text(200).nullable(),
    organizerName: text(200).nullable(),
    organizerUrl: web.nullable(),
    additionalLinks: links,
    email: text(200)
      .refine(
        (v) => !v || z.email().safeParse(v).success,
        "Vul een geldig e-mailadres in.",
      )
      .nullable(),
    phone: text(100).nullable(),
    status: z.enum(["confirmed", "save-the-date", "announced"]),
    eventStatus: z.enum(["scheduled", "cancelled", "postponed", "rescheduled"]),
    previousStartDate: timestamp.nullable(),
    statusNote: text(2000).nullable(),
    visibility: z.enum(["visible", "withdrawn"]),
    withdrawalReason: text(2000).nullable(),
    lastVerified: date.nullable(),
    dogPolicy: text(6000).nullable(),
    practicalNotes: list(3000),
    sources: links,
    accessibility: list(),
    tags: list(100),
    image: image.nullable(),
    imageAlt: text(500).nullable(),
    imageKind: z.enum(["photo", "poster"]).nullable(),
    imageCaption: text(2000).nullable(),
    imageCredit: text(500).nullable(),
    imageSourceUrl: web.nullable(),
    imagePosition: text(80)
      .regex(
        /^(center|center top|center bottom|left center|right center|\d{1,3}% \d{1,3}%|center \d{1,3}%)$/,
      )
      .nullable(),
    detailGallery: z
      .object({
        eyebrow: text(200).optional(),
        title: text(200).min(1),
        description: text(2000).optional(),
        images: z
          .array(
            z
              .object({
                src: image.refine(Boolean),
                alt: text(500).min(1),
                label: text(200).min(1),
                credit: text(500).optional(),
                sourceUrl: web.optional(),
              })
              .strict(),
          )
          .max(30),
      })
      .strict()
      .nullable(),
  })
  .partial()
  .strict();
const identity = z
  .string()
  .max(160)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
export const eventRequest = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }).strict(),
  z.object({ action: z.literal("detail"), id: z.uuid() }).strict(),
  z
    .object({
      action: z.literal("save"),
      id: z.uuid(),
      version: z.number().int().positive(),
      patch: eventPatch,
    })
    .strict(),
  z
    .object({
      action: z.literal("create"),
      slug: identity,
      patch: eventPatch.required({
        title: true,
        city: true,
        cityName: true,
        date: true,
        dateDisplay: true,
        timeDisplay: true,
        schemaStartDate: true,
        schemaEndDate: true,
        season: true,
        category: true,
        description: true,
        location: true,
        price: true,
      }),
    })
    .strict(),
  z
    .object({
      action: z.literal("restore"),
      id: z.uuid(),
      version: z.number().int().positive(),
      revisionId: z.uuid(),
    })
    .strict(),
]);
export function mergeEvent(
  original: Record<string, unknown>,
  patch: z.infer<typeof eventPatch>,
): Record<string, unknown> {
  const content: Record<string, unknown> = { ...original };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete content[key];
    else content[key] = value;
  }
  const start = String(content.date || ""),
    end = String(
      content.endDate || String(content.schemaEndDate || "").slice(0, 10),
    );
  if (!validEventDate(start) || !validEventDate(end) || end < start)
    throw new Error("De einddatum moet op of na de begindatum liggen.");
  for (const [key, day] of [
    ["schemaStartDate", start],
    ["schemaEndDate", end],
  ]) {
    const value = String(content[key] || "");
    if (!timestamp.safeParse(value).success || value.slice(0, 10) !== day)
      throw new Error(
        "De schemadatums moeten overeenkomen met de evenementdatums.",
      );
    if (
      value.includes("T") &&
      eventLocalTimestamp(
        day,
        value.slice(11, 16),
        content.country === "NL" ? "NL" : "BE",
      ) !== value
    ) {
      // Both occurrences of the repeated autumn hour are real and allowed.
      const zone =
        content.country === "NL" ? "Europe/Amsterdam" : "Europe/Brussels";
      const rendered = new Intl.DateTimeFormat("sv-SE", {
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date(value));
      if (rendered !== `${day} ${value.slice(11, 16)}`)
        throw new Error(
          "Het uur of de tijdzone klopt niet met de lokale datum.",
        );
    }
  }
  if (
    String(content.schemaStartDate).includes("T") &&
    String(content.schemaEndDate).includes("T") &&
    Date.parse(String(content.schemaEndDate)) <=
      Date.parse(String(content.schemaStartDate))
  )
    throw new Error("Het einduur moet na het beginuur liggen.");
  if (
    content.eventStatus === "rescheduled" &&
    !timestamp.safeParse(content.previousStartDate).success
  )
    throw new Error(
      "Vul de oorspronkelijke datum in bij een verplaatst evenement.",
    );
  if (
    ["cancelled", "postponed", "rescheduled"].includes(
      String(content.eventStatus),
    ) &&
    !String(content.statusNote || "").trim()
  )
    throw new Error("Geef een toelichting bij de gewijzigde evenementstatus.");
  if (
    content.visibility === "withdrawn" &&
    !String(content.withdrawalReason || "").trim()
  )
    throw new Error("Geef een reden om de fiche in te trekken.");
  if (
    content.isAccessibleForFree === true &&
    typeof content.entryPrice === "number" &&
    content.entryPrice > 0
  )
    throw new Error("Gratis toegang kan geen positieve toegangsprijs hebben.");
  return content;
}
export function eventImageUrls(content: Record<string, unknown>): string[] {
  const gallery = content.detailGallery as
    | { images?: { src: string }[] }
    | undefined;
  return [
    ...new Set(
      [content.image, ...(gallery?.images || []).map((x) => x.src)].filter(
        (x): x is string => typeof x === "string" && !!x,
      ),
    ),
  ];
}
