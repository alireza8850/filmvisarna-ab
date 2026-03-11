import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";

export default function HeroFilm({ film }: { film: Film }) {
  const imageUrl = film.poster_url.startsWith('http') 
    ? film.poster_url 
    : "/images/" + film.poster_url;

  return (
    <div className="hero-film-wrapper">
      <Link to={`/films/${film.id}`} className="hero-film-link">
        <section className="hero-film">
          {/* --- The hero film will be shown as a big banner with the poster image as background --- */}

          <figure className="hero-media">
            <img
              className="hero-image"
              src={imageUrl}
              alt={film.title}
            />
          </figure>
          <header className="hero-overlay">
            <div className="hero-top">
              <div className="hero-title-container">
                <h1 className="hero-title">{film.title}</h1>
              </div>
              <br />
              <span className="btn-sections">
                {/* --- The button will be shown as a red button with white text --- */}
                <span className="hero-trailer-btn">
                  Trailer
                </span>
                {/* --- We will show the genre as a badge, the title as a heading and a button to watch the trailer --- */}
                <span className="hero-genre">{film.genre}</span>
              </span>
            </div>

            {/* --- The title will be shown as a big heading --- */}
          </header>
        </section>
      </Link>
    </div>
  );
} 
