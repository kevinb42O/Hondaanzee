import React, { useId, useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { chartAxis, chartDateLabel, chartIndex, chartScale, chartSegments, chartX, type ChartPoint } from '../../utils/analyticsChart.ts';
import './AdminAnalyticsChart.css';
export default function AdminAnalyticsChart({ points, source, label }: { points: ChartPoint[]; source: string; label: string }) {
  const svg = useRef<SVGSVGElement>(null), scroll = useRef<HTMLDivElement>(null), frame = useRef<number>(0), fill = useId().replaceAll(':', '');
  const [hover, setHover] = useState<{ index: number; x: number; y: number; keyboard: boolean } | null>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  useEffect(() => setHover(null), [points.length, source]);
  const axis = useMemo(() => chartAxis(points), [points]);
  useEffect(() => {
    const host = scroll.current; if (!host) return;
    const update = () => setScrollable(host.scrollWidth > host.clientWidth + 1);
    const observer = new ResizeObserver(update);
    observer.observe(host); if (svg.current) observer.observe(svg.current);
    update(); return () => observer.disconnect();
  }, [points.length]);
  if (!points.length) return <p className="workspace-muted">Geen meetgegevens beschikbaar.</p>;
  const hourly = axis.mode === 'hour';
  const { ceiling, ticks } = chartScale(points), y = (v: number) => 226 - v / ceiling * 184;
  const active = hover && points[hover.index], number = (v: number) => new Intl.NumberFormat('nl-BE').format(v);
  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    const matrix = svg.current?.getScreenCTM(); if (!matrix) return;
    const x = event.clientX, cy = event.clientY, position = new DOMPoint(x, cy).matrixTransform(matrix.inverse());
    const index = chartIndex(position.x, points.length);
    cancelAnimationFrame(frame.current); frame.current = requestAnimationFrame(() => setHover({ index, x, y: cy, keyboard: false }));
  };
  const key = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { setHover(null); return; }
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? points.length - 1 : Math.max(0, Math.min(points.length - 1, (hover?.index ?? 0) + (event.key === 'ArrowLeft' ? -1 : 1)));
    let matrix = svg.current?.getScreenCTM(); if (!matrix) return;
    let position = new DOMPoint(chartX(index, points.length), y(points[index].value ?? 0)).matrixTransform(matrix);
    if (scroll.current) {
      const bounds = scroll.current.getBoundingClientRect();
      if (index === 0) scroll.current.scrollLeft = 0;
      else if (index === points.length - 1) scroll.current.scrollLeft = scroll.current.scrollWidth - scroll.current.clientWidth;
      else if (position.x < bounds.left + 32) scroll.current.scrollLeft += position.x - bounds.left - 32;
      else if (position.x > bounds.right - 32) scroll.current.scrollLeft += position.x - bounds.right + 32;
      matrix = svg.current?.getScreenCTM(); if (!matrix) return;
      position = new DOMPoint(chartX(index, points.length), y(points[index].value ?? 0)).matrixTransform(matrix);
    }
    setHover({ index, x: position.x, y: position.y, keyboard: true });
  };
  const left = hover ? Math.max(12, Math.min(window.innerWidth - 272, hover.x + 18 + 260 > window.innerWidth ? hover.x - 278 : hover.x + 18)) : 0;
  const top = hover ? Math.max(12, Math.min(window.innerHeight - 190, hover.y + 18)) : 0;
  const handleScroll = () => {
    cancelAnimationFrame(frame.current);
    setHover(current => {
      if (!current?.keyboard || !scroll.current) return null;
      const matrix = svg.current?.getScreenCTM(); if (!matrix) return null;
      const position = new DOMPoint(chartX(current.index, points.length), y(points[current.index].value ?? 0)).matrixTransform(matrix);
      const bounds = scroll.current.getBoundingClientRect();
      return position.x < bounds.left || position.x > bounds.right ? null : { ...current, x: position.x, y: position.y };
    });
  };
  return <><div ref={scroll} className={`workspace-chart-scroll workspace-chart-scroll-detailed${hourly ? ' workspace-chart-scroll-hourly' : ''}`} onScroll={handleScroll}><svg ref={svg} viewBox="0 0 1000 316" data-axis-mode={axis.mode} className={`workspace-chart workspace-chart-interactive workspace-chart-detailed${hourly ? ' workspace-chart-hourly' : ''}`} tabIndex={0} role="group" aria-label={`${label}. Gebruik de pijltjestoetsen voor cijfers per ${hourly?'uur':'dag'}.`} onPointerMove={move} onPointerDown={move} onPointerLeave={event => { if (event.pointerType === 'mouse') { cancelAnimationFrame(frame.current); setHover(null); } }} onBlur={() => setHover(null)} onKeyDown={key}>
    <defs><linearGradient id={fill} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2346b7" stopOpacity=".18"/><stop offset="1" stopColor="#2346b7" stopOpacity="0"/></linearGradient></defs>
    {axis.ticks.map(tick => <g key={tick.index}><line x1={chartX(tick.index, points.length)} x2={chartX(tick.index, points.length)} y1="42" y2="226" stroke={hourly && tick.label === '00:00' ? '#c8d2e7' : '#edf0f5'} strokeDasharray="2 5"/><line x1={chartX(tick.index, points.length)} x2={chartX(tick.index, points.length)} y1="226" y2="232" stroke="#c8d2e7"/></g>)}
    {ticks.map(value => <g key={value}><line x1="48" x2="952" y1={y(value)} y2={y(value)} stroke="#e1e5ec" strokeDasharray="4 5"/><text x="2" y={y(value) + 5} fill="#667085" fontSize="13">{number(value)}</text></g>)}
    {chartSegments(points).map((segment, index) => { const line = segment.map((i, n) => `${n ? 'L' : 'M'}${chartX(i, points.length)},${y(points[i].value!)}`).join(' '); return <g key={index}><path d={`${line} L${chartX(segment.at(-1)!, points.length)},226 L${chartX(segment[0], points.length)},226 Z`} fill={`url(#${fill})`}/><path d={line} fill="none" stroke="#2346b7" strokeWidth="3" strokeLinejoin="round"/>{segment.length === 1 && <circle cx={chartX(segment[0], points.length)} cy={y(points[segment[0]].value!)} r="3.5" fill="#2346b7"/>}</g>; })}
    {hover && <line x1={chartX(hover.index, points.length)} x2={chartX(hover.index, points.length)} y1="30" y2="226" stroke="#2346b7" strokeOpacity=".28" strokeDasharray="4 4"/>}
    {active && active.value !== null && <><circle cx={chartX(hover!.index, points.length)} cy={y(active.value)} r="10" fill="#2346b7" fillOpacity=".1"/><circle cx={chartX(hover!.index, points.length)} cy={y(active.value)} r="5" fill="#2346b7" stroke="white" strokeWidth="2.5"/></>}
    {axis.ticks.map(tick => <g key={tick.index}><text className="workspace-chart-time-label" x={chartX(tick.index, points.length)} y="253" textAnchor="middle" fill={hover?.index === tick.index ? '#2346b7' : '#475467'} fontSize="11" fontWeight={hover?.index === tick.index ? '650' : undefined}>{tick.label}</text>{tick.secondary && <text x={chartX(tick.index, points.length)} y="276" textAnchor="middle" fill="#667085" fontSize="10.5">{tick.secondary}</text>}</g>)}
    {axis.boundaries.map((boundary, i) => {
      const next = axis.boundaries[i + 1]?.index ?? points.length;
      const start = chartX(boundary.index, points.length), end = chartX(Math.min(next, points.length - 1), points.length);
      const shortMonth = !hourly && next - boundary.index < 5;
      const text = shortMonth ? new Date(`${points[boundary.index].day}T12:00:00Z`).toLocaleDateString('nl-BE', { timeZone: 'UTC', month: 'short' }) : boundary.label;
      return <g key={boundary.index}><line x1={start} x2={end} y1="273" y2="273" stroke="#dce2ed"/><text x={hourly ? start : (start + end) / 2} y="294" textAnchor={hourly ? boundary.index > points.length - 3 ? 'end' : 'start' : 'middle'} fill="#475467" fontSize="11" fontWeight="600">{text}</text></g>;
    })}
  </svg></div><p className="workspace-chart-caption"><strong>{axis.range}</strong><span>{axis.description}</span>{scrollable && <small className="workspace-chart-scroll-hint">Veeg of scroll horizontaal om de volledige tijdas te bekijken</small>}</p>{hover && active && createPortal(<div className="workspace-chart-tooltip" role="tooltip" style={{ left, top }} aria-live={hover.keyboard ? 'polite' : 'off'}><div className="workspace-chart-tooltip-date">{chartDateLabel(active)}</div>{active.value === null ? <p>Nog niet gemeten</p> : <><div className="workspace-chart-tooltip-value"><span><i/>Paginaweergaven</span><strong>{number(active.value)}</strong></div>{active.details?.map(row => <div className="workspace-chart-tooltip-value" key={row.label}><span>{row.label}</span><strong>{number(row.value)}</strong></div>)}</>}<small>{source}{active.partial ? ` · ${active.partialLabel||'gedeeltelijke dag'}` : ''}</small></div>, document.body)}</>;
}
