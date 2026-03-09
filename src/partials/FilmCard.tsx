import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";


export default function FilmCard({ film }: { film: Film }) {
  const imageUrl = film.poster_url.startsWith('http') 
    ? film.poster_url 
    : "/images/" + film.poster_url;

  return (
    <div className="film-card">
      <Link className="film-card__link" to={`/films/${film.id}`}>
        <div className="film-card__image-wrapper">
          <img
            className="film-card__image"
            src={imageUrl}
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