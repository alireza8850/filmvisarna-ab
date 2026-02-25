import type { LoaderFunctionArgs } from "react-router-dom";
import type Showing from "../interfaces/Showing";
import type Film from "../interfaces/Film";
import type TicketType from "../interfaces/TicketType";
import type TicketPrice from "../interfaces/TicketPrice";
 
export default async function bookingLoader({ params }: LoaderFunctionArgs) {
  const showingId = params.showingId;
 
  if (!showingId) {
    throw new Response("Missing showing ID", { status: 400 });
  }
 
  // 1) Fetch showing
  const showing: Showing = await (await fetch(`/api/showings/${showingId}`)).json();
 
  if (!showing) {
    throw new Response("Showing not found", { status: 404 });
  }
 
  // 2) Fetch film
  const film: Film = await (await fetch(`/api/films/${showing.film_id}`)).json();
 
  // 3) Fetch ticket types
  const ticketTypes: TicketType[] = await (await fetch(`/api/ticket_types`)).json();
 
  // 4) Fetch ticket prices
  const ticketPrices: TicketPrice[] = await (await fetch(`/api/ticket_prices`)).json();
 
  return {
    showing,
    film,
    ticketTypes,
    ticketPrices
  };
}