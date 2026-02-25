export default async function ticketTypeLoader({ params }: any) {
    const id = params.id;
    const ticket_types = await (await fetch("/api/ticket_types" + id)).json();
    const ticket_price = await (await fetch("/api/ticket_price" + id)).json();
    return {
        ticket_types,
        ticket_price
    };
}