import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";


export default function FilmCard({ film }: { film: Film }) {
  return (
    <div className="film-card shadow-sm rounded p-2">
      <Link to={`/filmer/${film.id}`}>
        <img className="w-100 rounded" src={film.poster_url} alt={film.title} />
      </Link>
      <h5 className="mt-2">{film.title}</h5> 
      <p className="text-muted">{film.genre}</p>
      <Link className="btn btn-primary w-100 mt-2" to={`/films/${film.id}`}>
        Visa detaljer
      </Link>
    </div>
  );
} 