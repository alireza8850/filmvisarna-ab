import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import ticketTypeLoader from "../utils/TickettypeLoader";
import type TicketType from "../interfaces/TicketType";
import NotFoundPage from "./NotFoundPage";


const PRICES = {
    adult: 140,
    child: 80,
    senior: 120
};

TicketPicker.route = {
    path: "/ticket_types/:id",
    parent: "/",
    loader: ticketTypeLoader,
};

export default function TicketPicker() {
    // 🚨 THE FIX IS HERE: Changed .ticket_types to .TicketType to match your loader!
    const ticketData = (useLoaderData() as any)?.TicketType as TicketType;

    const navigate = useNavigate();

    const [tickets, setTickets] = useState({ adult: 0, child: 0, senior: 0 });

    // if no data found from the database, show 404
    if (!ticketData) {
        return <NotFoundPage />;
    }

    const totalCount = tickets.adult + tickets.child + tickets.senior;
    const totalPrice = (tickets.adult * PRICES.adult) + (tickets.child * PRICES.child) + (tickets.senior * PRICES.senior);

    const update = (type: keyof typeof tickets, delta: number) => {
        setTickets(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
    };

    const rows = [
        { id: "adult", label: "Vuxen", price: PRICES.adult },
        { id: "child", label: "Barn", price: PRICES.child },
        { id: "senior", label: "Pensionär", price: PRICES.senior },
    ] as const;

    return (
        <article className="ticket-details mt-4">
            <h2 className="ticket-details__title mb-4">Välj biljetter</h2>

            <section className="ticketBox p-4 border rounded">
                {rows.map(({ id, label, price }) => (
                    <div key={id} className="d-flex justify-content-between align-items-center mb-3">
                        <div className="fw-bold">{label}: <span className="text-muted fw-normal">{price} kr</span></div>
                        <div className="d-flex align-items-center gap-3">
                            <button className="btn btn-outline-dark" onClick={() => update(id, -1)}>−</button>
                            <div className="fw-bold fs-5">{tickets[id]}</div>
                            <button className="btn btn-outline-dark" onClick={() => update(id, 1)}>+</button>
                        </div>
                    </div>
                ))}

                <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded mt-4 border-top">
                    <div className="fw-bold">Total pris ({totalCount} st):</div>
                    <div className="fw-bold fs-4">{totalPrice} kr</div>
                </div>
            </section>

            <div className="mt-4 d-flex justify-content-end">
                <button
                    className="btn btn-dark btn-lg px-5"
                    disabled={totalCount === 0}
                    onClick={() => {
                        navigate("/checkout");
                    }}
                >
                    Gå vidare
                </button>
            </div>

        </article>
    );
}