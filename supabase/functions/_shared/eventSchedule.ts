export function validEventDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  );
}
// Match the local wall clock to a real instant. Spring's missing hour is rejected;
// autumn's repeated hour selects its first occurrence consistently.
export function eventLocalTimestamp(
  date: string,
  time: string,
  country: "BE" | "NL" = "BE",
): string {
  if (!validEventDate(date)) throw new Error("Kies een geldige datum.");
  if (!time) return date;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error("Gebruik een geldig uur (HH:mm).");
  const zone = country === "NL" ? "Europe/Amsterdam" : "Europe/Brussels";
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const wall = `${date} ${time}`;
  const utc = Date.parse(`${date}T${time}:00Z`);
  for (const offset of [120, 60, 0]) {
    if (formatter.format(new Date(utc - offset * 60000)) === wall) {
      const hours = String(Math.floor(offset / 60)).padStart(2, "0");
      return `${date}T${time}:00+${hours}:00`;
    }
  }
  throw new Error(
    "Dit lokale uur bestaat niet door de omschakeling naar zomertijd. Kies een ander uur.",
  );
}
export function eventDateDisplay(start: string, end: string): string {
  const format = (date: string) =>
    new Intl.DateTimeFormat("nl-BE", {
      dateStyle: "long",
      timeZone: "Europe/Brussels",
    }).format(new Date(`${date}T12:00:00Z`));
  return start === end ? format(start) : `${format(start)} – ${format(end)}`;
}
export function eventSeason(
  date: string,
): "Lente" | "Zomer" | "Herfst" | "Winter" {
  const month = Number(date.slice(5, 7));
  return month >= 3 && month <= 5
    ? "Lente"
    : month >= 6 && month <= 8
      ? "Zomer"
      : month >= 9 && month <= 11
        ? "Herfst"
        : "Winter";
}
