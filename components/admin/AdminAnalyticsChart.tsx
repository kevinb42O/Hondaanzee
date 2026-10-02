import React, { useId, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { chartDateLabel, chartIndex, chartScale, chartSegments, chartX, type ChartPoint } from '../../utils/analyticsChart.ts';
export default function AdminAnalyticsChart({ points, source, label }: { points: ChartPoint[]; source: string; label: string }) {
  const svg = useRef<SVGSVGElement>(null), frame = useRef<number>(0), fill = useId().replaceAll(':', '');
  const [hover, setHover] = useState<{ index: number; x: number; y: number; keyboard: boolean } | null>(null);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  useEffect(() => setHover(null), [points.length, source]);
  if (!points.length) return <p className="workspace-muted">Geen meetgegevens beschikbaar.</p>;
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
    const matrix = svg.current?.getScreenCTM(); if (!matrix) return;
    const position = new DOMPoint(chartX(index, points.length), y(points[index].value ?? 0)).matrixTransform(matrix);
    setHover({ index, x: position.x, y: position.y, keyboard: true });
  };
  const left = hover ? Math.max(12, Math.min(window.innerWidth - 272, hover.x + 18 + 260 > window.innerWidth ? hover.x - 278 : hover.x + 18)) : 0;
  const top = hover ? Math.max(12, Math.min(window.innerHeight - 190, hover.y + 18)) : 0;
  const indices = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
  return <><svg ref={svg} viewBox="0 0 1000 278" className="workspace-chart workspace-chart-interactive" tabIndex={0} role="group" aria-label={`${label}. Gebruik de pijltjestoetsen voor cijfers per ${points[0].granularity==='hour'?'uur':'dag'}.`} onPointerMove={move} onPointerDown={move} onPointerLeave={event => { if (event.pointerType === 'mouse') { cancelAnimationFrame(frame.current); setHover(null); } }} onBlur={() => setHover(null)} onKeyDown={key}>
    <defs><linearGradient id={fill} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2346b7" stopOpacity=".18"/><stop offset="1" stopColor="#2346b7" stopOpacity="0"/></linearGradient></defs>
    {ticks.map(value => <g key={value}><line x1="48" x2="952" y1={y(value)} y2={y(value)} stroke="#e1e5ec" strokeDasharray="4 5"/><text x="2" y={y(value) + 5} fill="#667085" fontSize="13">{number(value)}</text></g>)}
    {chartSegments(points).map((segment, index) => { const line = segment.map((i, n) => `${n ? 'L' : 'M'}${chartX(i, points.length)},${y(points[i].value!)}`).join(' '); return <g key={index}><path d={`${line} L${chartX(segment.at(-1)!, points.length)},226 L${chartX(segment[0], points.length)},226 Z`} fill={`url(#${fill})`}/><path d={line} fill="none" stroke="#2346b7" strokeWidth="3" strokeLinejoin="round"/>{segment.length === 1 && <circle cx={chartX(segment[0], points.length)} cy={y(points[segment[0]].value!)} r="3.5" fill="#2346b7"/>}</g>; })}
    {hover && <line x1={chartX(hover.index, points.length)} x2={chartX(hover.index, points.length)} y1="30" y2="226" stroke="#2346b7" strokeOpacity=".28" strokeDasharray="4 4"/>}
    {active && active.value !== null && <><circle cx={chartX(hover!.index, points.length)} cy={y(active.value)} r="10" fill="#2346b7" fillOpacity=".1"/><circle cx={chartX(hover!.index, points.length)} cy={y(active.value)} r="5" fill="#2346b7" stroke="white" strokeWidth="2.5"/></>}
    {indices.map(i => <text key={i} x={chartX(i, points.length)} y="261" textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} fill="#667085" fontSize="13">{chartDateLabel(points[i],true)}</text>)}
  </svg>{hover && active && createPortal(<div className="workspace-chart-tooltip" role="tooltip" style={{ left, top }} aria-live={hover.keyboard ? 'polite' : 'off'}><div className="workspace-chart-tooltip-date">{chartDateLabel(active)}</div>{active.value === null ? <p>Nog niet gemeten</p> : <><div className="workspace-chart-tooltip-value"><span><i/>Paginaweergaven</span><strong>{number(active.value)}</strong></div>{active.details?.map(row => <div className="workspace-chart-tooltip-value" key={row.label}><span>{row.label}</span><strong>{number(row.value)}</strong></div>)}</>}<small>{source}{active.partial ? ` · ${active.partialLabel||'gedeeltelijke dag'}` : ''}</small></div>, document.body)}</>;
}
