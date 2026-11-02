// India has no daylight saving, so IST is always UTC+5:30.
export const IST_OFFSET_MIN = 330;

/** Today's date in IST as YYYY-MM-DD */
export function todayIST(now = new Date()) {
  return new Date(now.getTime() + IST_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}

export function addDays(ymd: string, days: number) {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Weekday (0 = Sunday) of an IST calendar date */
export const weekdayOf = (ymd: string) => new Date(ymd + "T00:00:00Z").getUTCDay();

/** IST date + minutes from midnight → UTC Date */
export function istToUtc(ymd: string, minutes: number) {
  return new Date(Date.parse(ymd + "T00:00:00Z") + (minutes - IST_OFFSET_MIN) * 60_000);
}

/** UTC Date → { date: YYYY-MM-DD, min } in IST */
export function utcToIst(d: Date) {
  const shifted = new Date(d.getTime() + IST_OFFSET_MIN * 60_000);
  return { date: shifted.toISOString().slice(0, 10), min: shifted.getUTCHours() * 60 + shifted.getUTCMinutes() };
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dateLabel(ymd: string) {
  const d = new Date(ymd + "T00:00:00Z");
  return `${WD[d.getUTCDay()]}, ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`;
}

export function dateTimeLabel(d: Date) {
  const { date, min } = utcToIst(d);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${dateLabel(date)} · ${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
