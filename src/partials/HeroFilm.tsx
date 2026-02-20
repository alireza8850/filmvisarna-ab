import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";

export default function HeroFilm({ film }: { film: Film }) {
  return (
    <div className="hero-film">
      {/* --- The hero film will be shown as a big banner with the poster image as background --- */}
      <img
        className="hero-image"
        src={film.poster_url}
        alt={film.title}
      />
      <div className="hero-overlay">
        {/* --- We will show the genre as a badge, the title as a heading and a button to watch the trailer --- */}
        <span className="hero-genre">
          {film.genre}
        </span>

        {/* --- The title will be shown as a big heading --- */}
        <h1 className="hero-title">{film.title}</h1>

        {/* --- The button will be shown as a red button with white text --- */}
        <Link
          className="hero-trailer-btn"
          to={`/films/${film.id}`}
        >
          Trailer
        </Link>
      </div>
    </div>
  );
} 
