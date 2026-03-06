import { useEffect, useState } from "react";
import type Booking from "../interfaces/Booking";

Bookingstatus.route = {
  path: "/my-bookings",
  menuLabel: "Mina bokningar",
  index: 3,
};

export default function Bookingstatus() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings/my", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  function statusLabel(status: string): string {
    if (status === "cancelled") return "Avbokad";
    if (status === "reserved")  return "Reserverad";
    if (status === "expired")   return "Utgången";
    return "Bekräftad";
  }

  function statusClass(status: string): string {
    if (status === "cancelled") return "my-bookings__pill my-bookings__pill--cancelled";
    if (status === "reserved")  return "my-bookings__pill my-bookings__pill--reserved";
    return "my-bookings__pill my-bookings__pill--confirmed";
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

  return (
    <article className="container mt-4">

      <h1 className="my-bookings__title">Mina Bokningar</h1>

      {loading && <p className="text-white">Laddar bokningar...</p>}

      {!loading && bookings.length === 0 && (
        <p className="my-bookings__empty">Du har inga bokningar just nu.</p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="my-bookings__table">
          <div className="my-bookings__head">
            <div className="my-bookings__cell my-bookings__cell--number">Bokningsnummer</div>
            <div className="my-bookings__cell my-bookings__cell--date">Datum</div>
            <div className="my-bookings__cell my-bookings__cell--time">Tid</div>
            <div className="my-bookings__cell my-bookings__cell--film">Film</div>
            <div className="my-bookings__cell my-bookings__cell--hall">Salong</div>
            <div className="my-bookings__cell my-bookings__cell--price">Total pris</div>
            <div className="my-bookings__cell my-bookings__cell--action">Status</div>
          </div>

          {bookings.map((b) => (
            <div key={b.id} className="my-bookings__row">
              <div className="my-bookings__cell my-bookings__cell--number">#{b.booking_number}</div>
              <div className="my-bookings__cell my-bookings__cell--date">{formatDate(b.start_time)}</div>
              <div className="my-bookings__cell my-bookings__cell--time">{formatTime(b.start_time)}</div>
              <div className="my-bookings__cell my-bookings__cell--film">{b.film_title}</div>
              <div className="my-bookings__cell my-bookings__cell--hall">{b.hall_name}</div>
              <div className="my-bookings__cell my-bookings__cell--price">{b.total_price}:-</div>
              <div className="my-bookings__cell my-bookings__cell--action">
                <span className={statusClass(b.booking_status)}>{statusLabel(b.booking_status)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </article>
  );
}