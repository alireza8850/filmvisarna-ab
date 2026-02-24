import { useLoaderData } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { useState } from "react";

SeatSelectionPage.route = {
  path:"/booking/:showingId"
}

export default function SeatSelectionPage() {
  const { showing, seats, ticketTypes, ticketPrices } = useLoaderData() as any;

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [ticketCounts, setTicketCounts] = useState(
    Object.fromEntries(ticketTypes.map((t: any) => [t.id, 0]))
  );

  const toggleSeat = (seatId: number, isBooked: boolean) => {
    if (isBooked) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  return (
    <article className="seat-selection">
      <h2 className="mb-4">{showing.film_title}</h2>

      {/* Ticket Types */}
      <Row className="ticket-types mb-4">
        {ticketTypes.map((type: any) => (
          <Col xs={4} key={type.id}>
            <div className="ticket-type-box">
              <span>{type.name}: {ticketPrices[type.id]} kr</span>
              <input
                type="number"
                min={0}
                value={ticketCounts[type.id]}
                onChange={(e) =>
                  setTicketCounts({
                    ...ticketCounts,
                    [type.id]: Number(e.target.value),
                  })
                }
              />
            </div>
          </Col>
        ))}
      </Row>

      {/* Seat Map */}
      <div className="seat-map">
        {seats.map((row: any, rowIndex: number) => (
          <Row key={rowIndex} className="mb-2">
            {row.map((seat: any) => (
              <Col xs={1} key={seat.id}>
                <div
                  className={
                    "seat-box " +
                    (seat.isBooked ? "seat-booked" : "") +
                    (selectedSeats.includes(seat.id) ? "seat-selected" : "")
                  }
                  onClick={() => toggleSeat(seat.id, seat.isBooked)}
                >
                  {seat.label}
                </div>
              </Col>
            ))}
          </Row>
        ))}
      </div>

      <button className="continue-btn mt-4">Gå till bokningsform</button>
    </article>
  );
}
