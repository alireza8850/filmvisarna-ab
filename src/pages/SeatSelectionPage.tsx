import { useLoaderData } from "react-router-dom";
import { useState, useMemo } from "react";
import bookingLoader from "../utils/bookingLoader";
import type Hall from "../interfaces/Hall";
import type Seat from "../interfaces/Seat";
import type Booking from "../interfaces/Booking";
import "../styles/seat.scss";
import type Ticket from "../interfaces/Ticket";

// ─── Props ────────────────────────────────────────────────────────────────────
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

  