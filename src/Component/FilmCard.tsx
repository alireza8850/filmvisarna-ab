import { Link } from "react-router-dom";
import "./FilmCard.css";

export interface Film {
    id: number;
    title: string;
    posterUrl: string;
    ageLimit: number;
}

type FilmCardProps = {
    film: Film;
};

export default function FilmCard({ film }: FilmCardProps) {
    return (
        <div className="film-card">

            <Link to={`/filmer/${film.id}`}>
                <img
                    className="film-card__image"
                    src={film.posterUrl}
                    alt={film.title}
                />
            </Link>

            <h2 className="film-card__title">
                {film.title}
            </h2>

            <p className="film-card__age">
                Åldersgräns: {film.ageLimit}
            </p>

            <Link
                className="film-card__button"
                to={`/bokning/${film.id}`}
            >
                Boka
            </Link>

        </div>
    );
}