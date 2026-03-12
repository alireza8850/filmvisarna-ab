import type { LoaderFunctionArgs } from "react-router-dom";
import type Showing from "../interfaces/Showing";
import type Film from "../interfaces/Film";
import type TicketType from "../interfaces/TicketType";
import type TicketPrice from "../interfaces/TicketPrice";
import type Hall from "../interfaces/Hall";
import type Seat from "../interfaces/Seat";
import type Booking from "../interfaces/Booking";
import type Ticket from "../interfaces/Ticket";

export default async function bookingLoader({ params }: LoaderFunctionArgs) {
  const showingId = params.showingId;

  if (!showingId) {
    throw new Response("Missing showing ID", { status: 400 });
  }

  // 1) Fetch showing
  let showing: Showing | null = null;
  try {
    const res = await fetch(`/api/showings/${showingId}`);
    if (res.ok) {
      showing = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch showing", e);
  }

  if (!showing) {
    throw new Response("Showing not found", { status: 404 });
  }

  // 2) Fetch film
  let film: Film | null = null;
  try {
    const res = await fetch(`/api/films/${showing.film_id}`);
    if (res.ok) {
      film = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch film", e);
  }

  if (!film) {
    throw new Response("Film not found", { status: 404 });
  }

  // 3) Fetch ticket types
  const ticketTypes: TicketType[] = await (
    await fetch(`/api/ticket_types`)
  ).json();

  // 4) Fetch ticket prices
  let ticketPrices: TicketPrice[] = [];
  try {
    const res = await fetch(`/api/ticket_prices`);
    if (res.ok) {
      ticketPrices = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch ticket prices", e);
  }

  //5) Featch hall
  let halls: Hall[] = [];
  try {
    const res = await fetch(`/api/halls`);
    if (res.ok) {
      halls = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch halls", e);
  }

  //6) featch seat
  let seats: Seat[] = [];
  try {
    const res = await fetch(`/api/seats`);
    if (res.ok) {
      seats = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch seats", e);
  }

  //7) featch booking
  let booking: Booking[] = [];
  try {
    const res = await fetch(`/api/bookings`);
    if (res.ok) {
      booking = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch bookings", e);
  }

  //8)Ticket
  let tickets: Ticket[] = [];
  try {
    const res = await fetch(`/api/showings/:id/tickets`);
    if (res.ok) {
      tickets = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch tickets", e);
  }

  return {
    showing,
    film,
    ticketTypes, // Placeholder if needed
    ticketPrices,
    halls,
    seats,
    booking,
    tickets,
  };
}
