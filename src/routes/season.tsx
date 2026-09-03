import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ARTIST, CONCERTS } from "@/data/dovgan";

export const Route = createFileRoute("/season")({
  head: () => ({
    meta: [
      { title: "Concerts — Alexandra Dovgan, Pianist" },
      {
        name: "description",
        content:
          "Upcoming concerts of pianist Alexandra Dovgan: Locarno, Kawasaki, Niigata, Bari, Milano, Como, Firenze, Imola and Prague.",
      },
      { property: "og:title", content: "Concerts — Alexandra Dovgan" },
      {
        property: "og:description",
        content: "The full list of upcoming performances by pianist Alexandra Dovgan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeasonPage,
});

function SeasonPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <PageHeading
        eyebrow={ARTIST.season}
        title="Concerts"
        lead="Upcoming performances. Dates and venues as listed by AMC — Artists Management Company."
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <ul className="border-t border-border">
          {CONCERTS.map((c, i) => (
            <li
              key={`${c.date}-${i}`}
              className="-mx-4 grid gap-2 border-b border-border px-4 py-7 transition-colors duration-200 hover:bg-secondary/60 md:grid-cols-[150px_1fr_260px] md:items-baseline"
            >
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-primary">
                {c.date}
              </span>
              <span className="font-display text-2xl text-foreground md:text-3xl">{c.venue}</span>
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground md:text-right">
                {c.town}, {c.country}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <SiteFooter />
    </div>
  );
}
