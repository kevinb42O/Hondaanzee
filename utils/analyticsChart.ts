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
