import { useState } from "react";
import ticketTypeLoader from "../utils/TickettypeLoader";
import type TicketType from "../interfaces/TicketType";
import { Row, Col, Accordion } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";


export const TicketBookingPageRoute = {
    path: "/ticket_types/:id",
    parent: "/",
    loader: ticketTypeLoader,
};
export default function TicketPicker() {
    const [adult, setAdult] = useState(2);
    const [child, setChild] = useState(1);
    const [senior, setSenior] = useState(1);
        const ticket_types = useLoaderData().ticket_types as TicketType;
    const [selectedTime, setSelectedTime] = useState<number | null>(null);

    const totalCount = adult + child + senior;

    const totalPrice = useMemo(() => {
        return adult * PRICES.adult + child * PRICES.child + senior * PRICES.senior;
    }, [adult, child, senior]);

    function dec(setter: (n: number) => void) {
        setter((n) => Math.max(0, n - 1));
    }

    function inc(setter: (n: number) => void) {
        setter((n) => n + 1);
    }

    // if no  found, show 404
    if (!ticket_types) {
        return <NotFoundPage />;
    }

     return (
        <section className="ticketBox">
            <h3 className="ticketBox__title">Välj biljetter</h3>

            <div className="ticketRow">
                <div className="ticketRow__left">
                    <div className="ticketRow__label">Vuxen:</div>
                    <div className="ticketRow__price">{PRICES.adult} kr</div>
                </div>

                <div className="ticketRow__right">
                    <button className="ticketBtn ticketBtn--minus" onClick={() => dec(setAdult)} aria-label="minus vuxen">−</button>
                    <div className="ticketCount">{adult}</div>
                    <button className="ticketBtn ticketBtn--plus" onClick={() => inc(setAdult)} aria-label="plus vuxen">+</button>
                </div>
            </div>

            <div className="ticketRow">
                <div className="ticketRow__left">
                    <div className="ticketRow__label">Barn:</div>
                    <div className="ticketRow__price">{PRICES.child} kr</div>
                </div>

                <div className="ticketRow__right">
                    <button className="ticketBtn ticketBtn--minus" onClick={() => dec(setChild)} aria-label="minus barn">−</button>
                    <div className="ticketCount">{child}</div>
                    <button className="ticketBtn ticketBtn--plus" onClick={() => inc(setChild)} aria-label="plus barn">+</button>
                </div>
            </div>

            <div className="ticketRow ticketRow--last">
                <div className="ticketRow__left">
                    <div className="ticketRow__label">Pensionär:</div>
                    <div className="ticketRow__price">{PRICES.senior} kr</div>
                </div>

                <div className="ticketRow__right">
                    <button className="ticketBtn ticketBtn--minus" onClick={() => dec(setSenior)} aria-label="minus pensionär">−</button>
                    <div className="ticketCount">{senior}</div>
                    <button className="ticketBtn ticketBtn--plus" onClick={() => inc(setSenior)} aria-label="plus pensionär">+</button>
                </div>
            </div>

            <div className="ticketTotal">
                <div className="ticketTotal__label">Total pris:</div>
                <div className="ticketTotal__price">{totalPrice} kr</div>
                <div className="ticketTotal__count">{totalCount}</div>
            </div>
        </section>
    );


}




/*
export default function TicketPicker() {
    


   
}
*/