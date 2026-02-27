-- Migration script to update tickets table for nullable seat_id
-- Run this script in your MySQL database

-- Drop the tickets table (this will delete existing ticket data!)
DROP TABLE IF EXISTS tickets;

-- Recreate the tickets table with nullable seat_id and no UNIQUE constraint on (showing_id, seat_id)
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    showing_id INT NOT NULL,
    seat_id INT NULL,
    ticket_type_id INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (showing_id) REFERENCES showings(id),
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id)
);

-- Re-insert seed data for tickets
INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
SELECT 1, 1, id, 1 FROM seats WHERE hall_id = 1 AND row_index = 1 AND seat_letter = 'J';

INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
SELECT 1, 1, id, 1 FROM seats WHERE hall_id = 1 AND row_index = 1 AND seat_letter = 'I';

INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
SELECT 2, 3, id, 2 FROM seats WHERE hall_id = 2 AND row_index = 3 AND seat_letter = 'C';
