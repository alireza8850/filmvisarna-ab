export default async function seatsLoader({ params }: any) {
  const showingId = params.showingId;

  const showing = await (await fetch(`/api/showings/${showingId}`)).json();
  const seats = await (await fetch(`/api/showings/${showingId}/seats`)).json();
  const ticketTypes = await (await fetch(`/api/ticket-types`)).json();
  const ticketPrices = await (await fetch(`/api/ticket-prices`)).json();

  return { showing, seats, ticketTypes, ticketPrices };
}