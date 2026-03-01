//import { Link } from "react-router-dom";
//import "./FilmCard.css";
import { useEffect, useState } from "react";
import type Film from "../interfaces/Film";
import HeroFilm from "../partials/HeroFilm";
import FilmCard from "../partials/FilmCard";

LandedPageFilms.route = {
  path: "/",
  menuLabel: "Filmer",
  index: 2,
};



export default function LandedPageFilms() {

  const [films, setFilms] = useState<Film[]>([]);
  const [featuredFilms, setFeaturedFilms] = useState<Film | null>(null);

  async function GetFilms() {
    const results = await (await fetch("/api/films")).json();
    setFilms(results);
    const hero = results.find((film: Film) => film.is_featured === true);
    setFeaturedFilms(hero || null);
  }
  useEffect(() => {
    GetFilms();
  }, []);

  return (
    <article className="container mt-4">

      {/* --- Here we will show the featured film as a hero section --- */}

      {featuredFilms && <HeroFilm film={featuredFilms} />}

      {/* --- Here we will show the rest of the films as cards --- */}
      <div className="row mt-5">
        {films.filter(film => film.id !== featuredFilms?.id).map((film) => (
          <div key={film.id} className="col-md-3 mb-4">
            <FilmCard film={film} />
          </div>
        ))}
      </div>
    </article>
  );
}