import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";


export default function FilmCard({ film }: { film: Film }) {
  return (
    <div className="film-card">
      <Link className="film-card__link" to={`/films/${film.id}`}>
        <div className="film-card__image-wrapper">
          <img
            className="film-card__image"
            src={"/images/" + film.poster_url}
            alt={film.title}
          />
        </div>
        <div className="film-card__info">
          <span className="film-card__title">{film.title}</span>
          <span className="film-card__genre">{film.genre}</span>
        </div>
      </Link>
    </div>
  );
} 