import { useLoaderData } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bookingLoader from "../utils/bookingLoader";
import type TicketPrice from "../interfaces/TicketPrice";
import type TicketType from "../interfaces/TicketType";
import type Showing from "../interfaces/Showing";
import type Film from "../interfaces/Film";


TicketPickerPage.route = {
  path: "/booking/:showingId/tickets",
  parent: "/",
  loader: bookingLoader,
};

export default function TicketPickerPage() {
  const navigate = useNavigate();

  const { showing, film, ticketTypes, ticketPrices } = useLoaderData() as {
    showing: Showing;
    film: Film;
    ticketTypes: TicketType[];
    ticketPrices: TicketPrice[];
  };

  // Create initial state: { adult: 0, child: 0, senior: 0 }
  const initialState = Object.fromEntries(
    ticketTypes.map((t) => [t.ticket_types, 0])
  ) as Record<string, number>;

  const [tickets, setTickets] = useState(initialState);

  // Helper: get price for a ticket type
  const getPrice = (type: string) => {
    const typeObj = ticketTypes.find((t) => t.ticket_types === type);
    if (!typeObj) return 0;

    const priceObj = ticketPrices.find(
      (p) => p.ticket_type_id === typeObj.id
    );

    return priceObj ? priceObj.price : 0;
  };

  // Total number of tickets
  const totalCount = Object.values(tickets).reduce((a, b) => a + b, 0);

  // Total price
  const totalPrice = Object.entries(tickets).reduce(
    (sum, [type, count]) => sum + count * getPrice(type),
    0
  );

  // Update ticket count
  const update = (type: string, delta: number) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  return (
    <article className="ticket-picker container mt-4">

      {/* Title */}
      <h2 className="ticket-picker__title">
        {film.title} – Välj biljetter
      </h2>

      {/* Ticket Box */}
      <section className="ticketBox">
        <h3 className="ticketBox_title">Biljetter</h3>

        {ticketTypes.map((t, index) => (
          <div
            key={t.id}
            className={`ticketRow ${index === ticketTypes.length - 1 ? "ticketRow--last" : ""
              }`}
          >
            {/* Left side: type + price */}
            <div className="ticketRow_left">
              <div className="ticketRow__label">{t.ticket_types}</div>
              <div className="ticketRow__price">{getPrice(t.ticket_types)} kr</div>
            </div>

            {/* Right side: - count + */}
            <div className="ticketRow__right">
              <button
                className="ticketBtn ticketBtn--minus"
                onClick={() => update(t.ticket_types, -1)}
              >
                –
              </button>

              <div className="ticketCount">{tickets[t.ticket_types]}</div>

              <button
                className="ticketBtn ticketBtn--plus"
                onClick={() => update(t.ticket_types, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="ticketTotal">
          <div className="ticketTotal_box">
            <span>Total pris:</span>
            <span>{totalPrice} kr</span>
          </div>

          <div className="ticketTotal_count">{totalCount}</div>
        </div>
      </section>

      {/* Continue Button */}
      <div className="mt-4 d-flex justify-content-end">
        <button
          className="btn btn-primary btn-lg px-5"
          disabled={totalCount === 0}
          onClick={() => navigate(`/booking/${showing.id}/seats`)}
        >
          Gå vidare
        </button>
      </div>
    </article>
  );
}