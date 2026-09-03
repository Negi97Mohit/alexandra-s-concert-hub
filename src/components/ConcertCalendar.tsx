import { useMemo, useState } from "react";
import { ConcertLinks } from "@/components/ConcertLinks";
import { monthKey, monthLabel, type DatedConcert } from "@/lib/concerts";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  const byDay = useMemo(() => {
    const map = new Map<string, DatedConcert[]>();
    for (const c of concerts) {
      const key = `${c.when.getFullYear()}-${c.when.getMonth()}-${c.when.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), c]);
    }
    return map;
  }, [concerts]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = (monthStart.getDay() + 6) % 7; // Monday-first grid

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthConcerts = concerts
    .filter((c) => monthKey(c.when) === monthKey(monthStart))
    .sort((a, b) => a.when.getTime() - b.when.getTime());

  const shift = (n: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

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
            const isToday = date.getTime() === today.getTime();
            const isPast = date.getTime() < today.getTime();
            const hasEvent = events.length > 0;

            return (
              <div
                key={day}
                title={hasEvent ? events.map((e) => `${e.venue} — ${e.town}`).join(" / ") : undefined}
                className={[
                  "relative flex aspect-square flex-col items-center justify-center border border-border/60 text-sm transition-colors",
                  hasEvent && !isPast ? "bg-primary/10 font-medium text-primary" : "",
                  hasEvent && isPast ? "bg-secondary text-muted-foreground" : "",
                  !hasEvent ? "text-muted-foreground/70" : "",
                  isToday ? "outline outline-1 outline-primary" : "",
                ].join(" ")}
              >
                <span>{day}</span>
                {hasEvent && (
                  <span
                    className={[
                      "mt-1 h-1.5 w-1.5 rounded-full",
                      isPast ? "bg-muted-foreground/60" : "bg-primary",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-5 text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Upcoming
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" /> Past
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 outline outline-1 outline-primary" /> Today
          </span>
        </p>
      </div>

      <div>
        <p className="eyebrow">{monthLabel(monthStart)}</p>
        {monthConcerts.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No concerts listed this month.</p>
        ) : (
          <ul className="mt-6 border-t border-border">
            {monthConcerts.map((c, i) => (
              <li key={`${c.date}-${i}`} className="border-b border-border py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                    {c.date}
                    {c.time ? ` · ${c.time}` : ""}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                    {c.when.getTime() < today.getTime() ? "Archived" : "Upcoming"}
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
