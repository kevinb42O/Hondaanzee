import {
  eventRequest,
  mergeEvent,
  eventImageUrls,
} from "../_shared/eventDraft.ts";
import { getSupabaseAdmin, handleOptions, json } from "../_shared/http.ts";
import { requireAdminUser } from "../_shared/security.ts";
const fields =
  "id,legacy_id,slug,version,draft_revision_id,published_revision_id,updated_at,draft:content_event_revisions!content_events_draft_revision_fk(content),published:content_event_revisions!content_events_published_revision_fk(content)";
Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let actor;
  try {
    actor = await requireAdminUser(req);
  } catch {
    return json({ error: "Log in met je beheeraccount." }, 403);
  }
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 131072)
      return json({ error: "De evenementinhoud is te groot." }, 413);
    const parsed = eventRequest.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return json(
        { error: parsed.error.issues[0]?.message || "Controleer je gegevens." },
        400,
      );
    const input = parsed.data,
      db = getSupabaseAdmin();
    if (input.action === "list") {
      const { data, error } = await db
        .from("content_events")
        .select(fields)
        .order("updated_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      const states = await db.rpc("admin_event_publication_states");
      if (states.error) throw states.error;
      return json({
        events: data.map((event) => ({
          ...event,
          publication_status: states.data[event.id] || null,
        })),
      });
    }
    let event: any = null;
    if (input.action !== "create") {
      const { data, error } = await db
        .from("content_events")
        .select(fields)
        .eq("id", input.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Evenement niet gevonden." }, 404);
      event = data;
    }
    if (input.action === "detail") {
      const { data, error } = await db
        .from("content_event_revisions")
        .select("id,revision_number,content,created_at")
        .eq("event_id", input.id)
        .order("revision_number", { ascending: false })
        .limit(200);
      if (error) throw error;
      const states = await db.rpc("admin_event_publication_states");
      if (states.error) throw states.error;
      return json({
        event: { ...event, publication_status: states.data[event.id] || null },
        history: data,
      });
    }
    let content: Record<string, unknown>;
    if (input.action === "restore") {
      const { data, error } = await db
        .from("content_event_revisions")
        .select("content")
        .eq("event_id", input.id)
        .eq("id", input.revisionId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Revisie niet gevonden." }, 404);
      content = data.content;
    } else {
      content = mergeEvent(
        event?.draft.content || {
          subtitle: "",
          highlights: [],
          tags: [],
          status: "announced",
          eventStatus: "scheduled",
          visibility: "visible",
        },
        input.patch,
      );
      const allowed = new Set([
        ...eventImageUrls(event?.draft.content || {}),
        ...eventImageUrls(event?.published?.content || {}),
      ]);
      const added = eventImageUrls(content).filter((url) => !allowed.has(url));
      if (added.length) {
        const { data, error } = await db
          .from("media_assets")
          .select("public_url")
          .eq("storage_provider", "r2")
          .eq("status", "verified")
          .in("public_url", added);
        if (error) throw error;
        if (
          data.length !== added.length ||
          added.some(
            (url) => !url.startsWith("https://media.hondaanzee.be/zaken/"),
          )
        )
          return json(
            {
              error:
                "Nieuwe afbeeldingen moeten uit de gecontroleerde R2-beeldbank komen.",
            },
            400,
          );
      }
    }
    const result =
      input.action === "create"
        ? await db.rpc("create_content_event_draft", {
            p_slug: input.slug,
            p_content: content,
            p_actor_id: actor.id,
          })
        : await db.rpc("save_content_event_draft", {
            p_event_id: input.id,
            p_expected_version: input.version,
            p_content: content,
            p_actor_id: actor.id,
          });
    if (result.error) throw result.error;
    return json(result.data, input.action === "create" ? 201 : 200);
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? String(error.message)
        : "";
    if (message.includes("VERSION_CONFLICT"))
      return json(
        {
          error:
            "Dit evenement is intussen gewijzigd. Je invoer is behouden; vergelijk eerst de laatste versie.",
        },
        409,
      );
    if (message.includes("duplicate key"))
      return json(
        {
          error: "Deze URL-slug bestaat al. Kies een andere voor deze editie.",
        },
        409,
      );
    if (error instanceof Error) return json({ error: message }, 400);
    return json(
      {
        error: "Het evenement kon niet worden verwerkt. Je invoer is behouden.",
      },
      500,
    );
  }
});
