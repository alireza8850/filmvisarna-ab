import React, { useState, useEffect } from "react";
import { useBooking } from "../utils/BookingContext";
import type Seat from "../interfaces/Seat";
import type Hall from "../interfaces/Hall";
import type Showing from "../interfaces/Showing";
import type Ticket from "../interfaces/Ticket";
import bookingLoader from "../utils/bookingLoader";
import type SeatBookedEvent from "../interfaces/SeatBookedEvent";

SeatSelector.route = {
  path: "/booking/:showingId/tickets",
  parent: "/",
  loader: bookingLoader,
};

type SeatSelectorProps = {
  showing: Showing;
  halls: Hall[];
  seats: Seat[];
  tickets: Ticket[];
};

export default function SeatSelector({
  showing,
  halls,
  seats,
  tickets: soldTickets,
}: SeatSelectorProps) {
  const { tickets, selectedSeats, setSelectedSeats } = useBooking();

  const totalTickets = tickets.adult + tickets.child + tickets.senior;

  // find hall
  const hall = Array.isArray(halls) ? halls.find((h) => h.id === showing.hall_id) : undefined;
  if (!hall) return <p>Kunde inte hitta salongen</p>;

  const totalRows = hall.total_rows;

  // filter seats for this hall
  const hallSeats = Array.isArray(seats) ? seats.filter((s) => s.hall_id === hall.id) : [];

  // convert seat_letter → seatIndex
  const seatsWithIndex = hallSeats.map((s) => ({
    ...s,
    seatIndex: s.seat_letter.charCodeAt(0) - "A".charCodeAt(0),
  }));

  // click-sound
  const playClick = () => {
    const audio = new Audio("/sounds/mouse-click.mp3");
    audio.currentTime = 0;
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  // booked seats
  const bookedSeatIds = new Set(
    Array.isArray(soldTickets)
      ? soldTickets
          .filter((t) => t.showing_id === showing.id)
          .map((t) => t.seat_id)
      : [],
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

  const [liveBookedSeats, setLiveBookedSeats] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    setSelectedSeats(localSelected);
  }, [localSelected]);

  // update the seats if the show is changed
  useEffect(() => {
    setLiveBookedSeats(new Set());
  }, [showing.id]);

  // SSE listener
  useEffect(() => {
    const url = `/api/seats-sse/${showing.id}`;
    const eventSource = new EventSource(url);

    // seat booked
    eventSource.addEventListener("seatsBooked", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as SeatBookedEvent;

      if (data.seat_id !== undefined && data.showing_id === showing.id) {
        setLiveBookedSeats((prev) => {
          const updated = new Set(prev);
          updated.add(data.seat_id!);
          return updated;
        });

        setLocalSelected((prev) => prev.filter((id) => id !== data.seat_id));
      }
    });

    // seats released
    eventSource.addEventListener("seatsReleased", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as SeatBookedEvent;

      if (data.released_seats !== undefined && data.showing_id === showing.id) {
        setLiveBookedSeats((prev) => {
          const updated = new Set(prev);
          data.released_seats!.forEach((id: number) => updated.delete(id));
          return updated;
        });
      }
    });

    return () => eventSource.close();
  }, [showing.id]);

  function toggleSeat(seatId: number) {
    if (bookedSeatIds.has(seatId)) return;
    // live update
    if (liveBookedSeats.has(seatId)) return;
    // call click-sound function
    playClick();

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
        <div className="screen-border">FILMDUK / SCREEN</div>
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
                {rowSeats.map((seat) => {
                  const isBooked =
                    bookedSeatIds.has(seat.id) || liveBookedSeats.has(seat.id);

                  const isSelected = localSelected.includes(seat.id);

                  const selectionLimitReached =
                    totalTickets > 0 && localSelected.length >= totalTickets;

                  return (
                    <React.Fragment key={seat.id}>
                      <button
                        disabled={
                          isBooked || (selectionLimitReached && !isSelected)
                        }
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
                        <svg className="seat-vip" viewBox="0 0 90 90">
                          <path
                            className="vip-back"
                            d="M20 15 Q45 0 70 15 L70 45 Q45 60 20 45 Z"
                          />

                          <path
                            className="vip-base"
                            d="M15 45 Q45 65 75 45 L75 65 Q45 80 15 65 Z"
                          />

                          <rect
                            x="8"
                            y="38"
                            width="12"
                            height="38"
                            rx="8"
                            ry="8"
                            className="vip-arm"
                          />
                          <rect
                            x="70"
                            y="38"
                            width="12"
                            height="38"
                            rx="8"
                            ry="8"
                            className="vip-arm"
                          />
                          <rect
                            x="28"
                            y="68"
                            width="34"
                            height="10"
                            rx="5"
                            ry="5"
                            className="vip-foot"
                          />
                        </svg>
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
