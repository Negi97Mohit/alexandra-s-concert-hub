import { concertInfoUrl, concertTicketsUrl, type DatedConcert } from "@/lib/concerts";

type Props = {
  concert: DatedConcert;
  today?: Date;
  /** Hide the Tickets link (e.g. for archived past concerts). */
  hideTickets?: boolean;
  className?: string;
};

/**
 * Renders the "More info" and "Tickets" links for a single concert.
 * Links open in a new tab and fall back to dummy placeholder URLs when
 * the concert entry doesn't specify real ones.
 */
export function ConcertLinks({ concert, today, hideTickets, className }: Props) {
  const isPast = today ? concert.when.getTime() < today.getTime() : false;
  const showTickets = !hideTickets && !isPast;

  return (
    <div
      className={[
        "mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.6875rem] uppercase tracking-[0.24em]",
        className ?? "",
      ].join(" ")}
    >
      <a
        href={concertInfoUrl(concert)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-4 transition-opacity hover:underline"
      >
        More info ↗
      </a>
      {showTickets ? (
        <a
          href={concertTicketsUrl(concert)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 transition-opacity hover:underline"
        >
          Tickets ↗
        </a>
      ) : null}
    </div>
  );
}
