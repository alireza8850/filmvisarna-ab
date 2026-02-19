import { Link } from "react-router-dom";
import "./FilmCard.css";

type FilmCardProps = {
  id: number;
  title: string;
  image: string;
  categories?: string[];
  price?: number;
};

export default function FilmCard({ id, title, image }: FilmCardProps) {
  return (
    <div className="film-card">
      <Link to={`/filmer/${id}`}>
        <img className="film-card__image" src={image} alt={title} />
      </Link>

      <h3 className="film-card__title">{title}</h3>

      <Link className="film-card__button" to={`/bokning/${id}`}>
        Boka
      </Link>
    </div>
  );
}


/*

.film-card {
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 12px;
    background: white;
}

.film-card__image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 10px;
}

.film-card__title {
    margin: 10px 0;
}

.film-card__button {
    display: inline-block;
    padding: 8px 12px;
    background: black;
    color: white;
    text-decoration: none;
    border-radius: 8px;
}


*/