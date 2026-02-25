import { useLoaderData } from "react-router-dom";
import { useState } from "react";
import bookingLoader from "../utils/bookingLoader";
import type TicketPrice from "../interfaces/TicketPrice";
import type TicketType from "../interfaces/TicketType";
import type Showing from "../interfaces/Showing";
import type Film from "../interfaces/Film";

import type Hall from "../interfaces/Hall";
import type Seat from "../interfaces/Seat";

SeatSelectionPage.route = {
  path: "/booking/:showingId/Seats",
  parent: "/",
  loader: bookingLoader,
};

export default function SeatSelectionPage() {
    return(
        <article className = "seatpicker">
            <h2> find seat</h2>
        </article>
    );
}
