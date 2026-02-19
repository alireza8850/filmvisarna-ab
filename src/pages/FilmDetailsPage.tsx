import type Film from "../interfaces/Film";
import { Row, Col } from "react-bootstrap";
import { Link, useLoaderData } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import Image from "../parts/Image";
import filmsLoader from "../utils/FilmsLoader";


FilmDetailsPage.route = {
  path: "/films/:id",
  parent: "/",
  loader: filmsLoader,
};

export default function FilmDetailsPage() {
  const film = useLoaderData().film as Film;

  // if no film found, show 404
  if (!film) {
    return <NotFoundPage />;
  }

  const {
    id,
    title,
    duration_minutes,
    genre,
    release_year,
    age_limit,
    description,
    language,
    poster_url,
    trailer_url,
    created_at
  } = film;

  return (
    <article className="film-details">
      <Row>
        <Col>
          <h2 className="text-primary">{title}</h2>
          <Image
            src={"/images/filmss/" + id + ".jpg"}
            alt={"Poster image of the film " + title + "."}
          />
          {description.split("\n").map((x, i) => (
            <p key={i}>{x}</p>
          ))}
        </Col>
      </Row>

    </article>
  );
}
