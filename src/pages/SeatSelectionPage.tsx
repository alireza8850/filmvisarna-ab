import { useLoaderData } from "react-router-dom";
import { useState } from "react";
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
    export default function SeatSelectionPage({ totalTickets, onSeatsConfirmed }: SeatSelection) 
    {
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
    //  Step 3: Column letters A, B, C … J (or A … H)
   // seatsPerRow = 10 → ["A","B","C","D","E","F","G","H","I","J"]
   // seatsPerRow = 8  → ["A","B","C","D","E","F","G","H"]
   const columns: string[] = [];
   for (let i = 0; i < seatsPerRow; i++) {
     columns.push(String.fromCharCode(65 + i)); // 65 = "A"
    }


    //Step 4: Row numbers 1, 2, 3 … 10 (shown top=10, bottom=1)
    const rows: number[] = [];
    for (let r = totalRows; r >= 1; r--) {
    rows.push(r);
    } 
   // rows = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
   // Row 10 renders at top of the grid, row 1 at bottom — like a real cinema

   // ── Step 5: Quick seat lookup "1-A" → Seat object
   // Instead of searching the whole Seat array on every render,
   // we build a simple object map once.
   const seatMap: Record<string, Seat> = {};
   for (const seat of Seat) {
     seatMap[`${seat.row_index}-${seat.seats_letter}`] = seat;
   }
   // seatMap["1-A"] = { id: 1, row_index: 1, seat_letter: "A", hall_id: 1 }
   // seatMap["3-C"] = { id: 23, ... }
   // Step 6: How many seats still need to be picked 
   const remaining  = totalTickets - selectedIds.length;
   const isComplete = totalTickets > 0 && remaining === 0;
    // Step 7: What is the status of a seat?
   function getSeatStatus(seat: Seat): "booked" | "selected" | "available" {
    if (bookedSeatIds.includes(seat.id)) return "booked";    // already sold
    if (selectedIds.includes(seat.id))   return "selected";  // user picked it
    return "available";                                       // free to pick
  }

   //  Step 8: User clicks a seat 
   function handleSeatClick(seat: Seat) {
    // Booked seats can never be clicked
    if (bookedSeatIds.includes(seat.id)) return;

    if (selectedIds.includes(seat.id)) {
      // Already selected → deselect it
      setSelectedIds(selectedIds.filter((id) => id !== seat.id));
    } else {
      // Not selected → add it, but only if we still have tickets left
      if (selectedIds.length < totalTickets) {
        setSelectedIds([...selectedIds, seat.id]);
      }
    }
  }




    }