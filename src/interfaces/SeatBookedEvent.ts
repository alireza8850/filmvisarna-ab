export default interface SeatBookedEvent {
  showing_id: number;
  seat_id: number; // to book
  released_seats?: number[]; // to cancel
}