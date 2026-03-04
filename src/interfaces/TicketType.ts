export default interface TicketType {
    id: number;           // e.g., "adult", "child", "senior"
    ticket_types: "adult" | "child" | "senior";        // e.g., "Vuxen"
}