import { useMemo, useState } from "react";
import { ConcertLinks } from "@/components/ConcertLinks";
import { formatLongDate, monthKey, monthLabel, type DatedConcert } from "@/lib/concerts";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarDay({
  day,
  date,
  events,
  today,
  col,
}: {
  day: number;
  date: Date;
  events: DatedConcert[];
  today: Date;
  /** 0-6 column index in the Monday-first grid, used to keep popups on screen. */
  col: number;
}) {
  const isToday = date.getTime() === today.getTime();
  const hasEvent = events.length > 0;
  const align = col <= 1 ? "left" : col >= 5 ? "right" : "center";

  return (
    <div
      className={[
        "group relative flex aspect-square flex-col items-center justify-center border border-border/60 text-xs transition-colors duration-200 sm:text-sm",
        hasEvent ? "cursor-pointer bg-primary/10 font-medium text-primary hover:bg-primary/20" : "",
        !hasEvent ? "text-muted-foreground/70 hover:bg-secondary/40 hover:text-foreground" : "",
        isToday ? "outline outline-1 outline-primary" : "",
      ].join(" ")}
    >
      <span>{day}</span>
      {hasEvent && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />}

      {hasEvent && (
        <div
          className={[
            "pointer-events-none absolute top-full z-20 mt-2 w-[min(17.5rem,calc(100vw-2.5rem))] max-w-[17.5rem] rounded-sm border border-border bg-card p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] opacity-0 transition-all duration-200",
            align === "left" ? "left-0" : "",
            align === "right" ? "right-0" : "",
            align === "center" ? "left-1/2 -translate-x-1/2" : "",
            "group-hover:pointer-events-auto group-hover:opacity-100",
          ].join(" ")}
        >
          <div
            className={[
              "absolute -top-1 h-2 w-2 rotate-45 border-l border-t border-border bg-card",
              align === "left" ? "left-3" : "",
              align === "right" ? "right-3" : "",
              align === "center" ? "left-1/2 -translate-x-1/2" : "",
            ].join(" ")}
          />
          <ul className="space-y-4">
            {events.map((c, i) => (
              <li key={`${c.date}-${i}`} className={i > 0 ? "border-t border-border pt-4" : ""}>
                <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                  {formatLongDate(c.when)}
                  {c.time ? ` · ${c.time}` : ""}
                </p>
                <p className="mt-1 font-display text-lg text-foreground">{c.venue}</p>
                <p className="text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {c.town}, {c.country}
                </p>
                <ConcertLinks concert={c} today={today} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


type Props = {
  concerts: DatedConcert[];
  today: Date;
  /** Month the calendar opens on; defaults to the viewer's current month. */
  initialMonth?: Date;
};

export function ConcertCalendar({ concerts, today, initialMonth }: Props) {
  const [cursor, setCursor] = useState<Date>(
    () => initialMonth ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const upcomingConcerts = useMemo(
    () => concerts.filter((c) => c.when.getTime() >= today.getTime()),
    [concerts, today],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, DatedConcert[]>();
    for (const c of upcomingConcerts) {
      const key = `${c.when.getFullYear()}-${c.when.getMonth()}-${c.when.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), c]);
    }
    return map;
  }, [upcomingConcerts]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = (monthStart.getDay() + 6) % 7; // Monday-first grid

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthConcerts = upcomingConcerts
    .filter((c) => monthKey(c.when) === monthKey(monthStart))
    .sort((a, b) => a.when.getTime() - b.when.getTime());

  const shift = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary"
          >
            ← Prev
          </button>
          <h3 className="font-display text-2xl text-foreground md:text-3xl">
            {monthLabel(monthStart)}
          </h3>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next month"
            className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary"
          >
            Next →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-px text-center">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="pb-2 text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground"
            >
              {d.slice(0, 2)}
            </span>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <span key={`e-${i}`} className="aspect-square" />;
            const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
            const events = byDay.get(`${date.getFullYear()}-${date.getMonth()}-${day}`) ?? [];

            return <CalendarDay key={day} day={day} date={date} events={events} today={today} />;
          })}
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-5 text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Upcoming
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 outline outline-1 outline-primary" /> Today
          </span>
        </p>
      </div>

      <div>
        <p className="eyebrow">{monthLabel(monthStart)}</p>
        {monthConcerts.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No upcoming concerts listed this month.
          </p>
        ) : (
          <ul className="mt-6 border-t border-border">
            {monthConcerts.map((c, i) => (
              <li
                key={`${c.date}-${i}`}
                className="border-b border-border py-5 transition-colors duration-200 hover:bg-secondary/60"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                    {c.date}
                    {c.time ? ` · ${c.time}` : ""}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                    Upcoming
                  </span>
                </div>
                <p className="mt-2 font-display text-xl text-foreground">{c.venue}</p>
                <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {c.town}, {c.country}
                </p>
                <ConcertLinks concert={c} today={today} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
