import { useEffect, useState } from "react";
import type Booking from "../interfaces/Booking";

Bookingstatus.route = {
  path: "/my-bookings",
  menuLabel: "Mina bokningar",
  index: 3,
};

export default function Bookingstatus() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [seats, setSeats] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings/my", { credentials: "include" });
      if (res.status === 401) {
        setError("Du måste vara inloggad för att se dina bokningar.");
        setBookings([]);
        return;
      }
      if (!res.ok) {
        setError("Du har inga bokningar just nu.");
        setBookings([]);
        return;
      }
      const data = (await res.json()) as Booking[];
      const list = Array.isArray(data) ? data : [];
      setBookings(list);

      // Fetch seats for each booking
      const seatMap: Record<number, string> = {};
      await Promise.all(
        list.map(async (b) => {
          try {
            const ticketRes = await fetch(`/api/tickets?booking_id=${b.id}`, { credentials: "include" });
            if (ticketRes.ok) {
              const tickets = await ticketRes.json();
              if (Array.isArray(tickets) && tickets.length > 0) {
                const seatLabels = tickets
                  .filter((t: any) => t.seat_letter)
                  .map((t: any) => `${t.row_index + 1}${t.seat_letter}`)
                  .join(", ");
                seatMap[b.id] = seatLabels || "-";
              } else {
                seatMap[b.id] = "-";
              }
            } else {
              seatMap[b.id] = "-";
            }
          } catch {
            seatMap[b.id] = "-";
          }
        })
      );
      setSeats(seatMap);

    } catch {
      setError("Du har inga bokningar just nu.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);
  function canCancel(startTime: string): boolean {
    const showingTime = new Date(startTime).getTime();
    const now = new Date().getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    return showingTime - now > twoHoursMs;
  }

  async function handleCancel(booking: Booking) {
    if (!window.confirm(`Vill du avboka bokning #${booking.booking_number}?`)) return;

    setCancellingId(booking.id);
    setCancelMessage(null);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ booking_number: booking.booking_number, email: "" }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || data?.error) {
        setCancelMessage({ text: data?.error ?? "Något gick fel vid avbokning.", ok: false });
      } else {
        setCancelMessage({ text: "Bokningen har avbokats.", ok: true });
        await fetchBookings();
      }
    } catch {
      setCancelMessage({ text: "Något gick fel vid avbokning.", ok: false });
    } finally {
      setCancellingId(null);
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

  function statusLabel(status: string): string {
    if (status === "cancelled") return "Avbokad";
    if (status === "reserved")  return "Reserverad";
    if (status === "expired")   return "Utgången";
    return "Visad";
  }

  function statusClass(status: string): string {
    if (status === "cancelled") return "my-bookings__pill my-bookings__pill--cancelled";
    if (status === "reserved")  return "my-bookings__pill my-bookings__pill--reserved";
    return "my-bookings__pill my-bookings__pill--confirmed";
  }

  return (
    <article className="container mt-4">

      <h1 className="my-bookings__title">Mina Bokningar</h1>

      {loading && <p className="text-white">Laddar bokningar...</p>}
      {error && <p className="my-bookings__empty">{error}</p>}

      {cancelMessage && (
        <p className={`my-bookings__alert ${cancelMessage.ok ? "my-bookings__alert--ok" : "my-bookings__alert--error"}`}>
          {cancelMessage.text}
        </p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p className="my-bookings__empty">Du har inga bokningar just nu.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="my-bookings__table">
          <div className="my-bookings__head">
            <div className="my-bookings__cell my-bookings__cell--number">Bokningsnummer</div>
            <div className="my-bookings__cell my-bookings__cell--date">Datum</div>
            <div className="my-bookings__cell my-bookings__cell--time">Tid</div>
            <div className="my-bookings__cell my-bookings__cell--film">Film</div>
            <div className="my-bookings__cell my-bookings__cell--hall">Platser</div>
            <div className="my-bookings__cell my-bookings__cell--price">Total pris</div>
            <div className="my-bookings__cell my-bookings__cell--action">Status</div>
          </div>

          {bookings.map((b) => {
            const isActive = b.booking_status === "confirmed" || b.booking_status === "reserved";
            const allowCancel = isActive && canCancel(b.start_time);

            return (
              <div key={b.id} className="my-bookings__row">
                <div className="my-bookings__cell my-bookings__cell--number">#{b.booking_number}</div>
                <div className="my-bookings__cell my-bookings__cell--date">{formatDate(b.start_time)}</div>
                <div className="my-bookings__cell my-bookings__cell--time">{formatTime(b.start_time)}</div>
                <div className="my-bookings__cell my-bookings__cell--film">{b.film_title}</div>
                <div className="my-bookings__cell my-bookings__cell--hall">{seats[b.id] ?? "..."}</div>
                <div className="my-bookings__cell my-bookings__cell--price">{b.total_price}:-</div>
                <div className="my-bookings__cell my-bookings__cell--action">
                  {allowCancel ? (
                    <button
                      className="my-bookings__cancel-btn"
                      onClick={() => handleCancel(b)}
                      disabled={cancellingId === b.id}
                    >
                      {cancellingId === b.id ? "Avbokar..." : "Avboka"}
                    </button>
                  ) : (
                    <span className={statusClass(b.booking_status)}>
                      {statusLabel(b.booking_status)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </article>
  );
}
