import { Link } from "react-router-dom";
//import "./FilmCard.css";
import { useEffect, useState } from "react";
import type Film from "../interfaces/Film";

LandedPageFilms.route = {
  path: "/",
  menuLabel: "Filmer",
  index: 2,
};

type FilmCardProps = {
  id: number; 
  title: string;
  image: string;
  categories?: string[];
  price?: number;
};

export default function LandedPageFilms({ id, title, image }: FilmCardProps) {
  const [films, setFilms] = useState([]);

  async function GetFilms() {
    const results = await (await fetch("/api/films")).json();
    setFilms(results);
  }
  useEffect(() => {
    GetFilms();
  }, []);

  return (
    <div className="film-card">
      <Link to={`/filmer/${id}`}>
        <img className="film-card__image" src={image} alt={title} />
      </Link>
      <button onClick={() => console.log(films)}>Log films</button>
      {
        films.map((film: any) => {
          
          return <div key={film.id}>
        <h4>{film.title}</h4> 
        </div>
      })} 
      
      <h3 className="film-card__title">{title}</h3>

      <Link className="film-card__button" to={`/bokning/${id}`}>
        Boka
      </Link>
    </div>
  );
}
