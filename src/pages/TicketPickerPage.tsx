import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import bookingLoader from "../utils/bookingLoader";
import type Film from "../interfaces/Film";
import type Hall from "../interfaces/Hall";
import type Seat from "../interfaces/Seat";
import type Showing from "../interfaces/Showing";
import type Ticket from "../interfaces/Ticket";
import type TicketType from "../interfaces/TicketType";
import type TicketPrice from "../interfaces/TicketPrice";
import { useBooking } from "../utils/BookingContext";
import SeatSelector from "./SeatSelector";

TicketPickerPage.route = {
  path: "/booking/:showingId/tickets",
  parent: "/",
  loader: bookingLoader,
};

export default function TicketPickerPage() {
  const navigate = useNavigate();
  const { film, showing, halls, seats, tickets, ticketTypes, ticketPrices } =
    useLoaderData() as {
      film: Film;
      showing: Showing;
      halls: Hall[];
      seats: Seat[];
      tickets: Ticket[];
      ticketTypes: TicketType[];
      ticketPrices: TicketPrice[];
    };
  const { setTickets } = useBooking();

  const [vuxen, setVuxen] = useState(0);
  const [barn, setBarn] = useState(0);
  const [pensionar, setPensionar] = useState(0);

  //
  useEffect(() => {
    setTickets({ adult: vuxen, child: barn, senior: pensionar });
  }, [vuxen, barn, pensionar, setTickets]);
  //Extract prices from DB;
  const vuxenPrice =
    ticketPrices.find((p) => p.ticket_type_id === 1)?.price ?? 0;
  const barnPrice =
    ticketPrices.find((p) => p.ticket_type_id === 2)?.price ?? 0;
  const pensionarPrice =
    ticketPrices.find((p) => p.ticket_type_id === 3)?.price ?? 0;

  const totalPrice =
    vuxen * vuxenPrice + barn * barnPrice + pensionar * pensionarPrice;

  const totalCount = vuxen + barn + pensionar;

  return (
    <article className="ticket-picker container mt-4">
      {/* Title */}
      <h2 className="ticket-picker__title">{film.title} Välj biljetter</h2>

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

        {/* Seat Selector */}
        {totalCount > 0 && (
          <div className="mt-5">
            <SeatSelector
              showing={showing}
              film={film}
              halls={halls}
              seats={seats}
              tickets={tickets}
              ticketTypes={ticketTypes}
              ticketPrices={ticketPrices}
            />
          </div>
        )}

        <div className="d-flex justify-content-end mt-4 pb-4">
          <button
            className="slutfor-btn"
            disabled={totalCount === 0}
            onClick={() => {
              setTickets({ adult: vuxen, child: barn, senior: pensionar });
              navigate("/bookingformpage");
            }}
          >
            Fortsätt
          </button>
        </div>
      </section>
    </article>
  );
}
