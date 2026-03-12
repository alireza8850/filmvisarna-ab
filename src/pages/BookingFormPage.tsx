import { Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useBooking } from "../utils/BookingContext";
import { useUser } from "../utils/UserContext";
import type Seat from "../interfaces/Seat";
import "/sass/-booking-form.scss";

BookingFormPage.route = {
  path: "/bookingformpage",
};

export default function BookingFormPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useUser();

  const { vuxenPrice, barnPrice, pensionarPrice, seats } = location.state as {
    vuxenPrice: number;
    barnPrice: number;
    pensionarPrice: number;
    seats: Seat[];
  };

  const { film, showing, tickets, selectedSeats, clearBooking } = useBooking();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const totalPrice =
    tickets.adult * vuxenPrice +
    tickets.child * barnPrice +
    tickets.senior * pensionarPrice;

  const totalTickets = tickets.adult + tickets.child + tickets.senior;

  const selectedSeatObjects = selectedSeats
    .map((id) => seats.find((s) => s.id === id))
    .filter((seat): seat is Seat => seat !== undefined);

  const ticketRows = [
    { label: "Vuxen", count: tickets.adult, price: vuxenPrice },
    { label: "Barn", count: tickets.child, price: barnPrice },
    { label: "Pensionär", count: tickets.senior, price: pensionarPrice },
  ].filter((t) => t.count > 0);

  const handleBooking = async () => {
    setErrorMessage(null);

    if (!user && !email) {
      setErrorMessage("Vänligen fyll i din e-postadress.");
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketRequests: any[] = [];
      let seatIndex = 0;

      for (let i = 0; i < tickets.adult; i++) {
        ticketRequests.push({
          ticket_type_id: 1,
          seat_id: selectedSeats[seatIndex++],
        });
      }

      for (let i = 0; i < tickets.child; i++) {
        ticketRequests.push({
          ticket_type_id: 2,
          seat_id: selectedSeats[seatIndex++],
        });
      }

      for (let i = 0; i < tickets.senior; i++) {
        ticketRequests.push({
          ticket_type_id: 3,
          seat_id: selectedSeats[seatIndex++],
        });
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          showing_id: showing.id,
          email: user ? null : email,
          tickets: ticketRequests,
          total_price: totalPrice,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Bokningen sparades!");

        setTimeout(() => {
          clearBooking();
          navigate("/confirmation", { replace: true });
        }, 800);
      } else {
        const errorText = await response.text();

        if (errorText.includes("platser")) {
          setErrorMessage(
            "Tyvärr blev en av platserna bokad av någon annan. Välj nya platser.",
          );

          setTimeout(() => {
            navigate(`/booking/${showing.id}/tickets`, { replace: true });
          }, 1500);
        } else {
          setErrorMessage("Bokningen misslyckades.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Ett tekniskt fel uppstod.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("sv-SE");
  };

  const infoRows = [
    { etikett: "Film:", varde: film.title },
    { etikett: "Tid:", varde: formatTime(showing.start_time) },
    { etikett: "Datum:", varde: formatDate(showing.start_time) },
    { etikett: "Salong:", varde: showing.hall_name },
  ];

  const imageUrl = film.poster_url?.startsWith("http")
    ? film.poster_url
    : "/images/" + film.poster_url;

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

              <img src={imageUrl} alt={film.title} className="poster" />
            </div>

            <hr style={{ margin: "12px 0" }} />

            <span className="section-label">Valda platser</span>

            <div className="ticket-list">
              {selectedSeatObjects.map((seat) => {
                const rowLetter = String.fromCharCode(
                  "A".charCodeAt(0) + seat.row_index,
                );

                const seatIndex =
                  seat.seat_letter.charCodeAt(0) - "A".charCodeAt(0);

                const seatsBefore = seats.filter(
                  (s) =>
                    s.hall_id === seat.hall_id && s.row_index < seat.row_index,
                ).length;

                const rowSeats = seats.filter(
                  (s) =>
                    s.hall_id === seat.hall_id &&
                    s.row_index === seat.row_index,
                );

                const seatNumber = seatsBefore + (rowSeats.length - seatIndex);

                return (
                  <div key={seat.id} className="ticket-card">
                    <span>Rad:</span>
                    <span className="ticket-row">{rowLetter}</span>

                    <span>Plats:</span>
                    <span className="ticket-seat">{seatNumber}</span>
                  </div>
                );
              })}
            </div>

            <hr style={{ margin: "12px 0" }} />

            {ticketRows.map(({ label, count, price }) => (
              <div key={label} className="price-row">
                <span>
                  {label} x {count}
                </span>
                <span>{count * price} kr</span>
              </div>
            ))}

            <div className="price-row">
              <span>Antal biljetter</span>
              <span>{totalTickets}</span>
            </div>

            <div className="price-row last">
              <strong>Total pris:</strong>
              <strong>{totalPrice} kr</strong>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          {errorMessage && <div className="booking-error">{errorMessage}</div>}

          {successMessage && (
            <div className="booking-success">{successMessage}</div>
          )}

          <Row className="mb-2">
            <Col>
              {user ? (
                <div className="logged-user">
                  Bokar som{" "}
                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                </div>
              ) : (
                <input
                  type="email"
                  className="email-input"
                  placeholder="skriv in din e-post"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}
            </Col>
          </Row>

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