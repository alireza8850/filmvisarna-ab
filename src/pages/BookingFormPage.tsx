
import { Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useBooking } from "../utils/BookingContext";
import type Seat from "../interfaces/Seat";
import "/sass/-booking-form.scss";

BookingFormPage.route = {
  path: "/bookingformpage",
};

export default function BookingFormPage() {
  const navigate = useNavigate();
  // Prices + seats passed from TicketPickerPage
  const location = useLocation();
  const { vuxenPrice, barnPrice, pensionarPrice, seats } = location.state as {
    vuxenPrice: number;
    barnPrice: number;
    pensionarPrice: number;
    seats: Seat[];
  };
  // Booking context
  const { film, showing, tickets, selectedSeats, clearBooking } = useBooking(); // Adding the selected seats to send them to backend/db // Fatima
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!film || !showing) {
    return (
      <div className="container mt-5 text-center">
        <h2>Ingen bokning påbörjad</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Gå till startsidan
        </button>
      </div>
    );
  }
  // Should remove this declartion / no longer needed / we fetch the chosen tickets on TicketPicker.tsx
  const totalPrice =
    tickets.adult * vuxenPrice +
    tickets.child * barnPrice +
    tickets.senior * pensionarPrice;

  const totalTickets = tickets.adult + tickets.child + tickets.senior;
  // Convert selected seat IDs → seat objects
  const selectedSeatObjects = selectedSeats
    .map((id) => seats.find((s: Seat) => s.id === id))
    .filter((seat) : seat is Seat => seat !== undefined);

    const ticketRows = [
    { label: "Vuxen", count: tickets.adult, price: vuxenPrice },
    { label: "Barn", count: tickets.child, price: barnPrice },
    { label: "Pensionär", count: tickets.senior, price: pensionarPrice },
    ].filter((t) => t.count > 0);
  
  const handleBooking = async () => {
    if (!email) {
      alert("Vänligen fyll i din e-postadress");
      return;
    }
    // update the chosen seats
    setIsSubmitting(true);
    try {
      const ticketRequests = [];
      let seatIndex = 0;
      for (let i = 0; i < tickets.adult; i++)
        ticketRequests.push({
          ticket_type_id: 1,
          seat_id: selectedSeats[seatIndex++],
        });
      for (let i = 0; i < tickets.child; i++)
        ticketRequests.push({
          ticket_type_id: 2,
          seat_id: selectedSeats[seatIndex++],
        });
      for (let i = 0; i < tickets.senior; i++)
        ticketRequests.push({
          ticket_type_id: 3,
          seat_id: selectedSeats[seatIndex++],
        });

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send all the needed information to bd-booking / backend 
          showing_id: showing.id,
          email: email, // Just for now because we need to reset this to check if the user is not looged in
          // user_id: user? user.id : null ==> next ==> booking_email: user? null: email
          tickets: ticketRequests,
          total_price: totalPrice
        }),
      });

      if (response.ok) {
        clearBooking();
        navigate("/confirmation");
      } else {
        const error = await response.text();
        alert("Bokningen misslyckades: " + error);
      }
    } catch (err) {
      console.error(err);
      alert("Ett fel uppstod vid bokningen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch (e) {
      return "N/A";
    }
  };

  const formatDate = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("sv-SE");
    } catch (e) {
      return "N/A";
    }
  };

  const infoRows = [
    { etikett: "Film:", varde: film.title },
    { etikett: "Tid:", varde: formatTime(showing.start_time) },
    { etikett: "Datum:", varde: formatDate(showing.start_time) },
    { etikett: "Salong:", varde: showing.hall_name },
  ];

  return (
    <div className="overview-page">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title text-center">Översikt</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <div className="card p-3">
            <div className="poster-row">
              <div className="info-block">
                {infoRows.map(({ etikett, varde }) => (
                  <div key={etikett} className="info-row">
                    <span className="film-info">{etikett}</span>
                    <span className="film-info-value">{varde}</span>
                  </div>
                ))}
              </div>
              <img
                src={"/images/" + film.poster_url}
                alt={film.title}
                className="poster"
              />
            </div>
            <hr
              style={{ borderColor: "var(--border-color)", margin: "12px 0" }}
            />{" "}
            {/*
            Chosen seats summary
              */}
            <span className="section-label">Valda platser</span>
            <div className="seat-grid">
              {selectedSeatObjects.map((seat) => {

              // change row_idex to a letter
                const rowLetter = String.fromCharCode(
                  "A".charCodeAt(0) + seat.row_index,
                );

                // count seatIndex / number
                const seatIndex =
                  seat.seat_letter.charCodeAt(0) - "A".charCodeAt(0);

                // how many seats before
                const seatsBefore = seats.filter(
                  (s) =>
                    s.hall_id === seat.hall_id && s.row_index < seat.row_index,
                ).length;

                // how many seats on this row
                const rowSeats = seats.filter(
                  (s) =>
                    s.hall_id === seat.hall_id &&
                    s.row_index === seat.row_index,
                );

                // count the seatNumber
                const seatNumber = seatsBefore + (rowSeats.length - seatIndex);

                return (
                  <div key={seat.id} className="seat-row">
                    <span className="seat-label">Rad: {rowLetter}</span>
                    <span className="seat-value">Plats: {seatNumber}</span>
                  </div>
                );
              })}
            </div>
            <hr
              style={{ borderColor: "var(--border-color)", margin: "12px 0" }}
            />
            {ticketRows.map(({ label, count, price }) => (
              <div key={label} className="price-row">
                <span className="summery-info">
                  {label} x {count}
                </span>
                <span className="summery-info-value">{count * price} kr</span>
              </div>
            ))}
            <div className="price-row">
              <span className="summery-info">Antal biljetter:</span>
              <span className="summery-info-value">{totalTickets}</span>
            </div>
            <div className="price-row last">
              <span className="summery-info">
                <strong>Total pris:</strong>
              </span>
              <span className="summery-info-value">
                <strong>{totalPrice} kr</strong>
              </span>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Row className="mb-2">
            <Col>
              <input
                type="email"
                className="email-input"
                placeholder="skriv in din e-post"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Col>
          </Row>
          {/* OBS: messages*/}
          <p className="obs">
            <strong>OBS: Avbokning måste ske 2 timmar innan visningen.</strong>
          </p>

          <p className="betalning">
            <strong>Betalning sker på biografen.</strong>
          </p>
          <Row className="mt-3 justify-content-end">
            <Col xs="auto">
              <button
                className="slutfor-btn"
                type="button"
                onClick={handleBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sparar..." : "Slutför"}
              </button>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}