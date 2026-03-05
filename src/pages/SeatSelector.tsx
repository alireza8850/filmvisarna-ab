import React, { useState, useEffect } from "react";
import { useBooking } from "../utils/BookingContext";
import type Seat from "../interfaces/Seat";
import type Hall from "../interfaces/Hall";
import type Showing from "../interfaces/Showing";
import type Ticket from "../interfaces/Ticket";
import type Film from "../interfaces/Film";
import type TicketType from "../interfaces/TicketType";
import type TicketPrice from "../interfaces/TicketPrice";
import bookingLoader from "../utils/bookingLoader";

SeatSelector.route = {
  path: "/booking/:showingId/tickets",
  parent: "/",
  loader: bookingLoader,
};


type SeatSelectorProps = {
  showing: Showing;
  film: Film;
  halls: Hall[];
  seats: Seat[];
  tickets: Ticket[];
  ticketTypes: TicketType[];
  ticketPrices: TicketPrice[];
};

export default function SeatSelector({
  showing,
  film,
  halls,
  seats,
  tickets: soldTickets,
  ticketTypes,
  ticketPrices,
}: SeatSelectorProps) {
  const { tickets, selectedSeats, setSelectedSeats } = useBooking();

  const totalTickets = tickets.adult + tickets.child + tickets.senior;

  // find hall
  const hall = halls.find((h) => h.id === showing.hall_id);
  if (!hall) return <p>Kunde inte hitta salongen</p>;

  const totalRows = hall.total_rows; 
  const seatsPerRow = hall.seats_per_row; 

  // filter seats for this hall
  const hallSeats = seats.filter((s) => s.hall_id === hall.id);

  // convert seat_letter → seatIndex
  const seatsWithIndex = hallSeats.map((s) => ({
    ...s,
    seatIndex: s.seat_letter.charCodeAt(0) - "A".charCodeAt(0),
  }));

  // booked seats
  const bookedSeatIds = new Set(
    soldTickets
      .filter((t) => t.showing_id === showing.id)
      .map((t) => t.seat_id),
  );

  // group seats by row_index
  const seatsByRow = seatsWithIndex.reduce(
    (acc, seat) => {
      if (!acc[seat.row_index]) acc[seat.row_index] = [];
      acc[seat.row_index].push(seat);
      return acc;
    },
    {} as Record<number, typeof seatsWithIndex>,
  );

  // Sort seats inside each row from RIGHT → LEFT
  Object.values(seatsByRow).forEach((rowSeats) =>
    rowSeats.sort((a, b) => a.seatIndex - b.seatIndex),
  );

  const [localSelected, setLocalSelected] = useState<number[]>(selectedSeats);

  useEffect(() => {
    setSelectedSeats(localSelected);
  }, [localSelected]);

function toggleSeat(seatId: number) {
  if (bookedSeatIds.has(seatId)) return;

  if (localSelected.includes(seatId)) {
    setLocalSelected(localSelected.filter((id) => id !== seatId));
  } else {
    if (totalTickets > 0 && localSelected.length >= totalTickets) return;
    setLocalSelected([...localSelected, seatId]);
  }
}

  const rowLetter = (index: number) =>
    String.fromCharCode("A".charCodeAt(0) + index);

  return (
    <div className="seat-page">
      <div className="screen">
        <div className="screen-border">FILMDUK</div>
        <br />
        <div className="legend">
          <span className="legend-item available"></span> Tillgänglig
          <span className="legend-item selected"></span> Vald
          <span className="legend-item booked"></span> Fullbokad
          <br />
        </div>
      </div>

      <div className="seat-map">
        {Array.from({ length: totalRows }).map((_, rowIndex) => {
          const rowSeats = seatsByRow[rowIndex] ?? [];

          // 
          const seatsBefore = Object.values(seatsByRow)
            .slice(0, rowIndex)
            .reduce((sum, row) => sum + row.length, 0);

          return (
            <div key={rowIndex} className="seat-row">
              <span className="row-number">{rowLetter(rowIndex)}</span>
                
              <div className="row-seats">
                {rowSeats.map((seat, index) => {
                  const isBooked = bookedSeatIds.has(seat.id);
                  const isSelected = localSelected.includes(seat.id);

                  const selectionLimitReached =
                    totalTickets > 0 && localSelected.length >= totalTickets;
                  
                  const seatNumber =
                    seatsBefore + (rowSeats.length - seat.seatIndex);

                  return (
                    <React.Fragment key={seat.id}>
                      <button
                        disabled={isBooked || selectionLimitReached}
                        onClick={() => toggleSeat(seat.id)}
                        className={[
                          "seat",
                          isBooked && "booked",
                          isSelected && "selected",
                          selectionLimitReached &&
                            !isSelected &&
                            "disabled-limit",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {seatNumber}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="selected-info">
        Valda platser: {localSelected.length} / {totalTickets}
      </div>
    </div>
  );
}