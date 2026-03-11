import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandedPageFilms from "../../src/pages/LandedPageFilms";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFilms = [
  { id: 1, title: "Action Movie", genre: "Action", description: "Exciting", is_featured: true, release_year: 2025, poster_url: "action.jpg" },
  { id: 2, title: "Romantic Comedy", genre: "Romance", description: "Funny", is_featured: false, release_year: 2025, poster_url: "romcom.jpg" },
];

describe("LandedPageFilms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/films") {
        return Promise.resolve({
          ok: true,
          json: async () => mockFilms,
        });
      }
      if (url === "/api/showings") {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.reject("Unknown URL");
    });
  });

  it("renders film list and search bar", async () => {
    render(
      <MemoryRouter>
        <LandedPageFilms />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Sök filmer...")).toBeInTheDocument();
      expect(screen.getByText("Action Movie")).toBeInTheDocument();
      expect(screen.getByText("Romantic Comedy")).toBeInTheDocument();
    });
  });

  it("filters films by search query", async () => {
    render(
      <MemoryRouter>
        <LandedPageFilms />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Action Movie")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText("Sök filmer...");
    fireEvent.change(searchInput, { target: { value: "Romantic" } });

    // Action Movie is featured and thus rendered in HeroFilm if no filtering.
    // When filtering, HeroFilm is hidden and only cards are shown.
    expect(screen.queryByText("Action Movie")).not.toBeInTheDocument();
    expect(screen.getByText("Romantic Comedy")).toBeInTheDocument();
  });

  it("filters films by genre", async () => {
    render(
      <MemoryRouter>
        <LandedPageFilms />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText("Filter")).toBeInTheDocument());

    const filterBtn = screen.getByText("Filter");
    fireEvent.click(filterBtn);

    const romanceFilter = await screen.findByText("Romance", { selector: ".filter-menu-item" });
    fireEvent.click(romanceFilter);

    await waitFor(() => {
      expect(screen.queryByText("Action Movie")).not.toBeInTheDocument();
      expect(screen.getByText("Romantic Comedy")).toBeInTheDocument();
    });
  });
});
