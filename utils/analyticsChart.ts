export type ChartPoint = { day: string; value: number | null; details?: { label: string; value: number }[]; partial?: boolean;partialLabel?:string;granularity?:'hour' };
export function chartScale(points: ChartPoint[]) {
  const max = Math.max(1, ...points.map(p => p.value ?? 0));
  const unit = 10 ** Math.floor(Math.log10(max));
  const step = Math.max(1, Math.ceil(max / unit / 4) * unit);
  const ceiling = Math.ceil(max / step) * step;
  return { ceiling, ticks: Array.from({ length: ceiling / step + 1 }, (_, i) => i * step) };
}
export const chartX = (index: number, length: number) => length === 1 ? 500 : 48 + index * 904 / Math.max(1, length - 1);
export const chartIndex = (x: number, length: number) => Math.max(0, Math.min(length - 1, Math.round((x - 48) / 904 * (length - 1))));
export function chartSegments(points: ChartPoint[]) {
  const segments: number[][] = [];
  points.forEach((p, index) => { if (p.value === null) return; if (index === 0 || points[index - 1].value === null) segments.push([]); segments.at(-1)!.push(index); });
  return segments;
}

export function chartDateLabel(point:ChartPoint,compact=false){
 const hourly=point.granularity==='hour',date=new Date(hourly?point.day:`${point.day}T12:00:00Z`);
 return date.toLocaleString('nl-BE',hourly?{timeZone:'Europe/Brussels',...(compact?{hour:'2-digit',minute:'2-digit',hour12:false}:{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',hour12:false,timeZoneName:'shortOffset'})}:compact?{day:'numeric',month:'short',timeZone:'UTC'}:{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
}

export function chartAxis(points: ChartPoint[]) {
  const mode = points[0]?.granularity === 'hour' ? 'hour' : points.length <= 14 ? 'day' : points.length <= 45 ? 'date' : points.length <= 120 ? 'week' : 'month';
  const date = (index: number) => new Date(`${points[index].day}T12:00:00Z`);
  const format = (index: number, options: Intl.DateTimeFormatOptions) => date(index).toLocaleDateString('nl-BE', { timeZone: 'UTC', ...options });
  let indices = points.map((_, i) => i);
  if (mode === 'week') {
    // Calendar weeks, with room for the exact start and end dates at the edges.
    indices = [0];
    for (let i = 1; i < points.length - 5; i++) {
      if (date(i).getUTCDay() === 1 && i - indices.at(-1)! >= 5) indices.push(i);
    }
    if (points.length > 1) indices.push(points.length - 1);
  } else if (mode === 'month') {
    indices = indices.filter(i => i === 0 || points[i].day.slice(0, 7) !== points[i - 1].day.slice(0, 7));
    // The range caption identifies a short first month; keep the next month legible.
    if (indices.length > 1 && indices[1] < 12) indices.shift();
  }
  const ticks = indices.map(index => ({
    index,
    label: mode === 'hour' ? chartDateLabel(points[index], true) : mode === 'date' ? format(index, { day: 'numeric' }) : mode === 'month' ? format(index, { month: 'short' }) : format(index, { day: 'numeric', month: 'short' }),
    secondary: mode === 'day' ? format(index, { weekday: 'short' }) : mode === 'month' ? format(index, { year: 'numeric' }) : '',
  }));
  const boundaries = points.flatMap((point, index) => {
    if (mode === 'hour') {
      return index === 0 || chartDateLabel(point, true) === '00:00' ? [{ index, label: new Date(point.day).toLocaleDateString('nl-BE', { timeZone: 'Europe/Brussels', day: 'numeric', month: 'short' }) }] : [];
    }
    return (mode === 'date' || mode === 'week') && (index === 0 || point.day.slice(0, 7) !== points[index - 1].day.slice(0, 7)) ? [{ index, label: format(index, { month: 'long', year: 'numeric' }) }] : [];
  });
  const rangeDate = (point: ChartPoint) => new Date(point.granularity === 'hour' ? point.day : `${point.day}T12:00:00Z`).toLocaleDateString('nl-BE', { timeZone: point.granularity === 'hour' ? 'Europe/Brussels' : 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
  return { mode, ticks, boundaries, range: points.length ? `${rangeDate(points[0])} – ${rangeDate(points.at(-1)!)}` : '', description: mode === 'hour' ? `Alle ${points.length} uren · Belgische tijd` : mode === 'week' ? 'Weekmarkeringen · cijfers per dag' : mode === 'month' ? 'Maandmarkeringen · cijfers per dag' : 'Elke dag afzonderlijk' };
}
