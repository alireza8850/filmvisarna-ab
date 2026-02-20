import { Link } from "react-router-dom";
import type Film from "../interfaces/Film";

export default function HeroFilm({ film }: { film: Film }) {
  return (
    <div className="hero-film position-relative text-white mb-5">        
      <img
        className="w-100"
        style={{ maxHeight: "500px", objectFit: "cover" }}  
        src={film.poster_url}
        alt={film.title}    
      />  
      <div className="hero-film__overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4">
        <h1 className="text-white fw-bold">{film.title}</h1>

           
        <Link className="btn btn-danger mt-3" to={`/films/${film.id}`}>    
          Trailer
        </Link>
      </div>    
    </div>    
  );
} 
