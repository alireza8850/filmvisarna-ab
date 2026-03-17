import { useState } from "react";
import { useUser } from "../utils/UserContext";

AdminLockupPage.route = {
  path: "/onlyadmin",
};

export default function AdminLockupPage() {
  const { user } = useUser();

  // Load user
  if (user === null) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Laddar...</span>
        </div>
      </div>
    );
  }

  // Only admin/staff allowed
  if (user.role !== "admin" && user.role !== "staff") {
    return (
      <div className="container mt-5 text-center">
        <h2>Åtkomst nekad</h2>
        <p>Endast administratörer och personal kan söka bokningar.</p>
      </div>
    );
  }

  const [bookingNumber, setBookingNumber] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    setError("");
    setSuccess("");
    setResult(null);

    if (!bookingNumber) {
      setError("Ange ett bokningsnummer.");
      return;
    }

    try {
      // Fetch booking
      const res = await fetch(`/api/bookings/${bookingNumber}`, {
        credentials: "include",
      });

      const booking = await res.json();

      if (!res.ok || booking.error) {
        setError(booking.error || "Fel vid hämtning av bokning.");
        return;
      }

      // Fetch tickets
      const ticketsRes = await fetch(`/api/tickets?booking_id=${booking.id}`, {
        credentials: "include",
      });

      const tickets = await ticketsRes.json();

      // Merge
      booking.tickets = tickets;

      setResult(booking);
    } catch (err) {
      setError("Ett oväntat fel inträffade.");
    }
  };

  const handleCancel = async () => {
    const confirmDelete = window.confirm(
      "Är du säker på att du vill avboka denna bokning?",
    );

    if (!confirmDelete) return;

    const res = await fetch(`/api/bookings/${result.booking_number}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      setError(data.error || "Kunde inte avboka bokningen.");
      return;
    }

    setSuccess("Bokningen har avbokats.");
    setResult(null);
    setBookingNumber("");
  };


  const rowLetter = (index: number) =>
    String.fromCharCode("A".charCodeAt(0) + index);

  const seatNumber = (letter: string) =>
  letter.charCodeAt(0) - "A".charCodeAt(0) + 1;

  return (
    <div className="lookup-page container mt-5">
      <h2 className="text-center mb-4">Sök bokning</h2>

      <div className="lookup-box p-4 shadow-sm rounded">
        <label className="form-label fw-bold">Bokningsnummer</label>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Ange bokningsnummer"
          value={bookingNumber}
          onChange={(e) => setBookingNumber(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={handleSearch}>
          Sök
        </button>

        {error && (
          <div className="alert alert-warning text-center mt-3">{error}</div>
        )}

        {success && (
          <div className="alert alert-success text-center mt-3">{success}</div>
        )}
      </div>

      {result && (
        <div className="booking-result mt-4 p-4 shadow-sm rounded">
          <h4 className="mb-3">Bokning #{result.booking_number}</h4>

          <p>
            <strong>Film:</strong> {result.film_title}
          </p>
          <p>
            <strong>Starttid:</strong> {result.start_time}
          </p>
          <p>
            <strong>Salong:</strong> {result.hall_name}
          </p>
          <p>
            <strong>Email:</strong> {result.booking_email}
          </p>
          <p>
            <strong>Pris:</strong> {result.total_price} kr
          </p>
          <p>
            <strong>Status:</strong> {result.booking_status}
          </p>

          <hr />
          <h5 className="mt-3">Platser</h5>

          {result.tickets && result.tickets.length > 0 ? (
            <ul className="seat-list">
              {result.tickets.map((t: any) => (
                <li key={t.id} className="seat-item">
                  {rowLetter(t.row_index)}
                  {seatNumber(t.seat_letter)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Inga platser hittades.</p>
          )}

          <hr />

          <p className="text-muted">Bokningen skapades: {result.created_at}</p>

          {result.booking_status !== "cancelled" && (
            <button className="btn btn-danger mt-3" onClick={handleCancel}>
              Avboka bokning
            </button>
          )}
        </div>
      )}
    </div>
  );
}