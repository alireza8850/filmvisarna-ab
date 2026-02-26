import { useLoaderData } from "react-router-dom";
import { useState, useMemo } from "react";
import bookingLoader from "../utils/bookingLoader";
import type Hall from "../interfaces/Hall";
import type Seat from "../interfaces/Seat";
import type Booking from "../interfaces/Booking";
import "../styles/seat.scss";

// ─── Props ────────────────────────────────────────────────────────────────────
interface SeatSelectionProps {
  /** How many seats the user may pick (= totalCount from TicketPickerPage) */
  totalTickets: number;
  /** Called with final selected seat IDs when the user confirms */
  onSeatsConfirmed?: (seatIds: number[]) => void;
}

// Route config kept so the file works standalone if needed
SeatSelectionPage.route = {
  path: "/booking/:showingId/seats",
  parent: "/",
  loader: bookingLoader,

export default function SeatSelectionPage({
  totalTickets,
  onSeatsConfirmed,
}: SeatSelectionProps) {
  // ── Data from bookingLoader ─────────────────────────────────────────────────
  const { Hall, Seat, Booking } = useLoaderData() as {
    Hall: Hall[];
    Seat: Seat[];
    Booking: Booking[];
  };

  