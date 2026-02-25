export default interface Booking{
    id: number;
    booking_number: string;
    user_id ?:number;
    showing_id :number;
    booking_status: 'reserved' |'confirmed'|'cancelled'|'expired';
    total_price : number;
    created_at: Date;
    expires_at: Date;

}
