import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type Film from '../interfaces/Film';

interface TicketSelection {
  adult: number;
  child: number;
  senior: number;
}

interface Showing {
  id: number;
  film_id: number;
  hall_id: number;
  start_time: string;
  hall_name: string;
}

interface BookingContextType {
  film: Film | null;
  showing: Showing | null;
  tickets: TicketSelection;
  setFilm: (film: Film | null) => void;
  setShowing: (showing: Showing | null) => void;
  setTickets: (tickets: TicketSelection) => void;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [film, setFilm] = useState<Film | null>(null);
  const [showing, setShowing] = useState<Showing | null>(null);
  const [tickets, setTickets] = useState<TicketSelection>({ adult: 0, child: 0, senior: 0 });

  const clearBooking = () => {
    setFilm(null);
    setShowing(null);
    setTickets({ adult: 0, child: 0, senior: 0 });
  };

  return (
    <BookingContext.Provider value={{ film, showing, tickets, setFilm, setShowing, setTickets, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
