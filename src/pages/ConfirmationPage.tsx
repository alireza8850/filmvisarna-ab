import { useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "../utils/BookingContext";

ConfirmationPage.route = {
  path: "/confirmation",
};

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearBooking } = useBooking();

  const booking = location.state?.booking;

  const handleGoHome = () => {
    clearBooking();
    navigate("/");
  };

  return (
    <article className="confirmation-page">
      <div className="confirmation-page__curtain confirmation-page__curtain--left"></div>
      <div className="confirmation-page__curtain confirmation-page__curtain--right"></div>
      <div className="confirmation-page__content">
        <h1 className="confirmation-page__title">Tack!</h1>
        <p className="confirmation-page__message">
          Din bokning har bekräftats och en bekräftelse<br />
          samt kvitto har skickats till din e-post.
        </p>
        {booking && (
          <div className="confirmation-page__details" style={{ margin: '2rem 0', textAlign: 'center' }}>
            <p><strong>Bokningsnummer:</strong> {booking.booking_number}</p>
            <p><strong>Film:</strong> {booking.film_title}</p>
            <p><strong>Salong:</strong> {booking.hall_name}</p>
            <p><strong>Starttid:</strong> {new Date(booking.start_time).toLocaleString('sv-SE')}</p>
            <p><strong>Totalt pris:</strong> {booking.total_price} kr</p>
          </div>
        )}
        <button
          className="confirmation-page__button"
          onClick={handleGoHome}
        >
          Gå till start sidan
        </button>
      </div>
    </article>
  );
}
