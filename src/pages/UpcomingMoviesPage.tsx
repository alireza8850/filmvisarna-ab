import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUpcomingMovies, getImageUrl, type TMDBMovie } from "../utils/tmdbService";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import type Film from "../interfaces/Film";

UpcomingMoviesPage.route = {
  path: "/upcoming",
  menuLabel: "Kommande Filmer",
  index: 4,
};

export default function UpcomingMoviesPage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoviesAndExistingFilms = async () => {
      try {
        setLoading(true);
        // Fetch existing movies from our backend to filter them out
        const res = await fetch("/api/films");
        if (!res.ok) throw new Error("Failed to fetch existing films");
        const existingFilms: Film[] = await res.json();
        const existingTitles = new Set(existingFilms.map(f => f.title.toLowerCase().trim()));

        let allFilteredMovies: TMDBMovie[] = [];
        let currentPage = 1;
        const targetCount = 20;

        // Keep fetching more pages until we have at least 20 or reach a limit
        while (allFilteredMovies.length < targetCount && currentPage <= 10) {
          const upcomingData = await getUpcomingMovies(currentPage);
          
          if (upcomingData.length === 0) break; // No more movies available

          const filteredFromPage = upcomingData.filter(m => !existingTitles.has(m.title.toLowerCase().trim()));
          
          // Avoid duplicate movies if TMDB returns same movie across pages (rare but possible)
          const currentIds = new Set(allFilteredMovies.map(m => m.id));
          const newUniqueMovies = filteredFromPage.filter(m => !currentIds.has(m.id));
          
          allFilteredMovies = [...allFilteredMovies, ...newUniqueMovies];
          
          currentPage++;
        }
        
        setMovies(allFilteredMovies);
      } catch (err) {
        setError("Kunde inte hämta kommande filmer. Försök igen senare.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoviesAndExistingFilms();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-5">
        {error}
      </Alert>
    );
  }

  return (
    <article className="container mt-4">
      <h2 className="text-white mb-4">KOMMANDE FILMER</h2>
      <Row>
        {movies.map((movie) => (
          <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <div className="film-card">
              <Link className="film-card__link" to={`/upcoming/${movie.id}`}>
                <div className="film-card__image-wrapper">
                  <img
                    className="film-card__image"
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                  />
                </div>
                <div className="film-card__info">
                  <span className="film-card__title">{movie.title}</span>
                  <span className="film-card__genre">Premiär: {movie.release_date}</span>
                </div>
              </Link>
            </div>
          </Col>
        ))}
      </Row>
    </article>
  );
}
