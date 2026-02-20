import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";

export default function HeroFilm({ film }: { film: Film }) {
  return (
    <section className="hero-film">
      {/* --- The hero film will be shown as a big banner with the poster image as background --- */}

      <figure className="hero-media">
        <img className="hero-image" src={film.poster_url} alt={film.title} />
      </figure>
      <header className="hero-overlay">
        <div className="hero-top">
          {/* --- The button will be shown as a red button with white text --- */}
          <Link className="hero-trailer-btn" to={`/films/${film.id}`}>
            Trailer
          </Link>
          {/* --- We will show the genre as a badge, the title as a heading and a button to watch the trailer --- */}
          <span className="hero-genre">{film.genre}</span>
        </div>

        {/* --- The title will be shown as a big heading --- */}
        <h1 className="hero-title">{film.title}</h1>
      </header>
    </section>
  );
} 
