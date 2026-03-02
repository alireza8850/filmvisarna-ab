
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useBooking } from "../utils/BookingContext";
import "/sass/-booking-form.scss";

BookingFormPage.route = {
  path: "/bookingformpage",
};

export default function BookingFormPage() {
  const navigate = useNavigate();
  const { film, showing, tickets, clearBooking } = useBooking();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!film || !showing) {
    return (
      <div className="container mt-5 text-center">
        <h2>Ingen bokning påbörjad</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>Gå till startsidan</button>
      </div>
    );
  }

  const vuxenPrice = 160;
  const barnPrice = 95;
  const pensionarPrice = 120;

  const totalPrice = (tickets.adult * vuxenPrice) + (tickets.child * barnPrice) + (tickets.senior * pensionarPrice);

  const handleBooking = async () => {
    if (!email) {
      alert("Vänligen fyll i din e-postadress");
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketRequests = [];
      for (let i = 0; i < tickets.adult; i++) ticketRequests.push({ ticket_type_id: 1, seat_id: null });
      for (let i = 0; i < tickets.child; i++) ticketRequests.push({ ticket_type_id: 2, seat_id: null });
      for (let i = 0; i < tickets.senior; i++) ticketRequests.push({ ticket_type_id: 3, seat_id: null });

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showing_id: showing.id,
          email: email,
          tickets: ticketRequests
        })
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
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "N/A";
    }
  };

  const formatDate = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('sv-SE');
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
            <Row className="g-3">
              <Col>
                {infoRows.map(({ etikett, varde }) => (
                  <Row key={etikett} className="mb-2">
                    <Col><span className="film-info">{etikett}</span></Col>
                    <Col xs="auto"><span className="film-info-value">{varde}</span></Col>
                  </Row>
                ))}
              </Col>
            </Row>
            <hr style={{ borderColor: "var(--border-color)", margin: "12px 0" }} />
            
            <Row className="price-summery">
              <Col><span className="summery-info">Vuxen x {tickets.adult}</span></Col>
              <Col xs="auto"><span className="summery-info-value">{tickets.adult * vuxenPrice} kr</span></Col>
            </Row>
            <Row className="price-summery">
              <Col><span className="summery-info">Barn x {tickets.child}</span></Col>
              <Col xs="auto"><span className="summery-info-value">{tickets.child * barnPrice} kr</span></Col>
            </Row>
            <Row className="price-summery">
              <Col><span className="summery-info">Pensionär x {tickets.senior}</span></Col>
              <Col xs="auto"><span className="summery-info-value">{tickets.senior * pensionarPrice} kr</span></Col>
            </Row>
            <Row className="price-summery" style={{ borderBottom: "none", paddingTop: "10px" }}>
              <Col><span className="summery-info">Total pris</span></Col>
              <Col xs="auto"><span className="summery-info-value">{totalPrice} kr</span></Col>
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