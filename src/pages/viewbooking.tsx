import { useEffect, useState } from "react";
import "./MyBookingsPage.scss";

interface Booking {
  id: number;
  booking_number: string;
  booking_status: "confirmed" | "cancelled" | "reserved" | "expired";
  total_price: number;
  film_title: string;
  start_time: string;
  hall_name: string;
}

MyBookingsPage.route = {
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
      const res = await fetch("/api/bookings/my");
      if (res.status === 401) {
        setError("Du måste vara inloggad för att se dina bokningar.");
        return;
      }
      const data = await res.json();
      setBookings(data);
    } catch {
      setError("Kunde inte hämta bokningar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function handleCancel(booking: Booking) {
    const confirmed = window.confirm(
      `Vill du avboka bokning #${booking.booking_number}?`
    );
    if (!confirmed) return;

    setCancellingId(booking.id);
    setCancelMessage(null);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_number: booking.booking_number,
          email: "",
        }),
      });
      const data = await res.json();
      if (data.error) {
        setCancelMessage({ text: data.error, ok: false });
      } else {
        setCancelMessage({ text: "Bokningen har avbokats.", ok: true });
        fetchBookings();
      }
    } catch {
      setCancelMessage({ text: "Något gick fel vid avbokning.", ok: false });
    } finally {
      setCancellingId(null);
    }
  }

  const now = new Date().toISOString();

  // Split bookings: current = upcoming confirmed/reserved, history = past or cancelled/expired
  const currentBookings = bookings.filter(
    (b) =>
      (b.booking_status === "confirmed" || b.booking_status === "reserved") &&
      b.start_time >= now
  );
  const historyBookings = bookings.filter(
    (b) =>
      b.booking_status === "cancelled" ||
      b.booking_status === "expired" ||
      b.start_time < now
  );

  function formatDate(str: string) {
    return new Date(str).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(str: string) {
    return new Date(str).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusLabel(b: Booking) {
    if (b.booking_status === "cancelled") return "Avbokad";
    if (b.booking_status === "expired") return "Utgången";
    if (b.start_time < now) return "Genomförd";
    if (b.booking_status === "reserved") return "Reserverad";
    return "Bekräftad";
  }

  function statusClass(b: Booking) {
    if (b.booking_status === "cancelled") return "booking-status--cancelled";
    if (b.booking_status === "expired") return "booking-status--expired";
    if (b.start_time < now) return "booking-status--past";
    if (b.booking_status === "reserved") return "booking-status--reserved";
    return "booking-status--confirmed";
  }

  return (
    <article className="container mt-4 my-bookings-page">

      <h1 className="my-bookings-title">Mina bokningar</h1>

      {loading && <p className="my-bookings-loading">Laddar bokningar...</p>}
      {error && <p className="my-bookings-error">{error}</p>}

      {cancelMessage && (
        <div className={`my-bookings-alert ${cancelMessage.ok ? "my-bookings-alert--ok" : "my-bookings-alert--error"}`}>
          {cancelMessage.text}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* --- CURRENT BOOKINGS --- */}
          <section className="bookings-section">
            <h2 className="bookings-section-title">Aktuella bokningar</h2>

            {currentBookings.length === 0 ? (
              <p className="bookings-empty">Du har inga aktuella bokningar just nu.</p>
            ) : (
              <div className="bookings-grid">
                {currentBookings.map((booking) => (
                  <div key={booking.id} className="booking-card booking-card--active">

                    <div className="booking-card-header">
                      <span className={`booking-status ${statusClass(booking)}`}>
                        {statusLabel(booking)}
                      </span>
                      <span className="booking-number">#{booking.booking_number}</span>
                    </div>

                    <h3 className="booking-film-title">{booking.film_title}</h3>

                    <div className="booking-meta">
                      <span><i className="bi bi-building"></i> {booking.hall_name}</span>
                      <span><i className="bi bi-calendar3"></i> {formatDate(booking.start_time)}</span>
                      <span><i className="bi bi-clock"></i> {formatTime(booking.start_time)}</span>
                      <span><i className="bi bi-cash"></i> {booking.total_price} kr</span>
                    </div>

                    <button
                      className="booking-cancel-btn"
                      onClick={() => handleCancel(booking)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? "Avbokar..." : "Avboka"}
                    </button>

                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- HISTORY --- */}
          <section className="bookings-section mt-5">
            <h2 className="bookings-section-title">Historik</h2>

            {historyBookings.length === 0 ? (
              <p className="bookings-empty">Ingen bokningshistorik ännu.</p>
            ) : (
              <div className="bookings-grid">
                {historyBookings.map((booking) => (
                  <div key={booking.id} className="booking-card booking-card--history">

                    <div className="booking-card-header">
                      <span className={`booking-status ${statusClass(booking)}`}>
                        {statusLabel(booking)}
                      </span>
                      <span className="booking-number">#{booking.booking_number}</span>
                    </div>

                    <h3 className="booking-film-title">{booking.film_title}</h3>

                    <div className="booking-meta">
                      <span><i className="bi bi-building"></i> {booking.hall_name}</span>
                      <span><i className="bi bi-calendar3"></i> {formatDate(booking.start_time)}</span>
                      <span><i className="bi bi-clock"></i> {formatTime(booking.start_time)}</span>
                      <span><i className="bi bi-cash"></i> {booking.total_price} kr</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </article>
  );
}