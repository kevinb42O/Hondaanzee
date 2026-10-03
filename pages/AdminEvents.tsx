import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  BarChart3,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  adminEvents,
  eventPublicationLabel,
  type EventRecord,
} from "../utils/adminEvents.ts";
import { isEventPast, EVENT_REGION_LABELS } from "../utils/events.ts";
export default function AdminEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]),
    [query, setQuery] = useState(""),
    [period, setPeriod] = useState("all"),
    [region, setRegion] = useState("all"),
    [status, setStatus] = useState("all"),
    [category, setCategory] = useState("all"),
    [certainty, setCertainty] = useState("all"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminEvents<{ events: EventRecord[] }>({
        action: "list",
      });
      setEvents(data.events);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kon evenementen niet laden.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const pending = events.filter(
    (e) => e.draft_revision_id !== e.published_revision_id,
  ).length;
  const shown = events
    .filter((e) => {
      const c = e.draft.content;
      return (
        (!query ||
          `${c.title} ${c.cityName} ${c.category} ${e.slug}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase())) &&
        (period === "all" || (period === "past") === isEventPast(c)) &&
        (region === "all" || c.region === region) &&
        (category === "all" || c.category === category) &&
        (certainty === "all" || c.status === certainty) &&
        (status === "all" ||
          (status === "draft"
            ? e.draft_revision_id !== e.published_revision_id
            : status === "withdrawn"
              ? c.visibility === "withdrawn"
              : e.published_revision_id &&
                e.draft_revision_id === e.published_revision_id &&
                c.visibility !== "withdrawn"))
      );
    })
    .sort((a, b) => a.draft.content.date.localeCompare(b.draft.content.date));
  return (
    <>
      <div className="workspace-page-heading">
        <div>
          <p className="workspace-eyebrow">Uitstappen met je hond</p>
          <h1>Agenda</h1>
          <p>
            Beheer evenementen, bereid nieuwe edities voor en bekijk hun bereik.
          </p>
        </div>
        <div className="workspace-event-buttons">
          <Link to="/admin/agenda/analytics" className="workspace-button">
            <BarChart3 size={17} />
            Agenda-analytics
          </Link>
          <Link
            to="/admin/agenda/nieuw"
            className="workspace-button workspace-button-primary"
          >
            <Plus size={17} />
            Nieuw evenement
          </Link>
        </div>
      </div>
      <div className="workspace-stats">
        <section className="workspace-stat">
          <span>Evenementen</span>
          <strong>{events.length}</strong>
          <small>Inclusief voorbije edities</small>
        </section>
        <section className="workspace-stat">
          <span>Komende edities</span>
          <strong>
            {
              events.filter(
                (e) =>
                  !isEventPast(e.draft.content) &&
                  e.draft.content.visibility !== "withdrawn",
              ).length
            }
          </strong>
          <small>Volgens de conceptinhoud</small>
        </section>
        <section className="workspace-stat">
          <span>Te publiceren</span>
          <strong>{pending}</strong>
          <small>Nieuwe of gewijzigde concepten</small>
        </section>
        <section className="workspace-stat">
          <span>Details volgen</span>
          <strong>
            {
              events.filter(
                (e) =>
                  !isEventPast(e.draft.content) &&
                  e.draft.content.status !== "confirmed",
              ).length
            }
          </strong>
          <small>Aangekondigd of save the date</small>
        </section>
      </div>
      <section className="workspace-panel">
        <div className="workspace-section-heading">
          <h2>
            <CalendarDays size={20} />
            Alle evenementen
          </h2>
          <button
            className="workspace-button"
            disabled={loading}
            onClick={() => void load()}
          >
            <RefreshCw size={16} />
            Vernieuwen
          </button>
        </div>
        <div className="workspace-event-filters workspace-form">
          <label>
            Zoeken
            <input
              type="search"
              placeholder="Titel, plaats of categorie"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            Periode
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="all">Alle edities</option>
              <option value="upcoming">Komend / bezig</option>
              <option value="past">Voorbij</option>
            </select>
          </label>
          <label>
            Regio
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="all">Alle regio's</option>
              {Object.entries(EVENT_REGION_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Publicatie
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Alle statussen</option>
              <option value="draft">Concept / wijzigingen</option>
              <option value="live">Gepubliceerd</option>
              <option value="withdrawn">Ingetrokken</option>
            </select>
          </label>
          <label>
            Categorie
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">Alle categorieën</option>
              {[...new Set(events.map((e) => e.draft.content.category))]
                .sort()
                .map((v) => (
                  <option key={v}>{v}</option>
                ))}
            </select>
          </label>
          <label>
            Informatie
            <select
              value={certainty}
              onChange={(e) => setCertainty(e.target.value)}
            >
              <option value="all">Alle informatie</option>
              <option value="confirmed">Bevestigd</option>
              <option value="announced">Aangekondigd</option>
              <option value="save-the-date">Save the date</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="workspace-error" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p role="status">Evenementen laden…</p>
        ) : !shown.length ? (
          <p className="workspace-muted">
            Geen evenementen gevonden voor deze selectie.
          </p>
        ) : (
          <div className="workspace-event-list">
            {shown.map((e) => (
              <article key={e.id} className="workspace-event-row">
                <div>
                  <Link to={`/admin/agenda/${e.id}`}>
                    <strong>{e.draft.content.title}</strong>
                  </Link>
                  <p>
                    {e.draft.content.dateDisplay} · {e.draft.content.cityName}
                  </p>
                  <small>
                    {eventPublicationLabel(e)} · {e.draft.content.category} ·
                    Controle:{" "}
                    {e.draft.content.lastVerified || "Nog niet vastgelegd"}
                  </small>
                </div>
                <div className="workspace-event-buttons">
                  <Link
                    to={`/admin/agenda/${e.id}`}
                    className="workspace-button"
                  >
                    Bewerken
                  </Link>
                  <Link
                    to={`/admin/agenda/${e.id}/analytics`}
                    className="workspace-button"
                    aria-label={`Analytics van ${e.draft.content.title}`}
                  >
                    <BarChart3 size={16} />
                  </Link>
                  {e.published_revision_id &&
                    e.published?.content.visibility !== "withdrawn" && (
                      <a
                        href={`/agenda/${e.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="workspace-button"
                        aria-label={`Publieke pagina van ${e.draft.content.title}`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {pending > 0 && (
        <Link
          to="/admin/publiceren"
          className="workspace-button workspace-button-primary"
        >
          {pending} concepten bekijken voor publicatie
        </Link>
      )}
    </>
  );
}
