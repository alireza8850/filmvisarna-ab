export default async function ticketTypeLoader({ params }: any) {
    const id = params.id;
    const TicketType = await (await fetch("/api/ticket_types/ticket_prices/" + id)).json();
    return {
        TicketType,
    };
}