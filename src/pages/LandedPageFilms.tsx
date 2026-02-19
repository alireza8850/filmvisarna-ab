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
