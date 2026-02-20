import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";


export default function FilmCard({ film }: { film: Film }) {
  return (
    <div className="film-card shadow-sm rounded p-2">
      <Link className="film-card shadow-sm rounded p-2 text-decoration-none text-dark" style={{
        display: "block",
        cursor: "pointer"
      }} to={`/filmer/${film.id}`}
      >
        <img className="w-100 rounded" src={film.poster_url} alt={film.title} />
      </Link>
      <h5 className="mt-2">{film.title}</h5> 
      <p className="text-muted">{film.genre}</p>
    </div>
  );
} 