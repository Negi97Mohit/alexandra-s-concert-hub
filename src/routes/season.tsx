import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeading, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ConcertCalendar } from "@/components/ConcertCalendar";
import { ConcertLinks } from "@/components/ConcertLinks";
import { ARTIST, CONCERTS } from "@/data/dovgan";
import {
  daysUntil,
  formatLongDate,
  splitConcerts,
  useToday,
  withDates,
  type DatedConcert,
} from "@/lib/concerts";

export const Route = createFileRoute("/season")({
  head: () => ({
    meta: [
      { title: "Concert Calendar & Archive — Alexandra Dovgan" },
      {
        name: "description",
        content:
          "Concert calendar of pianist Alexandra Dovgan: upcoming performances by month, plus an archive of past concerts.",
      },
      { property: "og:title", content: "Concert Calendar — Alexandra Dovgan" },
      {
        property: "og:description",
        content:
          "Browse Alexandra Dovgan's upcoming concerts in a month calendar and revisit the archive of past performances.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeasonPage,
});

function ConcertRow({ concert, today }: { concert: DatedConcert; today: Date }) {
  const days = daysUntil(concert.when, today);
  const badge = days === 0 ? "Tonight" : days > 0 ? `In ${days} day${days === 1 ? "" : "s"}` : null;

  return (
    <li className="-mx-4 grid gap-2 border-b border-border px-4 py-7 transition-colors duration-200 hover:bg-secondary/60 md:grid-cols-[190px_1fr_260px] md:items-baseline">
      <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
        {formatLongDate(concert.when)}
        {concert.time ? ` · ${concert.time}` : ""}
      </span>
      <span>
        <span className="font-display text-2xl text-foreground md:text-3xl">{concert.venue}</span>
        <ConcertLinks concert={concert} today={today} />
      </span>
      <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground md:text-right">
        {concert.town}, {concert.country}
        {badge ? <span className="ml-3 text-primary">{badge}</span> : null}
      </span>
    </li>
  );
}

function SeasonPage() {
  const today = useToday();
  const { upcoming, past } = splitConcerts(CONCERTS, today);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [showAllPast, setShowAllPast] = useState(false);

  const calendarStart =
    upcoming[0] && upcoming[0].when.getMonth() !== today.getMonth()
      ? new Date(upcoming[0].when.getFullYear(), upcoming[0].when.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1);

  const visiblePast = showAllPast ? past : past.slice(0, 8);

  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <PageHeading
        eyebrow={ARTIST.season}
        title="Concerts"
        lead="Upcoming performances shown against today's date. Past concerts move automatically into the archive below."
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
            Today · {formatLongDate(today)} — {upcoming.length} upcoming, {past.length} archived
          </p>
          <div className="flex gap-2">
            {(["calendar", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={[
                  "border px-4 py-2 text-[0.6875rem] uppercase tracking-[0.24em] transition-colors",
                  view === v
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {v === "calendar" ? "Calendar" : "List"}
              </button>
            ))}
          </div>
        </div>

        <section className="pt-10" aria-label="Upcoming concerts">
          {view === "calendar" ? (
            <ConcertCalendar
              concerts={withDates(CONCERTS)}
              today={today}
              initialMonth={calendarStart}
            />
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming dates are currently announced. Please check back soon.
            </p>
          ) : (
            <ul className="border-t border-border">
              {upcoming.map((c, i) => (
                <ConcertRow key={`${c.date}-${i}`} concert={c} today={today} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-24 pb-24" aria-label="Past concerts archive">
          <div className="flex items-baseline justify-between gap-6 border-b border-border pb-5">
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Archive</h2>
            <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
              Past concerts
            </span>
          </div>

          {past.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              No concerts have passed yet in this listing — every announced date is still ahead.
            </p>
          ) : (
            <>
              <ul className="mt-8 border-t border-border">
                {visiblePast.map((c, i) => (
                  <li
                    key={`${c.date}-${i}`}
                    className="-mx-4 grid gap-2 border-b border-border px-4 py-6 text-muted-foreground md:grid-cols-[190px_1fr_260px] md:items-baseline"
                  >
                    <span className="text-[0.6875rem] uppercase tracking-[0.24em]">
                      {formatLongDate(c.when)}
                    </span>
                    <span>
                      <span className="font-display text-xl text-foreground/80 md:text-2xl">
                        {c.venue}
                      </span>
                      <ConcertLinks concert={c} today={today} />
                    </span>
                    <span className="text-[0.6875rem] uppercase tracking-[0.24em] md:text-right">
                      {c.town}, {c.country}
                    </span>
                  </li>
                ))}
              </ul>
              {past.length > visiblePast.length || showAllPast ? (
                <button
                  type="button"
                  onClick={() => setShowAllPast((v) => !v)}
                  className="rule-link mt-8 inline-block"
                >
                  {showAllPast ? "Show fewer" : `Show all ${past.length} past concerts`} →
                </button>
              ) : null}
            </>
          )}
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
