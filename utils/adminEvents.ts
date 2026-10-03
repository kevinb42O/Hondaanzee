import type { DogEvent } from "../data/events.ts";
import { adminFunction } from "./adminContent.ts";
export type EventRecord = {
  id: string;
  legacy_id: number;
  slug: string;
  version: number;
  draft_revision_id: string;
  published_revision_id: string | null;
  updated_at: string;
  publication_status?: "requested" | "building" | "failed" | null;
  draft: { content: DogEvent };
  published: { content: DogEvent } | null;
};
export type EventRevision = {
  id: string;
  revision_number: number;
  content: DogEvent;
  created_at: string;
};
export const adminEvents = <T>(body: Record<string, unknown>) =>
  adminFunction<T>("admin-events", body);
export function eventPublicationLabel(event: EventRecord) {
  if (event.publication_status)
    return (
      {
        requested: "Publicatie aangevraagd",
        building: "Website wordt gebouwd",
        failed: "Publicatie mislukt",
      } as const
    )[event.publication_status];
  return !event.published_revision_id
    ? "Nieuw concept"
    : event.draft_revision_id !== event.published_revision_id
      ? "Wijzigingen klaar"
      : event.published?.content.visibility === "withdrawn"
        ? "Ingetrokken"
        : "Gepubliceerd";
}
