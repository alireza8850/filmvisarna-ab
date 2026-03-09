import type Film from "../interfaces/Film";
import { Row, Col, Accordion, Modal } from "react-bootstrap";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useState } from "react";
import { useStateContext } from "../utils/useStateObject";
import NotFoundPage from "./NotFoundPage";
import Image from "../parts/Image";
import filmsLoader from "../utils/FilmsLoader";
import { useBooking } from "../utils/BookingContext";



FilmDetailsPage.route = {
  path: "/films/:id",
  parent: "/",
  loader: filmsLoader,
};

export default function FilmDetailsPage() {
  const navigate = useNavigate();
  const [{ bwImages }] = useStateContext();
  const { film, showings: allShowings } = useLoaderData() as { film: Film, showings: any[] };
  const { setFilm, setShowing } = useBooking();
  const [selectedShowingId, setSelectedShowingId] = useState<number | null>(null);

  // Default to today's date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toLocaleDateString('sv-SE');
  });
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // if no film found, show 404
  if (!film) {
    return <NotFoundPage />;
  }

  // Filter showtimes based on selected date
  const showtimes = Array.isArray(allShowings) ? allShowings.filter((showtime: any) => {
    if (!showtime.start_time) return false;
    const showtimeDate = showtime.start_time.split('T')[0];
    return showtimeDate === selectedDate;
  }) : [];

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
    actors
  } = film;

  const imageUrl = poster_url?.startsWith('http') 
    ? poster_url 
    : "/images/" + poster_url;

  return (
    <article className="film-details">
<<<<<<< feat/practice-SCSS

      <Row>
        <Col>
          <h2 className="film-details__title">{title}</h2>
          <span className="film-details__poster-and-trailer">
=======
      <Row className="justify-content-center">
        <Col xs={12}>
          <div className="film-details__poster-and-trailer position-relative">
>>>>>>> main
            <div className="film-details__poster-w">
              <img
                src={imageUrl}
                className={"film-details__poster" + (bwImages ? " bw" : "")}
                alt={"Poster image of the film " + title + "."}
              />
            </div>
            {film.trailer_url && (
              <button
                className="film-details__trailer-btn mb-3"
                onClick={() => setShowTrailerModal(true)}
              >
                Se Trailer
              </button>
            )}
          </div>
        </Col>

        <Col xs={12}>
          <h2 className="film-details__title">{title}</h2>
          {description?.split("\n").map((x, i) => (
            <p className="film-details__description" key={i}>
              {x}
            </p>
          ))}
        </Col>
      </Row>

      <section className="film-details__hero">
        <Image
          className="film-detail__hero-img"
          src={"/images/" + poster_url}
          alt={"Poster image of the film " + title + "."}
        />
        {film.trailer_url && (
          <button
            className="film-details__trailer-btn film-details__trailer-btn--overlay"
            onClick={() => setShowTrailerModal(true)}
          >
            SE TRAILER
          </button>
        )}
      </section>

      {/* DESCRIPTION */}
      <section className="film-details__description-section">
        {description?.split("\n").map((x, i) => (
          <p className="film-details__description" key={i}>
            {x}
          </p>
        ))}
      </section>

      <Accordion className="film-details__accordion mt-4" defaultActiveKey="0">
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
                <strong>Speltid:</strong> {duration_minutes} minuter
              </div>
              <div className="film-details__spec-item">
                <strong>Skådespelare:</strong>{" "}
                {actors && actors.length > 0
                  ? actors.join(", ")
                  : "Inga skådespelare tillgängliga"}
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
        <label
          htmlFor="date-filter"
          className="film-details__date-filter-label"
        >
          Välj datum
        </label>
        <input
          type="date"
          id="date-filter"
          className="film-details__date-filter-input"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedShowingId(null); // Reset selected showing when date changes
          }}
        />
      </div>

      <Row className="mt-3">
        <div className="film-details__legend">
          <div className="film-details__legend-item">
            <span className="film-details__legend-text">
              Tillgängliga tider
            </span>
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
        {showtimes.length > 0 ? (
          <>
            <Col xs={12}>
              <h4 className="film-details__showtimes-date-title mb-4">
                Visningar{" "}
                {new Date(selectedDate).toLocaleDateString("sv-SE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h4>
            </Col>
            {showtimes.map((showtime: any) => (
              <Col xs={6} sm={4} md={3} key={showtime.id} className="mb-3">
                <div
                  className={`film-details__showtime-box border rounded p-3 text-center ${selectedShowingId === showtime.id ? "film-details__showtime-box--selected" : ""}`}
                  onClick={() => setSelectedShowingId(showtime.id)}
                >
                  <div className="film-details__showtime-time">
                    {new Date(showtime.start_time).toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="film-details__showtime-hall">
                    {showtime.hall_name}
                  </div>
                </div>
              </Col>
            ))}
          </>
        ) : (
          <Col>
            <div className="film-details__no-showtimes text-center p-5 border rounded bg-light">
              <p className="mb-0">
                Tyvärr finns det inga visningar för{" "}
                {new Date(selectedDate).toLocaleDateString("sv-SE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                .
              </p>
              <p className="text-muted small mt-2">
                Prova att välja ett annat datum i kalendern ovan.
              </p>
            </div>
          </Col>
        )}
      </Row>

      <div className="film-details__continue-btn-wrapper">
        <button
          className="film-details__continue-btn"
          disabled={!selectedShowingId}
          onClick={() => {
            const selectedShowing = Array.isArray(allShowings)
              ? allShowings.find((s: any) => s.id === selectedShowingId)
              : null;
            if (selectedShowing) {
              setFilm(film);
              setShowing(selectedShowing);
              navigate(`/booking/${selectedShowingId}/tickets`);
            }
          }}
        >
          Gå vidare
        </button>
      </div>

      {/* Trailer Modal */}
      <Modal
        show={showTrailerModal}
        onHide={() => setShowTrailerModal(false)}
        size="xl"
        centered
        className="trailer-modal"
      >
        <Modal.Header closeButton className="trailer-modal__header">
          <Modal.Title>{title} - Trailer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="trailer-modal__body">
          {film.trailer_url && getYouTubeVideoId(film.trailer_url) && (
            <div className="trailer-modal__video-wrapper">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(film.trailer_url)}?autoplay=1&volume=50`}
                title={`${title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </article>
  );
}