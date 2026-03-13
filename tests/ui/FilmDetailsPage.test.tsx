import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLoaderData } from "react-router-dom";
import FilmDetailsPage from "../../src/pages/FilmDetailsPage";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBooking } from "../../src/utils/BookingContext";
import { useStateContext } from "../../src/utils/useStateObject";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLoaderData: vi.fn(),
  };
});

vi.mock("../../src/utils/BookingContext", () => ({
  useBooking: vi.fn(),
}));

vi.mock("../../src/utils/useStateObject", () => ({
  useStateContext: vi.fn(),
}));

const mockFilm = {
  id: 1,
  title: "Inception",
  duration_minutes: 148,
  genre: "Sci-Fi",
  release_year: 2010,
  age_limit: 15,
  description: "A thief who steals corporate secrets through the use of dream-sharing technology.",
  language: "English",
  poster_url: "inception.jpg",
  actors: ["Leonardo DiCaprio"]
};

const today = new Date().toLocaleDateString('sv-SE');
const mockShowings = [
  { id: 101, film_id: 1, hall_id: 1, start_time: today + "T18:00:00", hall_name: "Stora Salongen" }
];

describe("FilmDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLoaderData).mockReturnValue({ film: mockFilm, showings: mockShowings });
    vi.mocked(useBooking).mockReturnValue({
      setFilm: vi.fn(),
      setShowing: vi.fn(),
      film: null,
      showing: null,
      tickets: { adult: 0, child: 0, senior: 0 },
      ticketPrices: [],
      selectedSeats: [],
      setTickets: vi.fn(),
      setTicketPrices: vi.fn(),
      setSelectedSeats: vi.fn(),
      clearBooking: vi.fn(),
    });
    vi.mocked(useStateContext).mockReturnValue([{ bwImages: false }, vi.fn()]);
  });

  it("renders film details correctly", () => {
    render(
      <MemoryRouter>
        <FilmDetailsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText(/A thief who steals corporate secrets/)).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
  });

  it("renders showtimes for the selected date", () => {
    render(
      <MemoryRouter>
        <FilmDetailsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("Stora Salongen")).toBeInTheDocument();
  });

  it("shows 404 when film is not found", () => {
    vi.mocked(useLoaderData).mockReturnValue({ film: null, showings: [] });
    
    render(
      <MemoryRouter>
        <FilmDetailsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/404/)).toBeInTheDocument();
  });
});
