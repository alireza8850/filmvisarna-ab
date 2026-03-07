
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
        const data = await response.json();
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
            <Row className="g-3 align-items-center">
              {/* Left side: Film info */}
              <Col>
                {infoRows.map(({ etikett, varde }) => (
                  <Row key={etikett} className="mb-2">
                    <Col>
                      <span className="film-info">{etikett}</span>
                    </Col>
                    <Col xs="auto">
                      <span className="film-info-value">{varde}</span>
                    </Col>
                  </Row>
                ))}
              </Col>

              {/* Right side: Film poster */}
              <Col xs="auto">
                <img
                  src={"/images/" + film.poster_url}
                  alt={film.title}
                  style={{
                    width: "200px",
                    borderRadius: "8px",
                  }}
                />
              </Col>
            </Row>
            <hr
              style={{ borderColor: "var(--border-color)", margin: "12px 0" }}
            />{" "}
            {/*
            Chosen seats summary
              */}
            <h4 className="seat-text">Valda platser</h4>
            {selectedSeatObjects.map((seat) => (
              <Row key={seat.id} className="mb-1">
                <Col className="seat-text">Rad: {seat.row_index + 1}</Col>
                <Col xs="auto" className="seat-text">
                  Plats: {seat.seat_letter}
                </Col>
              </Row>
            ))}
            <hr
              style={{ borderColor: "var(--border-color)", margin: "12px 0" }}
            />
            <Row className="price-summery">
              <Col>
                <span className="summery-info">Vuxen x {tickets.adult}</span>
              </Col>
              <Col xs="auto">
                <span className="summery-info-value">
                  {tickets.adult * vuxenPrice} kr
                </span>
              </Col>
            </Row>
            <Row className="price-summery">
              <Col>
                <span className="summery-info">Barn x {tickets.child}</span>
              </Col>
              <Col xs="auto">
                <span className="summery-info-value">
                  {tickets.child * barnPrice} kr
                </span>
              </Col>
            </Row>
            <Row className="price-summery">
              <Col>
                <span className="summery-info">
                  Pensionär x {tickets.senior}
                </span>
              </Col>
              <Col xs="auto">
                <span className="summery-info-value">
                  {tickets.senior * pensionarPrice} kr
                </span>
              </Col>
            </Row>
            <Row
              className="price-summery"
              style={{ borderBottom: "none", paddingTop: "10px" }}
            >
              <Col>
                <span className="summery-info">Total pris</span>
              </Col>
              <Col xs="auto">
                <span className="summery-info-value">{totalPrice} kr</span>
              </Col>
            </Row>
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

          <p className="betalning"><strong>Betalning sker på biografen.</strong></p>
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