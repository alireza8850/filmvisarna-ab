import type Film from "../interfaces/Film";
import { Row, Col, Accordion } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import { useState } from "react";
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
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  // if no film found, show 404
  if (!film) {
    return <NotFoundPage />;
  }

  const {
    id: _id,
    title,
    duration_minutes,
    genre,
    release_year,
    age_limit,
    description,
    language,
    poster_url,
    trailer_url: _trailer_url,
    is_featured: _is_featured,
    created_at,
    actors
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

      <Accordion className="film-details__accordion mt-4">
        <Accordion.Item eventKey="0" className="film-details__accordion-item">
          <Accordion.Header className="film-details__accordion-header">
            Film Specifikationer
          </Accordion.Header>
          <Accordion.Body className="film-details__accordion-body">
            <div className="film-details__spec-list">
              <div className="film-details__spec-item">
                <strong>Åldersgräns:</strong> {age_limit} år
              </div>
              <div className="film-details__spec-item">
                <strong>Premiär:</strong> {release_year}
              </div>
              <div className="film-details__spec-item">
                <strong>Datum:</strong> {new Date(created_at).toLocaleDateString('sv-SE')}
              </div>
              <div className="film-details__spec-item">
                <strong>Speltid:</strong> {duration_minutes} minuter
              </div>
              <div className="film-details__spec-item">
                <strong>Skådespelare:</strong> {actors && actors.length > 0 ? actors.join(', ') : 'Inga skådespelare tillgängliga'}
              </div>
              <div className="film-details__spec-item">
                <strong>Språk:</strong> {language}
              </div>
              <div className="film-details__spec-item">
                <strong>Genre:</strong> {genre}
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className="film-details__date-filter mt-4">
        <label htmlFor="date-time-filter" className="film-details__date-filter-label">
          Välj datum
        </label>
        <input
          type="datetime-local"
          id="date-time-filter"
          className="film-details__date-filter-input"
        />
      </div>

      <Row className="mt-3">
        <div className="film-details__legend">
          <div className="film-details__legend-item">
            <span className="film-details__legend-text">Tillgängliga tider</span>
            <span className="film-details__legend-box film-details__legend-box--available"></span>
          </div>
          <div className="film-details__legend-item">
            <span className="film-details__legend-text">Fullbokad</span>
            <span className="film-details__legend-box film-details__legend-box--full"></span>
          </div>
          <div className="film-details__legend-item">
            <span className="film-details__legend-text">Vald tid</span>
            <span className="film-details__legend-box film-details__legend-box--selected"></span>
          </div>
        </div>
      </Row>

      <Row className="film-details__showtimes">
        {[...Array(8)].map((_, i) => (
          <Col xs={3} key={i} className="mb-3">
            <div
              className={`film-details__showtime-box border rounded p-3 text-center ${selectedTime === i ? 'film-details__showtime-box--selected' : ''}`}
              onClick={() => setSelectedTime(i)}
            >
              —
            </div>
          </Col>
        ))}
      </Row>

      <div className="film-details__continue-btn-wrapper">
        <button className="film-details__continue-btn">
          Gå vidare
        </button>
      </div>
    </article>
  );
}