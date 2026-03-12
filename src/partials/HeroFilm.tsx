import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";

export default function HeroFilm({ film }: { film: Film }) {
  const imageUrl = film.poster_url.startsWith('http') 
    ? film.poster_url 
    : "/images/" + film.poster_url;

  return (
    <div className="hero-film-wrapper">
      <section className="hero-film">
        {/* --- The hero film will be shown as a big banner with the poster image as background --- */}

        <figure className="hero-media">
          <Link to={`/films/${film.id}`}>
            <img
              className="hero-image"
              src={imageUrl}
              alt={film.title}
            />
          </Link>
        </figure>
        <header className="hero-overlay">
          <div className="hero-top">
            <Link to={`/films/${film.id}`} className="hero-title-link">
              <h1 className="hero-title">{film.title}</h1>
            </Link>
            <br />
            <span className="btn-sections">
              <span className="hero-trailer-btn">
                Trailer
              </span>
              <span className="hero-genre">{film.genre}</span>
            </span>
          </div>

          {/* --- The title will be shown as a big heading --- */}
        </header>
      </section>
    </div>
  );
} 
