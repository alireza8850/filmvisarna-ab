export default interface TicketPrice {
    id: number;
    ticket_type_id: number;
    price: number;
    valid_from:Date;
    valid_to:Date;
}