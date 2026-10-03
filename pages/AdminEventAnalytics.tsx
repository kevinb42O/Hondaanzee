import AdminAnalyticsNavigation from '../components/admin/AdminAnalyticsNavigation.tsx';
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3, Download, RefreshCw } from "lucide-react";
import { adminEvents, type EventRecord } from "../utils/adminEvents.ts";
import { adminFunction } from "../utils/adminContent.ts";
import AdminAnalyticsChart from "../components/admin/AdminAnalyticsChart.tsx";
import { hourlySeries, type HourlyWindow } from "../utils/hourlyAnalytics.ts";
type Row = {
  day: string;
  hour?: string;
  path: string;
  event: string;
  referrer: string;
  device: string;
  count: number;
};
type Coverage = {
  event_slug: string;
  started_at: string;
  actions_started_at: string | null;
};
type Result = {
  rows: Row[];
  today: string;
  window?: HourlyWindow;
  eventCoverage: Coverage[];
};
const number = (v: number) => new Intl.NumberFormat("nl-BE").format(v);
const labels: Record<string, string> = {
  website: "Organisator / website",
  ticket: "Tickets / inschrijving",
  telefoon: "Telefoon",
  email: "E-mail",
  route: "Route",
  social: "Sociale link",
  direct: "Rechtstreeks / onbekend",
  google: "Google",
  bing: "Bing",
  facebook: "Facebook",
  instagram: "Instagram",
  hondaanzee: "Binnen de website",
  other: "Andere websites",
  mobile: "Mobiel",
  tablet: "Tablet",
  desktop: "Desktop",
};
function grouped(rows: Row[], key: "event" | "referrer" | "device") {
  const counts = new Map<string, number>();
  for (const r of rows)
    counts.set(r[key], (counts.get(r[key]) || 0) + Number(r.count));
  return [...counts].sort((a, b) => b[1] - a[1]);
}
export default function AdminEventAnalytics() {
  const { id } = useParams(),
    [events, setEvents] = useState<EventRecord[]>([]),
    [selected, setSelected] = useState("all"),
    [days, setDays] = useState(7),
    [result, setResult] = useState<Result | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const sequence = useRef(0);
  const event = id
    ? events.find((e) => e.id === id)
    : selected !== "all"
      ? events.find((e) => e.slug === selected)
      : undefined;
  const load = async (silent = false) => {
    const n = ++sequence.current;
    if (!silent) setLoading(true);
    setError("");
    try {
      const catalog = await adminEvents<{ events: EventRecord[] }>({
        action: "list",
      });
      if (n !== sequence.current) return;
      setEvents(catalog.events);
      const current = id
        ? catalog.events.find((e) => e.id === id)
        : selected !== "all"
          ? catalog.events.find((e) => e.slug === selected)
          : undefined;
      if (id && !current) throw Error("Evenement niet gevonden.");
      const data = await adminFunction<Result>("admin-analytics", {
        ...(days === 1 ? { hours: 24 } : { days }),
        ...(current ? { eventSlug: current.slug } : { agenda: true }),
      });
      if (n === sequence.current) setResult(data);
    } catch (e) {
      if (n === sequence.current) setError((e as Error).message);
    } finally {
      if (n === sequence.current) setLoading(false);
    }
  };
  useEffect(() => {
    setResult(null);
    void load();
    return () => {
      sequence.current++;
    };
  }, [id, selected, days]);
  useEffect(() => {
    if (days !== 1) return;
    const t = setInterval(() => {
      if (!document.hidden) void load(true);
    }, 60000);
    return () => clearInterval(t);
  }, [id, selected, days]);
  const rows = result?.rows || [],
    views = rows.filter((r) => r.event === "pageview"),
    actions = rows.filter((r) => r.event !== "pageview");
  const total = (items: Row[]) =>
    items.reduce((sum, r) => sum + Number(r.count), 0);
  const coverage = (result?.eventCoverage || []).filter(
    (c) => !event || c.event_slug === event.slug,
  );
  const start = coverage.length
    ? coverage
        .map((c) => c.started_at)
        .sort()
        .at(-1)
    : undefined;
  const actionStarts = coverage
    .map((c) => c.actions_started_at)
    .filter(Boolean) as string[];
  const actionStart =
    actionStarts.length === coverage.length && actionStarts.length
      ? actionStarts.sort().at(-1)
      : undefined;
  const series =
    days === 1 && result?.window
      ? hourlySeries(rows, {
          ...result.window,
          startedAt:
            start && start > result.window.startedAt
              ? start
              : result.window.startedAt,
        })
      : Array.from({ length: days }, (_, i) => {
          const d = new Date(
            `${result?.today || new Date().toISOString().slice(0, 10)}T12:00:00Z`,
          );
          d.setUTCDate(d.getUTCDate() - days + 1 + i);
          const day = d.toISOString().slice(0, 10);
          return {
            day,
            value:
              start && day < start.slice(0, 10)
                ? null
                : total(views.filter((r) => r.day === day)),
            partial: day === result?.today || day === start?.slice(0, 10),
            details: [
              {
                label: "Klikacties",
                value: total(actions.filter((r) => r.day === day)),
              },
            ],
          };
        });
  const csv = () => {
    const data =
      "Datum,Uur (UTC),Pagina,Actie,Herkomst,Apparaat,Aantal\n" +
      rows
        .map((r) =>
          [r.day, r.hour || "", r.path, r.event, r.referrer, r.device, r.count]
            .map((v) => `"${String(v).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + data], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda-${event?.slug || "alle"}-${days === 1 ? "24-uur" : days + "-dagen"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const list = (title: string, data: [string, number][]) => (
    <section className="workspace-panel">
      <h2>{title}</h2>
      {data.length ? (
        <div className="workspace-analytics-list">
          {data.map(([key, count]) => (
            <div key={key}>
              <span>{labels[key] || key}</span>
              <strong>{number(count)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="workspace-muted">
          Nog geen gemeten gegevens in deze periode.
        </p>
      )}
    </section>
  );
  return (
    <>
      <Link to="/admin/agenda" className="workspace-text-link">
        <ArrowLeft size={16} />
        Agenda beheren
      </Link>
      <div className="workspace-page-heading">
        <div>
          <p className="workspace-eyebrow">Evenementen in cijfers</p>
          <h1>{event ? event.draft.content.title : "Agenda-analytics"}</h1>
          <p>Paginaweergaven en gemeten klikinteresse per editie.</p>
        </div>
        <button
          className="workspace-button"
          disabled={loading}
          onClick={() => void load()}
        >
          <RefreshCw size={16} />
          Vernieuwen
        </button>
      </div>
      <AdminAnalyticsNavigation />
      {!id && (
        <section className="workspace-panel workspace-form">
          <label>
            Evenement
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="all">Volledige agenda</option>
              {events.map((e) => (
                <option key={e.id} value={e.slug}>
                  {e.draft.content.title} · {e.draft.content.dateDisplay}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}
      <div className="workspace-period" aria-label="Meetperiode">
        {[1, 7, 30, 90, 365].map((v) => (
          <button
            key={v}
            className={days === v ? "is-active" : ""}
            aria-pressed={days === v}
            onClick={() => setDays(v)}
          >
            {v === 1 ? "24 uur" : v === 365 ? "12 maanden" : `${v} dagen`}
          </button>
        ))}
      </div>
      {error && (
        <p className="workspace-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <section className="workspace-panel" role="status">
          Agendarapport laden…
        </section>
      ) : (
        result && (
          <>
            <p className="workspace-note">
              Tijdzone Brussel ·{" "}
              {start
                ? `Volledige meetdekking voor deze selectie vanaf ${new Date(start).toLocaleString("nl-BE", { timeZone: "Europe/Brussels" })}.`
                : "Voor deze selectie is nog geen meetstart geregistreerd."}{" "}
              Eerdere totalen kunnen onvolledig zijn; ontbrekende historiek is
              geen nulmeting.{" "}
              {actionStart
                ? `Klikacties vanaf ${new Date(actionStart).toLocaleString("nl-BE", { timeZone: "Europe/Brussels" })}.`
                : "De meetstart voor klikacties is nog niet bevestigd."}
            </p>
            <div className="workspace-stats">
              {!event && (
                <section className="workspace-stat">
                  <span>Agenda-overzicht</span>
                  <strong>
                    {number(total(views.filter((r) => r.path === "/agenda")))}
                  </strong>
                  <small>Weergaven van /agenda</small>
                </section>
              )}
              <section className="workspace-stat">
                <span>Evenementweergaven</span>
                <strong>
                  {number(total(views.filter((r) => r.path !== "/agenda")))}
                </strong>
                <small>Gemeten interesse in fiches</small>
              </section>
              <section className="workspace-stat">
                <span>Ticketklikken</span>
                <strong>
                  {actionStart
                    ? number(total(actions.filter((r) => r.event === "ticket")))
                    : "—"}
                </strong>
                <small>Geen bevestigde boekingen</small>
              </section>
              <section className="workspace-stat">
                <span>Overige klikacties</span>
                <strong>
                  {actionStart
                    ? number(total(actions.filter((r) => r.event !== "ticket")))
                    : "—"}
                </strong>
                <small>Website, contact en social</small>
              </section>
            </div>
            <section className="workspace-panel">
              <div className="workspace-section-heading">
                <h2>
                  <BarChart3 size={20} />
                  Weergaven doorheen de tijd
                </h2>
                <button
                  className="workspace-button"
                  disabled={loading || !!error}
                  onClick={csv}
                >
                  <Download size={16} />
                  CSV exporteren
                </button>
              </div>
              <AdminAnalyticsChart
                points={series}
                source="Eigen meting · Brussel"
                label={`${number(total(views))} gemeten paginaweergaven`}
              />
              {!rows.length && (
                <p className="workspace-muted">
                  Nog geen metingen in deze periode. Er worden geen
                  voorbeeldcijfers ingevuld.
                </p>
              )}
            </section>
            {!event && (
              <section className="workspace-panel">
                <h2>Bereik per evenement</h2>
                <div className="workspace-event-list">
                  {events
                    .map((e) => ({
                      e,
                      count: total(
                        views.filter((r) => r.path === `/agenda/${e.slug}`),
                      ),
                      clicks: total(
                        actions.filter((r) => r.path === `/agenda/${e.slug}`),
                      ),
                    }))
                    .sort((a, b) => b.count - a.count)
                    .map(({ e, count, clicks }) => (
                      <div className="workspace-event-row" key={e.id}>
                        <div>
                          <Link to={`/admin/analytics/agenda/${e.id}`}>
                            <strong>{e.draft.content.title}</strong>
                          </Link>
                          <p>
                            {e.draft.content.dateDisplay} ·{" "}
                            {e.draft.content.cityName}
                          </p>
                        </div>
                        <span>
                          {number(count)} weergaven · {number(clicks)}{" "}
                          klikacties
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}
            <div className="workspace-columns">
              {list("Klikacties", grouped(actions, "event"))}
              {list("Herkomst van weergaven", grouped(views, "referrer"))}
              {list("Apparaten", grouped(views, "device"))}
            </div>
            {event && (
              <Link
                to={`/admin/agenda/${event.id}`}
                className="workspace-button"
              >
                Dit evenement bewerken
              </Link>
            )}
          </>
        )
      )}
      <p className="workspace-note">
        Dit agendarapport toont paginaweergaven en klikacties, geen unieke
        bezoekers of sessieconversies. Zonder
        meetcookies of blijvende bezoeker-ID; DNT/GPC en adblockers kunnen tellingen
        beperken. Dagtotalen blijven 13 maanden bewaard, uurdetails 8 dagen.
        Admin, preview en bekende bots worden uitgesloten. Google-impressies,
        zoektermen en indexstatus horen bij Search Console; Vercel-historiek
        blijft afzonderlijk.
      </p>
    </>
  );
}
