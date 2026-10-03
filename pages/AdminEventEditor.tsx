import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, Save, Eye, Copy, BarChart3 } from "lucide-react";
import type { DogEvent } from "../data/events.ts";
import {
  adminEvents,
  eventPublicationLabel,
  type EventRecord,
  type EventRevision,
} from "../utils/adminEvents.ts";
import {
  eventDateDisplay,
  eventLocalTimestamp,
  eventSeason,
} from "../supabase/functions/_shared/eventSchedule.ts";
import { getEventSEO, EVENT_REGION_LABELS } from "../utils/events.ts";
import { CITIES } from "../cityData.ts";
import EventDetailContent from "../components/EventDetailContent.tsx";
import AdminMediaPicker from "../components/admin/AdminMediaPicker.tsx";
const tabs = [
  "Inhoud",
  "Datum & plaats",
  "Organisator & prijs",
  "Foto’s",
  "Publicatie & SEO",
  "Geschiedenis",
];
function emptyEvent(): DogEvent {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return {
    id: 0,
    slug: "",
    title: "",
    subtitle: "",
    city: "",
    cityName: "",
    date,
    endDate: date,
    dateDisplay: eventDateDisplay(date, date),
    timeDisplay: "Uren nog niet bekend",
    schemaStartDate: date,
    schemaEndDate: date,
    season: eventSeason(date),
    category: "Wandeling",
    description: "",
    highlights: [],
    location: "",
    country: "BE",
    region: "kust",
    price: "Prijs nog niet bekend",
    tags: [],
    status: "announced",
    eventStatus: "scheduled",
    visibility: "visible",
  };
}
const lines = (value: string) =>
  value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
export default function AdminEventEditor() {
  const { id } = useParams(),
    navigate = useNavigate(),
    [params] = useSearchParams(),
    isNew = !id;
  const [record, setRecord] = useState<EventRecord | null>(null),
    [value, setValue] = useState<DogEvent>(emptyEvent),
    [patch, setPatch] = useState<Record<string, unknown>>({}),
    [history, setHistory] = useState<EventRevision[]>([]),
    [tab, setTab] = useState(tabs[0]),
    [preview, setPreview] = useState(false),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [comparison, setComparison] = useState<EventRecord | null>(null),
    [revision, setRevision] = useState<EventRevision | null>(null);
  const sequence = useRef(0),
    bypass = useRef(false);
  const setLoaded = (data: {
    event: EventRecord;
    history: EventRevision[];
  }) => {
    setRecord(data.event);
    setValue(data.event.draft.content);
    setHistory(data.history);
    setPatch({});
    setComparison(null);
    setRevision(null);
  };
  const load = async () => {
    if (!id) return;
    const n = ++sequence.current;
    setLoading(true);
    setError("");
    try {
      const data = await adminEvents<{
        event: EventRecord;
        history: EventRevision[];
      }>({ action: "detail", id });
      if (n === sequence.current) setLoaded(data);
    } catch (e) {
      if (n === sequence.current)
        setError(e instanceof Error ? e.message : "Laden mislukt.");
    } finally {
      if (n === sequence.current) setLoading(false);
    }
  };
  useEffect(() => {
    bypass.current = false;
    setRecord(null);
    setPatch({});
    setNotice("");
    setPreview(false);
    setTab(tabs[0]);
    setComparison(null);
    setRevision(null);
    if (id) void load();
    else {
      const base = emptyEvent();
      setValue(base);
      setHistory([]);
      setLoading(!!params.get("copy"));
      if (params.get("copy"))
        void adminEvents<{ event: EventRecord; history: EventRevision[] }>({
          action: "detail",
          id: params.get("copy"),
        })
          .then((data) => {
            const source = data.event.draft.content;
            const copied = {
              ...base,
              title: source.title,
              subtitle: source.subtitle,
              category: source.category,
              city: source.city,
              cityName: source.cityName,
              citySlug: source.citySlug,
              region: source.region,
              country: source.country,
              location: source.location,
              address: source.address,
              structuredAddress: source.structuredAddress,
              organizerName: source.organizerName,
              organizerUrl: source.organizerUrl,
              website: source.website,
              websiteLabel: source.websiteLabel,
              description: source.description,
              highlights: source.highlights,
              tags: source.tags,
            };
            setValue(copied);
            const { id: _, slug: __, ...fields } = copied;
            setPatch(fields);
            setNotice(
              "Nieuwe editie: controleer de nieuwe datum, alle praktische informatie en actuele beeldbronnen. Prijs, tickets, controles en fotoselectie zijn niet overgenomen.",
            );
          })
          .catch((e) => setError(e.message))
          .finally(() => setLoading(false));
    }
    return () => {
      sequence.current++;
    };
  }, [id, params.get("copy")]);
  const dirty = Object.keys(patch).length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (!bypass.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const click = (e: MouseEvent) => {
      const a = (e.target as Element)?.closest("a[href]");
      if (
        a &&
        a.getAttribute("href")?.startsWith("/admin/") &&
        !saving &&
        !bypass.current &&
        !window.confirm(
          "Je hebt niet-opgeslagen wijzigingen. Wil je de pagina verlaten?",
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", click, true);
    };
  }, [dirty, saving]);
  const updates = (fields: Record<string, unknown>) => {
    setValue((old) => {
      const next = { ...old };
      for (const [k, v] of Object.entries(fields)) {
        if (v === null) delete (next as any)[k];
        else (next as any)[k] = v;
      }
      return next;
    });
    setPatch((old) => ({ ...old, ...fields }));
    setNotice("");
  };
  const update = (key: keyof DogEvent, v: unknown) => updates({ [key]: v });
  const changeDate = (
    fields: Partial<DogEvent>,
    startTime = value.schemaStartDate.includes("T")
      ? value.schemaStartDate.slice(11, 16)
      : "",
    endTime = value.schemaEndDate.includes("T")
      ? value.schemaEndDate.slice(11, 16)
      : "",
  ) => {
    const next = { ...value, ...fields };
    const end = next.endDate || next.date;
    try {
      updates({
        ...fields,
        endDate: end,
        dateDisplay: eventDateDisplay(next.date, end),
        season: eventSeason(next.date),
        schemaStartDate: eventLocalTimestamp(
          next.date,
          startTime,
          next.country,
        ),
        schemaEndDate: eventLocalTimestamp(end, endTime, next.country),
      });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (isNew) {
        const { id: _, slug: __, ...fields } = value;
        for (const key of [
          "highlights",
          "tags",
          "practicalNotes",
          "accessibility",
        ])
          if (Array.isArray((fields as any)[key]))
            (fields as any)[key] = (fields as any)[key]
              .map((x: string) => x.trim())
              .filter(Boolean);
        const result = await adminEvents<{ id: string }>({
          action: "create",
          slug: value.slug,
          patch: fields,
        });
        bypass.current = true;
        setPatch({});
        navigate(`/admin/agenda/${result.id}`, { replace: true });
      } else {
        const clean = { ...patch };
        for (const key of [
          "highlights",
          "tags",
          "practicalNotes",
          "accessibility",
        ])
          if (Array.isArray(clean[key]))
            clean[key] = (clean[key] as string[])
              .map((x) => x.trim())
              .filter(Boolean);
        await adminEvents({
          action: "save",
          id,
          version: record!.version,
          patch: clean,
        });
        await load();
        setNotice(
          "Concept opgeslagen. Publiceer om de openbare agenda bij te werken.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opslaan mislukt.");
      if (record)
        try {
          const data = await adminEvents<{ event: EventRecord }>({
            action: "detail",
            id,
          });
          if (data.event.version !== record.version) setComparison(data.event);
        } catch {
          /* retain all local form input */
        }
    } finally {
      setSaving(false);
    }
  };
  const restore = async (r: EventRevision) => {
    if (
      dirty &&
      !window.confirm(
        "De opgeslagen revisie vervangt je niet-opgeslagen invoer. Doorgaan?",
      )
    )
      return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await adminEvents({
        action: "restore",
        id,
        version: record!.version,
        revisionId: r.id,
      });
      await load();
      setNotice(
        `Versie ${r.revision_number} is als nieuw concept hersteld. Publiceer om deze live te zetten.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };
  const input = (
    key: keyof DogEvent,
    label: string,
    required = false,
    type = "text",
  ) => (
    <label>
      {label}
      <input
        name={key}
        type={type}
        value={String(value[key] ?? "")}
        required={required}
        onChange={(e) => update(key, e.target.value || (required ? "" : null))}
      />
    </label>
  );
  const area = (key: keyof DogEvent, label: string, required = false) => (
    <label>
      {label}
      <textarea
        name={key}
        rows={key === "description" ? 8 : 3}
        value={String(value[key] ?? "")}
        required={required}
        onChange={(e) => update(key, e.target.value || (required ? "" : null))}
      />
    </label>
  );
  const array = (
    key: "highlights" | "tags" | "practicalNotes" | "accessibility",
    label: string,
  ) => (
    <label>
      {label}
      <textarea
        name={key}
        rows={4}
        value={(value[key] || []).join("\n")}
        onChange={(e) => update(key, e.target.value.split("\n"))}
      />
      <small>Eén onderdeel per regel.</small>
    </label>
  );
  const linkList = (key: "sources" | "additionalLinks", label: string) => {
    const items = value[key] || [];
    return (
      <section>
        <h3>{label}</h3>
        {items.map((item, index) => (
          <div className="workspace-event-link" key={index}>
            <label>
              Naam
              <input
                value={item.label}
                onChange={(e) =>
                  update(
                    key,
                    items.map((x, i) =>
                      i === index ? { ...x, label: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label>
              Link
              <input
                type="url"
                value={item.url}
                onChange={(e) =>
                  update(
                    key,
                    items.map((x, i) =>
                      i === index ? { ...x, url: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <button
              type="button"
              className="workspace-button"
              onClick={() =>
                update(
                  key,
                  items.filter((_, i) => i !== index),
                )
              }
            >
              Verwijderen
            </button>
          </div>
        ))}
        <button
          type="button"
          className="workspace-button"
          onClick={() => update(key, [...items, { label: "", url: "" }])}
        >
          Link toevoegen
        </button>
      </section>
    );
  };
  const mediaUrls = [
    ...new Set(
      [
        value.image,
        ...(value.detailGallery?.images || []).map((x) => x.src),
      ].filter(Boolean),
    ),
  ] as string[];
  const seo = getEventSEO(value);
  return (
    <>
      <Link className="workspace-text-link" to="/admin/agenda">
        <ArrowLeft size={16} />
        Alle evenementen
      </Link>
      <div className="workspace-page-heading">
        <div>
          <p className="workspace-eyebrow">Evenement beheren</p>
          <h1>{isNew ? "Nieuw evenement" : value.title}</h1>
          <p>
            {record
              ? `${eventPublicationLabel(record)} · versie ${record.version}`
              : "Begin met een privéconcept voor een nieuwe editie."}
          </p>
        </div>
        <div className="workspace-event-buttons">
          <button
            type="button"
            className="workspace-button"
            onClick={() => setPreview((v) => !v)}
          >
            <Eye size={16} />
            {preview ? "Verder bewerken" : "Concept bekijken"}
          </button>
          {record && (
            <>
              <Link
                className="workspace-button"
                to={`/admin/agenda/nieuw?copy=${record.id}`}
              >
                <Copy size={16} />
                Nieuwe editie
              </Link>
              <Link
                className="workspace-button"
                to={`/admin/analytics/agenda/${record.id}`}
              >
                <BarChart3 size={16} />
                Analytics
              </Link>
            </>
          )}
        </div>
      </div>
      {loading ? (
        <section className="workspace-panel" role="status">
          Evenement laden…
        </section>
      ) : !isNew && !record ? (
        <section className="workspace-panel">
          <p className="workspace-error" role="alert">
            {error}
          </p>
          <button className="workspace-button" onClick={() => void load()}>
            Opnieuw proberen
          </button>
        </section>
      ) : (
        <form onSubmit={save}>
          <div className="workspace-period" aria-label="Evenementonderdelen">
            {tabs.map((name) => (
              <button
                type="button"
                key={name}
                className={tab === name ? "is-active" : ""}
                onClick={() => {
                  setTab(name);
                  setPreview(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
          {preview ? (
            <section className="workspace-panel workspace-event-preview">
              <p className="workspace-note">
                Privépreview van je concept. Deze weergave wordt niet gemeten en
                is niet openbaar.
              </p>
              <EventDetailContent event={value} />
            </section>
          ) : (
            <div className="workspace-editor-grid">
              <section className="workspace-panel workspace-form">
                {tab === "Inhoud" && (
                  <>
                    <h2>Over het evenement</h2>
                    {input("title", "Titel", true)}
                    {input("subtitle", "Subtitel")}
                    {input("category", "Categorie", true)}
                    {area("description", "Beschrijving", true)}
                    {area("descriptionHighlight", "Uitgelichte tekst")}
                    {array("highlights", "Hoogtepunten")}
                    {area("dogPolicy", "Hondenvoorwaarden")}
                    {array("practicalNotes", "Praktische opmerkingen")}
                    {array("accessibility", "Toegankelijkheid")}
                    {array("tags", "Tags")}
                  </>
                )}
                {tab === "Datum & plaats" && (
                  <>
                    <h2>Datum en locatie</h2>
                    <div className="workspace-coordinate-grid">
                      <label>
                        Begindatum
                        <input
                          name="date"
                          type="date"
                          required
                          value={value.date}
                          onChange={(e) =>
                            changeDate({
                              date: e.target.value,
                              ...((value.endDate || value.date) < e.target.value
                                ? { endDate: e.target.value }
                                : {}),
                            })
                          }
                        />
                      </label>
                      <label>
                        Einddatum
                        <input
                          name="endDate"
                          type="date"
                          min={value.date}
                          required
                          value={
                            value.endDate || value.schemaEndDate.slice(0, 10)
                          }
                          onChange={(e) =>
                            changeDate({ endDate: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Bevestigd beginuur
                        <input
                          name="startTime"
                          type="time"
                          value={
                            value.schemaStartDate.includes("T")
                              ? value.schemaStartDate.slice(11, 16)
                              : ""
                          }
                          onChange={(e) => changeDate({}, e.target.value)}
                        />
                        <small>Laat leeg als het uur onbekend is.</small>
                      </label>
                      <label>
                        Bevestigd einduur
                        <input
                          name="endTime"
                          type="time"
                          value={
                            value.schemaEndDate.includes("T")
                              ? value.schemaEndDate.slice(11, 16)
                              : ""
                          }
                          onChange={(e) =>
                            changeDate({}, undefined, e.target.value)
                          }
                        />
                        <small>Laat leeg voor een onbekend einduur.</small>
                      </label>
                    </div>
                    {input("dateDisplay", "Zichtbare datumtekst", true)}
                    {input("timeDisplay", "Zichtbare uren / programma", true)}
                    <label>
                      Land
                      <select
                        value={value.country || "BE"}
                        onChange={(e) =>
                          changeDate({ country: e.target.value as "BE" | "NL" })
                        }
                      >
                        <option value="BE">België · Brussel</option>
                        <option value="NL">Nederland · Amsterdam</option>
                      </select>
                    </label>
                    <label>
                      Regio
                      <select
                        value={value.region || "kust"}
                        onChange={(e) => update("region", e.target.value)}
                      >
                        {Object.entries(EVENT_REGION_LABELS).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    {input("cityName", "Plaatsnaam", true)}
                    {input("city", "Interne plaatscode", true)}
                    {input("location", "Locatienaam", true)}
                    {input("address", "Volledig adres")}
                    <div className="workspace-coordinate-grid">
                      {[
                        ["streetAddress", "Straat en nummer"],
                        ["postalCode", "Postcode"],
                        ["addressLocality", "Adresplaats"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            value={
                              value.structuredAddress?.[
                                key as keyof DogEvent["structuredAddress"]
                              ] || ""
                            }
                            onChange={(e) =>
                              update("structuredAddress", {
                                ...value.structuredAddress,
                                [key]: e.target.value,
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <label>
                      Kustgemeentegids
                      <select
                        value={value.citySlug || ""}
                        onChange={(e) =>
                          update("citySlug", e.target.value || null)
                        }
                      >
                        <option value="">Geen koppeling</option>
                        {CITIES.map((city) => (
                          <option key={city.slug} value={city.slug}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                {tab === "Organisator & prijs" && (
                  <>
                    <h2>Organisator en deelname</h2>
                    {input("organizerName", "Organisator")}
                    {input("organizerUrl", "Organisatorwebsite", false, "url")}
                    {input(
                      "website",
                      "Informatie / inschrijflink",
                      false,
                      "url",
                    )}
                    {input("websiteLabel", "Linktekst")}
                    {input("email", "E-mail", false, "email")}
                    {input("phone", "Telefoon")}
                    {input("price", "Zichtbare prijsinformatie", true)}
                    <label>
                      Algemene toegang
                      <select
                        value={
                          value.isAccessibleForFree === undefined
                            ? "unknown"
                            : value.isAccessibleForFree
                              ? "free"
                              : "paid"
                        }
                        onChange={(e) =>
                          update(
                            "isAccessibleForFree",
                            e.target.value === "unknown"
                              ? null
                              : e.target.value === "free",
                          )
                        }
                      >
                        <option value="unknown">Nog niet bekend</option>
                        <option value="free">Bevestigd gratis</option>
                        <option value="paid">Betalend</option>
                      </select>
                    </label>
                    <label>
                      Bevestigde hoofdticketprijs (€)
                      <input
                        name="entryPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={value.entryPrice ?? ""}
                        onChange={(e) =>
                          update(
                            "entryPrice",
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                      <small>
                        Laat leeg bij onzekere tarieven; gratis honden of
                        kinderen maken de toegang niet gratis.
                      </small>
                    </label>
                    {input(
                      "ticketUrl",
                      "Specifieke ticketpagina",
                      false,
                      "url",
                    )}
                    {linkList("additionalLinks", "Extra links")}
                    {linkList("sources", "Bronnen")}
                    {input(
                      "lastVerified",
                      "Datum van inhoudscontrole",
                      false,
                      "date",
                    )}
                    <small>
                      Pas deze datum alleen aan na een echte controle bij de
                      organisator.
                    </small>
                  </>
                )}
                {tab === "Foto’s" && (
                  <>
                    <h2>Foto’s en bronvermeldingen</h2>
                    {input("imageAlt", "Alttekst hoofdfoto")}
                    <label>
                      Beeldtype
                      <select
                        value={value.imageKind || "photo"}
                        onChange={(e) => update("imageKind", e.target.value)}
                      >
                        <option value="photo">Foto</option>
                        <option value="poster">Poster</option>
                      </select>
                    </label>
                    {area("imageCaption", "Bijschrift")}
                    {input("imageCredit", "Fotocredit")}
                    {input(
                      "imageSourceUrl",
                      "Bron van de hoofdfoto",
                      false,
                      "url",
                    )}
                    {value.detailGallery && (
                      <>
                        <label>
                          Galerijtitel
                          <input
                            value={value.detailGallery.title}
                            onChange={(e) =>
                              update("detailGallery", {
                                ...value.detailGallery,
                                title: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Kleine titel boven de galerij
                          <input
                            value={value.detailGallery.eyebrow || ""}
                            onChange={(e) =>
                              update("detailGallery", {
                                ...value.detailGallery,
                                eyebrow: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Galerijbeschrijving
                          <textarea
                            value={value.detailGallery.description || ""}
                            onChange={(e) =>
                              update("detailGallery", {
                                ...value.detailGallery,
                                description: e.target.value,
                              })
                            }
                          />
                        </label>
                        {value.detailGallery.images.map((image, index) => (
                          <section
                            className="workspace-event-gallery"
                            key={image.src}
                          >
                            <img src={image.src} alt={image.alt} />
                            {[
                              ["alt", "Alttekst"],
                              ["label", "Bijschrift"],
                              ["credit", "Credit"],
                              ["sourceUrl", "Bron-URL"],
                            ].map(([key, label]) => (
                              <label key={key}>
                                {label}
                                <input
                                  value={image[key as keyof typeof image] || ""}
                                  onChange={(e) =>
                                    update("detailGallery", {
                                      ...value.detailGallery,
                                      images: value.detailGallery!.images.map(
                                        (x, i) =>
                                          i === index
                                            ? { ...x, [key]: e.target.value }
                                            : x,
                                      ),
                                    })
                                  }
                                />
                              </label>
                            ))}
                          </section>
                        ))}
                      </>
                    )}
                  </>
                )}
                {tab === "Publicatie & SEO" && (
                  <>
                    <h2>Status en zoekresultaat</h2>
                    <label>
                      Informatiezekerheid
                      <select
                        value={value.status || "announced"}
                        onChange={(e) => update("status", e.target.value)}
                      >
                        <option value="confirmed">Bevestigd</option>
                        <option value="announced">Aangekondigd</option>
                        <option value="save-the-date">
                          Save the date · details volgen
                        </option>
                      </select>
                    </label>
                    <label>
                      Evenementstatus
                      <select
                        value={value.eventStatus || "scheduled"}
                        onChange={(e) => update("eventStatus", e.target.value)}
                      >
                        <option value="scheduled">
                          Gaat door volgens planning
                        </option>
                        <option value="cancelled">Geannuleerd</option>
                        <option value="postponed">
                          Uitgesteld · datum volgt
                        </option>
                        <option value="rescheduled">
                          Verplaatst naar nieuwe datum
                        </option>
                      </select>
                    </label>
                    {value.eventStatus && value.eventStatus !== "scheduled" && (
                      <>
                        {area("statusNote", "Toelichting bij de status", true)}
                        {value.eventStatus === "rescheduled" &&
                          input(
                            "previousStartDate",
                            "Oorspronkelijke datum (YYYY-MM-DD of datum met tijdzone)",
                            true,
                          )}
                      </>
                    )}
                    <label>
                      Publieke fiche
                      <select
                        value={value.visibility || "visible"}
                        onChange={(e) => update("visibility", e.target.value)}
                      >
                        <option value="visible">
                          Beschikbaar op de website
                        </option>
                        <option value="withdrawn">
                          Intrekken bij publicatie
                        </option>
                      </select>
                    </label>
                    {value.visibility === "withdrawn" &&
                      area("withdrawalReason", "Reden van intrekken", true)}
                    <p className="workspace-note">
                      Een afgelopen editie blijft vanzelf als archief
                      bereikbaar. Intrekken verwijdert de fiche uit de site en
                      sitemap na publicatie.
                    </p>
                    <div className="workspace-event-seo">
                      <h3>{seo.title}</h3>
                      <p>{seo.description}</p>
                      <small>{seo.canonical}</small>
                    </div>
                    {(!value.dogPolicy ||
                      !value.sources?.length ||
                      !value.lastVerified) && (
                      <p className="workspace-note">
                        Controleer nog de hondenvoorwaarden, informatiebronnen
                        en controledatum. Onbekende gegevens mogen eerlijk
                        onbekend blijven.
                      </p>
                    )}
                  </>
                )}
                {tab === "Geschiedenis" && (
                  <>
                    <h2>Versies vergelijken en herstellen</h2>
                    {history.map((r) => (
                      <details className="workspace-revision" key={r.id}>
                        <summary>
                          Versie {r.revision_number} ·{" "}
                          {new Date(r.created_at).toLocaleString("nl-BE", {
                            timeZone: "Europe/Brussels",
                          })}
                          {r.id === record?.published_revision_id
                            ? " · Gepubliceerd"
                            : ""}
                        </summary>
                        <p>
                          {r.content.title} · {r.content.dateDisplay}
                        </p>
                        <div className="workspace-event-buttons">
                          <button
                            type="button"
                            className="workspace-button"
                            onClick={() => setRevision(r)}
                          >
                            Vergelijken met concept
                          </button>
                          <button
                            type="button"
                            className="workspace-button"
                            disabled={saving}
                            onClick={() => void restore(r)}
                          >
                            Als nieuw concept herstellen
                          </button>
                        </div>
                      </details>
                    ))}
                    {revision && (
                      <div className="workspace-table-scroll">
                        <table className="workspace-event-diff">
                          <thead>
                            <tr>
                              <th>Veld</th>
                              <th>Versie {revision.revision_number}</th>
                              <th>Huidig concept</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ...new Set([
                                ...Object.keys(revision.content),
                                ...Object.keys(value),
                              ]),
                            ]
                              .filter(
                                (k) =>
                                  JSON.stringify(
                                    (revision.content as any)[k],
                                  ) !== JSON.stringify((value as any)[k]),
                              )
                              .map((k) => (
                                <tr key={k}>
                                  <td>{k}</td>
                                  <td>
                                    {JSON.stringify(
                                      (revision.content as any)[k],
                                    ) || "Leeg"}
                                  </td>
                                  <td>
                                    {JSON.stringify((value as any)[k]) ||
                                      "Leeg"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {!history.length && <p>Nog geen revisies.</p>}
                  </>
                )}
              </section>
              <aside className="workspace-editor-aside">
                <section className="workspace-panel workspace-form">
                  <h2>Deze editie</h2>
                  <label>
                    Vaste URL-slug
                    <input
                      name="slug"
                      value={value.slug}
                      disabled={!isNew}
                      required
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      maxLength={160}
                      placeholder="hondenwandeling-plaats-2027"
                      onChange={(e) =>
                        setValue((old) => ({ ...old, slug: e.target.value }))
                      }
                    />
                  </label>
                  <p className="workspace-note">
                    Elke editie heeft een eigen URL. De URL blijft na publicatie
                    behouden.
                  </p>
                  {record && (
                    <Link className="workspace-button" to="/admin/publiceren">
                      Naar Publiceren
                    </Link>
                  )}
                </section>
                {tab === "Foto’s" && (
                  <AdminMediaPicker
                  subject="evenement"
                    value={{
                      image: value.image || "",
                      images: mediaUrls,
                      imagePosition: value.imagePosition || "center",
                    }}
                    disabled={isNew || saving}
                    onChange={(media) => {
                      const next: Record<string, unknown> = {
                        image: media.image || null,
                        imagePosition: media.imagePosition,
                      };
                      if (
                        JSON.stringify(media.images) !==
                        JSON.stringify(mediaUrls)
                      ) {
                        const gallery = media.images.filter(
                          (url) => url !== media.image,
                        );
                        next.detailGallery = gallery.length
                          ? {
                              ...value.detailGallery,
                              title:
                                value.detailGallery?.title || "Sfeerbeelden",
                              images: gallery.map(
                                (src) =>
                                  value.detailGallery?.images.find(
                                    (x) => x.src === src,
                                  ) || {
                                    src,
                                    alt: "Beschrijf deze foto",
                                    label: "Sfeerbeeld",
                                  },
                              ),
                            }
                          : null;
                      }
                      if (media.image !== value.image) {
                        next.imageAlt = null;
                        next.imageCaption = null;
                        next.imageCredit = null;
                        next.imageSourceUrl = null;
                      }
                      updates(next);
                    }}
                  />
                )}
              </aside>
            </div>
          )}
          {comparison && (
            <section className="workspace-panel">
              <h2>Er is een nieuwere versie opgeslagen</h2>
              <p>
                Je invoer blijft in het formulier. Laatste versie:{" "}
                {comparison.version} · {comparison.draft.content.title}.
              </p>
              <details>
                <summary>Inhoud van de laatste opgeslagen versie</summary>
                <pre className="workspace-event-json">
                  {JSON.stringify(comparison.draft.content, null, 2)}
                </pre>
              </details>
              <button
                type="button"
                className="workspace-button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Je lokale invoer vervangen door de laatste versie?",
                    )
                  )
                    void load();
                }}
              >
                Laatste versie laden
              </button>
            </section>
          )}
          {error && (
            <p className="workspace-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="workspace-success" role="status">
              {notice}
            </p>
          )}
          <div className="workspace-savebar">
            <p className="workspace-note">
              {dirty
                ? "Je hebt niet-opgeslagen wijzigingen."
                : "Opslaan maakt een privéconcept. Publiceer om je website bij te werken."}
            </p>
            <button
              className="workspace-button workspace-button-primary"
              disabled={saving || (!isNew && !dirty)}
            >
              <Save size={16} />
              {saving ? "Opslaan…" : "Concept opslaan"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
