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
            <h2 className="ticket-details__title mb-4" style={{ color: "#fff" }}></h2>

            {/* 2. ALL CUSTOM CSS CLASSES ARE APPLIED HERE */}
            <section className="ticketBox">
                <h2 className="ticketBox__title">Välj biljetter</h2>

                {rows.map(({ id, label, price }, index) => (
                    <div key={id} className={`ticketRow ${index === rows.length - 1 ? 'ticketRow--last' : ''}`}>
                        <div className="ticketRow__left">
                            <div className="ticketRow__label">{label}:</div>
                            <div className="ticketRow__price">{price} kr</div>
                        </div>

                        <div className="ticketRow__right">
                            <button className="ticketBtn ticketBtn--minus" onClick={() => update(id, -1)}>−</button>
                            <div className="ticketCount">{tickets[id]}</div>
                            <button className="ticketBtn ticketBtn--plus" onClick={() => update(id, 1)}>+</button>
                        </div>

                    </div>
                ))}

                <div className="ticketTotal">
                    <div className="ticketTotal__box">
                        <span>Total pris:</span>
                        <span>{totalPrice}kr</span>
                    </div>
                    <div className="ticketTotal__count">{totalCount}</div>
                </div>
            </section>

            <div className="mt-4" style={{ maxWidth: "1000px", display: "flex", justifyContent: "flex-end" }}>
                <button
                    className="btn btn-primary btn-lg px-5"
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