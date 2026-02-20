import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";


export default function FilmCard({ film }: { film: Film }) {
  return (
    <div className="film-card">
      <Link className="film-card__link" to={`/films/${film.id}`}
      >
        <img className="film-card__image" src={film.poster_url} alt={film.title} />
      </Link>
      <h5 className="film-card__title">{film.title}</h5> 
      <p className="film-card__genre">{film.genre}</p>
    </div>
  );
} 