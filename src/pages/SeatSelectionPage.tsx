import { useLoaderData } from "react-router-dom";
import { useState, useMemo } from "react";
import bookingLoader from "../utils/bookingLoader";
import type Hall from "../interfaces/Hall";
import type Seat from "../interfaces/Seat";
import type Booking from "../interfaces/Booking";
import "../styles/seat.scss";
import type Ticket from "../interfaces/Ticket";


   interface SeatSelection {
   //How many seats the user may pick (= totalCount from TicketPickerPage) 
   totalTickets: number;
   //Called with final selected seat IDs when the user confirms 
   onSeatsConfirmed?: (seatIds: number[]) => void;
    }

  // Route config 
    SeatSelectionPage.route = {
    path: "/booking/:showingId/seats",
    parent: "/",
    loader: bookingLoader,
    };
    export default function SeatSelectionPage({ totalTickets, onSeatsConfirmed }: SeatSelection) {
     const { Hall, Seat, Ticket } = useLoaderData() as {
     Hall: Hall[];
     Seat: Seat[];
     Ticket: Ticket[];
    };
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    //  Step 1: Which seats are already booked?
    // The tickets table has UNIQUE(showing_id, seat_id)
    // So if a ticket exists for this showing → that seat is taken.
    // We collect all booked seat IDs into a plain array.
    const bookedSeatIds = Ticket.map((t) => t.seat_id);
    // e.g. [12, 45, 67] — these seat IDs are already sold
    //  Step 2: Hall info
    // Hall 1 = Stora salongen: 10 rows, 10 seats per row → seats 1A–10J
    // Hall 2 = Lilla salongen: 8 rows,  8 seats per row  → seats 1A–8H
    const hall       = Hall[0];
    const totalRows  = hall.total_rows;    // 10 or 8
    const seatsPerRow = hall.seats_per_row; // 10 or 8


  