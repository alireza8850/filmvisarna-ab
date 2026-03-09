//import { Link } from "react-router-dom";
//import "./FilmCard.css";
import { useEffect, useState } from "react";
import type Film from "../interfaces/Film";
import HeroFilm from "../partials/HeroFilm";
import type Showing from "../interfaces/Showing";
import FilmCard from "../partials/FilmCard";

LandedPageFilms.route = {
  path: "/",
  menuLabel: "Filmer",
  index: 2,
};



export default function LandedPageFilms() {

  const [films, setFilms] = useState<Film[]>([]);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [featuredFilms, setFeaturedFilms] = useState<Film | null>(null );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Alla");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const availableFilters = [
    "Alla",
    "Idag",
    "Kommande",
    "Romance",
    "Barn & Familj",
    "Science fiction",
    "Thriller",
    "Klassiker",
  ];

async function GetFilms() {
    try {
      const filmsRes = await fetch("/api/films");
      const filmsData = await filmsRes.json();
      setFilms(filmsData);
      
      const hero = filmsData.find((film: Film) => film.is_featured === true);
      setFeaturedFilms(hero || null);

      const showingsRes = await fetch("/api/showings");
      if (showingsRes.ok) {
        const showingsData = await showingsRes.json();
        setShowings(showingsData);
      }
    } catch (error) {
      console.error("Fel vid hämtning av data:", error);
    }
  }
  useEffect(() => {
    GetFilms();
  }, []);
  const today = new Date().toISOString().split("T")[0];

  let displayFilms = films.filter((film) => {
    const searchWord = searchQuery.toLowerCase().replace(/\s+/g, "");
    const title = film.title.toLowerCase().replace(/\s+/g, "");
    const genre = (film.genre || "").toLowerCase().replace(/\s+/g, "");
    const desc = (film.description || "").toLowerCase().replace(/\s+/g, "");

    const matchesSearch =
      searchWord === "" ||
      title.includes(searchWord) ||
      genre.includes(searchWord) ||
      desc.includes(searchWord);
    let matchesFilter = true;
    if (selectedFilter !== "Alla") {
      const filmGenre = film.genre?.toLowerCase() || "";
      if (selectedFilter === "Barn & Familj") {
        matchesFilter = filmGenre.includes("barn") || filmGenre.includes("familj");
      } else if (selectedFilter === "Kommande") {
        matchesFilter = film.release_year >= 2026;
      } else if (selectedFilter === "Idag") {
        matchesFilter = showings.some(
          (showing) => showing.film_id === film.id && showing.start_time.startsWith(today)
        );
      } else {
        matchesFilter = filmGenre.includes(selectedFilter.toLowerCase());
      }
    }

    return matchesSearch && matchesFilter;
  });

  const isFiltering = searchQuery.trim() !== "" || selectedFilter !== "Alla";

  return (
    <article className="container mt-4">
      {/* --- FILTER & SEARCH --- */}
      <div className="film-filter-section">

        {/* Filter Dropdown */}
        <div className="filter-dropdown">
          <button
            className="filter-toggle-btn"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            Filter
            <i className={`bi bi-chevron-${isFilterOpen ? "up" : "down"}`}></i>
          </button>

          {isFilterOpen && (
            <div className="filter-menu">
              {availableFilters.map((filter) => (
                <div
                  key={filter}
                  className={`filter-menu-item${selectedFilter === filter ? " filter-menu-item--active" : ""}`}
                  onClick={() => {
                    setSelectedFilter(filter);
                    setIsFilterOpen(false);
                  }}
                >
                  {filter} {selectedFilter === filter && "✓"}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="film-search-bar">
          <i className="bi bi-search"></i>
          <input
            type="search"
            className="film-search-input"
            placeholder="Sök filmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>
      {/* --- Here we will show the featured film as a hero section --- */}

      {!isFiltering &&featuredFilms && <HeroFilm film={featuredFilms} />}

      {/* --- Here we will show the rest of the films as cards --- */}
      <div className="row mt-5">
    {displayFilms
          .filter((film) => isFiltering || film.id !== featuredFilms?.id)
          .map((film) => (
            <div key={film.id} className="col-md-3 mb-4">
              <FilmCard film={film} />
            </div>
          ))}

        {displayFilms.length === 0 && (
          <div className="col-12 text-center text-white mt-4">
            <h3 className="mb-3">Inga filmer hittades.</h3>
            <button
              className="btn btn-outline-light rounded-pill px-4 fw-bold"
              onClick={() => { setSearchQuery(""); setSelectedFilter("Alla"); }}
            >
              Rensa filter och visa alla filmer
            </button>
          </div>
        )}
      </div>

    </article>
  );
}