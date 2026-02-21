import type Film from "../interfaces/Film";
import { Row, Col } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
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
    id: _id,
    title,
    duration_minutes: _duration_minutes,
    genre: _genre,
    release_year: _release_year,
    age_limit: _age_limit,
    description,
    language: _language,
    poster_url,
    trailer_url: _trailer_url,
    is_featured: _is_featured,
    created_at: _created_at
  } = film;

  return (
      <article className="film-details">
        <Row>
          <Col>
            <h2 className="film-details__title">{title}</h2>
            <Image
                src={poster_url}
                alt={"Poster image of the film " + title + "."}
            />
            {description.split("\n").map((x, i) => (
                <p className="film-details__description" key={i}>{x}</p>
            ))}
          </Col>
        </Row>

        <Row className="film-details__showtimes mt-4">
          {[...Array(8)].map((_, i) => (
              <Col xs={3} key={i} className="mb-3">
                <div className="film-details__showtime-box border rounded p-3 text-center">
                  —
                </div>
              </Col>
          ))}
        </Row>
      </article>
  );
}