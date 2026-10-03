import type { ChartPoint } from './analyticsChart.ts';
import { hourlySeries, type HourlyWindow } from './hourlyAnalytics.ts';
export type VisitorRow = { day: string; hour?: string; path: string; referrer: string; device: string; count: number };
export type VisitorReport = { method: 'daily_estimate'; startedAt: string | null; rows: VisitorRow[] };
export const siteVisitorRows = (report?: VisitorReport) => (report?.rows || []).filter(row => row.path === '@site');
export const visitorTotal = (report?: VisitorReport) => siteVisitorRows(report).reduce((sum, row) => sum + Number(row.count), 0);
export function visitorSeries(report: VisitorReport | undefined, days: number, today: string, window?: HourlyWindow): ChartPoint[] {
 const rows = siteVisitorRows(report);
 if (days === 1 && window) {
  if (!report?.startedAt) return hourlySeries([], window).map(point => ({ ...point, value: null, details: [] }));
  const startedAt = new Date(Math.max(Date.parse(report.startedAt), Date.parse(window.startedAt))).toISOString();
  return hourlySeries(rows.map(row => ({ ...row, event: 'pageview' })), { ...window, startedAt }).map(point => ({ ...point, details: [] }));
 }
 const firstDay = report?.startedAt ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(report.startedAt)) : null;
 return Array.from({ length: days }, (_, index) => {
  const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - days + 1 + index);
  const day = date.toISOString().slice(0, 10);
  return { day, value: !firstDay || day < firstDay ? null : rows.filter(row => row.day === day).reduce((sum, row) => sum + Number(row.count), 0), partial: day === today || day === firstDay, partialLabel: day === firstDay ? 'bezoekersmeting gestart tijdens deze dag' : day === today ? 'lopende dag' : undefined };
 });
}
export function visitorCsv(report: VisitorReport, hourly: boolean): string {
 const cell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
 return [(hourly ? 'Uur (UTC)' : 'Datum') + ',Bereik,Pagina,Herkomst,Apparaat,Geschatte dagelijkse bezoekers,Methode,Start meting', ...report.rows.map(row => [row.hour ?? row.day, row.path === '@site' ? 'Hele website' : 'Per pagina', row.path === '@site' ? '' : row.path, row.referrer, row.device, row.count, 'Dagelijks uniek; opnieuw geteld op andere dag; uur = eerste bezoek van de dag', report.startedAt || ''].map(cell).join(','))].join('\n');
}
