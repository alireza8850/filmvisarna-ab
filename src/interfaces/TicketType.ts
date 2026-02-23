export default interface TicketType {
    id: string;           // e.g., "adult", "child", "senior"
    label: string;        // e.g., "Vuxen"
    price: number;        // in SEK (or any currency)
}