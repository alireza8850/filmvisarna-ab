import { useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import bookingLoader from "../utils/bookingLoader";
import type Film from "../interfaces/Film";
import { useBooking } from "../utils/BookingContext";


TicketPickerPage.route = {
  path: "/booking/:showingId/tickets",
  parent: "/",
  loader: bookingLoader,
};

export default function TicketPickerPage() {
  const navigate = useNavigate();
  const { film } = useLoaderData() as {
    film: Film;
  };

  const { setTickets, setPrices } = useBooking();

  const [vuxen, setVuxen] = useState(0);
  const [barn, setBarn] = useState(0);
  const [pensionar, setPensionar] = useState(0);

  const vuxenPrice = 140;
  const barnPrice = 80;
  const pensionarPrice = 120;

  const totalPrice = (vuxen * vuxenPrice) + (barn * barnPrice) + (pensionar * pensionarPrice);
  const totalCount = vuxen + barn + pensionar;

  const handleContinue = () => {
    if (totalCount === 0) {
      alert('Välj minst en biljett!');
      return;
    }

    // Save ticket counts to context
    setTickets({ vuxen, barn, pensionar });
    setPrices({ vuxen: vuxenPrice, barn: barnPrice, pensionar: pensionarPrice });

    // Navigate to booking form
    navigate('/bookingformpage');
  };

  return (
    <article className="ticket-picker container mt-4">

      {/* Title */}
      <h2 className="ticket-picker__title">
        {film.title} Välj biljetter
      </h2>

      {/* Ticket Box */}
      <section className="ticketBox">
        <h3 className="ticketBox_title">Biljetter</h3>

        {/* Vuxen */}
        <div className="ticketRow">
          <div className="ticketRow_left">
            <div className="ticketRow__label">Vuxen</div>
            <div className="ticketRow__price">{vuxenPrice} kr</div>
          </div>
          <div className="ticketRow__right">
            <button
              className="ticketBtn ticketBtn--minus"
              onClick={() => setVuxen(Math.max(0, vuxen - 1))}
            >
              –
            </button>
            <div className="ticketCount">{vuxen}</div>
            <button
              className="ticketBtn ticketBtn--plus"
              onClick={() => setVuxen(vuxen + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Barn */}
        <div className="ticketRow">
          <div className="ticketRow_left">
            <div className="ticketRow__label">Barn</div>
            <div className="ticketRow__price">{barnPrice} kr</div>
          </div>
          <div className="ticketRow__right">
            <button
              className="ticketBtn ticketBtn--minus"
              onClick={() => setBarn(Math.max(0, barn - 1))}
            >
              –
            </button>
            <div className="ticketCount">{barn}</div>
            <button
              className="ticketBtn ticketBtn--plus"
              onClick={() => setBarn(barn + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Pensionär */}
        <div className="ticketRow ticketRow--last">
          <div className="ticketRow_left">
            <div className="ticketRow__label">Pensionär</div>
            <div className="ticketRow__price">{pensionarPrice} kr</div>
          </div>
          <div className="ticketRow__right">
            <button
              className="ticketBtn ticketBtn--minus"
              onClick={() => setPensionar(Math.max(0, pensionar - 1))}
            >
              –
            </button>
            <div className="ticketCount">{pensionar}</div>
            <button
              className="ticketBtn ticketBtn--plus"
              onClick={() => setPensionar(pensionar + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="ticketTotal">
          <div className="ticketTotal_box">
            <span>Total pris:</span>
            <span>{totalPrice} kr</span>
          </div>
          <div className="ticketTotal_count">
            <div className="ticketTotal_label">Antal Biljetter</div>
            <div className="ticketTotal_number">{totalCount}</div>
          </div>
        </div>
      </section>

      <div className="mt-3 d-flex justify-content-end">
        <button
          className="btn btn-primary"
          onClick={handleContinue}
        >
          Fortsätt till bokning
        </button>
      </div>

    </article>
  );
}