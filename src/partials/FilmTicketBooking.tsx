import { useState } from "react";
import type TicketType from "../interfaces/TicketType";

// Props expected by the component
interface TicketSelectorProps {
    ticketTypes: TicketType[];   // array of available ticket types
}
Ticketselector.route = {
    path: "/ticket_types/:id",
    parent: "/",
    loader: filmsLoader,
};

export default function TicketSelector({ ticketTypes }: TicketSelectorProps) {
    // State to hold quantities for each ticket type
    const [quantities, setQuantities] = useState<number[]>(
        ticketTypes.map(() => 0)
    );

    // Helper to update quantity for a specific index
    const updateQuantity = (index: number, delta: number) => {
        setQuantities(prev => {
            const newQuantities = [...prev];
            newQuantities[index] = Math.max(0, prev[index] + delta); // never below 0
            return newQuantities;
        });
    };

    // Calculate totals
    const totalTickets = quantities.reduce((sum, qty) => sum + qty, 0);
    const totalPrice = quantities.reduce(
        (sum, qty, idx) => sum + qty * ticketTypes[idx].price,
        0
    );
    // Map ticket_type to Swedish labels
    const getLabel = (type: string) => {
        const map: Record<string, string> = {
            adult: 'Vuxen',
            child: 'Barn',
            senior: 'Pensionär'
        };
        return map[type] || type;
    };

    return (
        <div className="ticket-selector">
            <h3 className="ticket-selector__title">Välj biljetter</h3>

            {ticketTypes.map((type, index) => (
                <div key={type.id} className="ticket-selector__row">
                    <span className="ticket-selector__label">{type.label}:</span>
                    <span className="ticket-selector__price">{type.price} kr</span>
                    <div className="ticket-selector__controls">
                        <button
                            className="ticket-selector__button"
                            onClick={() => updateQuantity(index, -1)}
                            disabled={quantities[index] === 0}
                        >
                            –
                        </button>
                        <span className="ticket-selector__quantity">
                            {quantities[index]}
                        </span>
                        <button
                            className="ticket-selector__button"
                            onClick={() => updateQuantity(index, 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}

            <div className="ticket-selector__total">
                <span>Total pris: {totalPrice} kr</span>
                <span>{totalTickets}</span>
            </div>
        </div>
    );
}