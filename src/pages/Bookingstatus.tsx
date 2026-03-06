import { useEffect, useState } from "react";
import type Booking from "../interfaces/Booking";

MyBookingsPage .route = {
  path: "/my-bookings",
  menuLabel: "Mina bokningar",
  index: 3,
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
        setError("Du har inga bookingar just nu.");
        setBookings([]);
        return;
      }
      const data = (await res.json()) as Booking[];
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError("Du har inga bookingar just nu.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
    }
useEffect(() => {
    fetchBookings();
}, [])
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

  function statusLabel(b: Booking): string {
    if (b.booking_status === "cancelled") return "Avbokad";
    if (b.booking_status === "reserved")  return "Reserverad";
    return "Bekräftad";
  }

  function statusClass(b: Booking): string {
    if (b.booking_status === "cancelled") return "my-bookings__pill my-bookings__pill--cancelled";
    if (b.booking_status === "reserved")  return "my-bookings__pill my-bookings__pill--reserved";
    return "my-bookings__pill my-bookings__pill--confirmed";
  }

  function BookingRow({ booking }: { booking: Booking }) {
    const showCancel =
      booking.booking_status === "confirmed" || booking.booking_status === "reserved";

    return (
      <div className="my-bookings__row">
        <div className="my-bookings__cell my-bookings__cell--number">#{booking.booking_number}</div>
        <div className="my-bookings__cell my-bookings__cell--date">{formatDate(booking.start_time)}</div>
        <div className="my-bookings__cell my-bookings__cell--time">{formatTime(booking.start_time)}</div>
        <div className="my-bookings__cell my-bookings__cell--film">{booking.film_title}</div>
        <div className="my-bookings__cell my-bookings__cell--hall">{booking.hall_name}</div>
        <div className="my-bookings__cell my-bookings__cell--price">{booking.total_price}:-</div>
        <div className="my-bookings__cell my-bookings__cell--action">
          {showCancel ? (
            <button
              className="cancelation-page__btnAvboka"
              onClick={() => handleCancel(booking)}
              disabled={cancellingId === booking.id}
            >
              {cancellingId === booking.id ? "Avbokar..." : "Avboka"}
            </button>
          ) : (
            <span className={statusClass(booking)}>{statusLabel(booking)}</span>
          )}
        </div>
      </div>
    );
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
            <div className="my-bookings__cell my-bookings__cell--action">Avboka</div>
          </div>
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      )}

    </article>
  );
}