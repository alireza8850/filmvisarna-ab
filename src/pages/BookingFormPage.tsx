
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "/sass/-booking-form.scss";
import { useBooking } from "../utils/BookingContext";


BookingFormPage.route = {
  path: "/bookingformpage",

};



export default function BookingFormPage(){
  const navigate = useNavigate();
  const { bookingState, getTotalPrice } = useBooking();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showing, film, tickets, prices } = bookingState;

  // If no booking data, redirect back
  if (!showing || !film) {
    navigate('/');
    return null;
  }

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      alert('Ange en giltig e-postadress');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create tickets array for API
      const ticketsArray = [];

      // Add adult tickets (type 1)
      for (let i = 0; i < tickets.vuxen; i++) {
        ticketsArray.push({
          ticket_type_id: 1,
          seat_id: null // No seat selection yet - will be added later
        });
      }

      // Add child tickets (type 2)
      for (let i = 0; i < tickets.barn; i++) {
        ticketsArray.push({
          ticket_type_id: 2,
          seat_id: null // No seat selection yet - will be added later
        });
      }

      // Add senior tickets (type 3)
      for (let i = 0; i < tickets.pensionar; i++) {
        ticketsArray.push({
          ticket_type_id: 3,
          seat_id: null // No seat selection yet - will be added later
        });
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showing_id: showing.id,
          email: email,
          tickets: ticketsArray
        })
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const result = await response.json();

      // Navigate to confirmation with booking data
      navigate('/confirmation', { state: { booking: result } });
    } catch (error) {
      console.error('Booking error:', error);
      alert('Det gick inte att slutföra bokningen. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTime = new Date(showing.start_time);
  const hallName = showing.hall_id === 1 ? 'Stora salongen' : 'Lilla salongen';

  return(

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
                <Row className="mb-2">
                  <Col><span className="film-info">Film:</span></Col>
                  <Col xs="auto"><span className="film-info-value">{film.title}</span></Col>
                </Row>
                <Row className="mb-2">
                  <Col><span className="film-info">Tid:</span></Col>
                  <Col xs="auto"><span className="film-info-value">{startTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</span></Col>
                </Row>
                <Row className="mb-2">
                  <Col><span className="film-info">Datum:</span></Col>
                  <Col xs="auto"><span className="film-info-value">{startTime.toLocaleDateString('sv-SE')}</span></Col>
                </Row>
                <Row className="mb-2">
                  <Col><span className="film-info">Salong:</span></Col>
                  <Col xs="auto"><span className="film-info-value">{hallName}</span></Col>
                </Row>
              </Col>
            </Row>
            <hr style={{borderColor: "var(--border-color)", margin: "12px 0"}} />

            {tickets.vuxen > 0 && (
              <Row className="price-summery">
                <Col><span className="summery-info">Vuxen x {tickets.vuxen}</span></Col>
                <Col xs="auto"><span className="summery-info-value">{tickets.vuxen * prices.vuxen} kr</span></Col>
              </Row>
            )}
            {tickets.barn > 0 && (
              <Row className="price-summery">
                <Col><span className="summery-info">Barn x {tickets.barn}</span></Col>
                <Col xs="auto"><span className="summery-info-value">{tickets.barn * prices.barn} kr</span></Col>
              </Row>
            )}
            {tickets.pensionar > 0 && (
              <Row className="price-summery">
                <Col><span className="summery-info">Pensionär x {tickets.pensionar}</span></Col>
                <Col xs="auto"><span className="summery-info-value">{tickets.pensionar * prices.pensionar} kr</span></Col>
              </Row>
            )}
            <Row className="price-summery" style={{borderBottom:"none", paddingTop: "10px"}}>
                <Col><span className="summery-info">Total pris</span></Col>
                <Col xs="auto"><span className="summery-info-value">{getTotalPrice()} kr</span></Col>
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
                />
            </Col>
          </Row>
          <Row className="mt-3 justify-content-end">
            <Col xs="auto">
                <button
                  className="slutfor-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Behandlar...' : 'Slutför'}
                </button>
            </Col>
          </Row>
        </Col>

      </Row>



    </div>


  )

}