import type Film from "../interfaces/Film";
import type Showing from "../interfaces/Showing";
import { Row, Col, Accordion, Modal } from "react-bootstrap";
import { useNavigate, useLoaderData } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const film = useLoaderData().film as Film;
  const { setFilm, setShowing } = useBooking();
  const [selectedShowingIndex, setSelectedShowingIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Set default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [isLoadingShowings, setIsLoadingShowings] = useState(true);

  // Fetch real showings from the database
  useEffect(() => {
    if (!film?.id) return;

    setIsLoadingShowings(true);
    fetch(`/api/films/${film.id}/showings`)
      .then(res => res.json())
      .then(data => {
        setShowings(data || []);
        setIsLoadingShowings(false);
      })
      .catch(err => {
        console.error('Error fetching showings:', err);
        setShowings([]);
        setIsLoadingShowings(false);
      });
  }, [film?.id]);

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

  // Filter showings based on selected date
  const filteredShowings = showings.filter(showing => {
    const showingDate = new Date(showing.start_time).toISOString().split('T')[0];
    return showingDate === selectedDate;
  });

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

  return (
    <article className="film-details">
      <Row>
        <Col>
          <h2 className="film-details__title">{title}</h2>
          <span className="film-details__poster-and-trailer">
            <div className="film-details__poster-w">
              <Image
              src={"/images/" + poster_url}
              alt={"Poster image of the film " + title + "."}
            />
            </div> 
            {film.trailer_url && (
              <button
                className="film-details__trailer-btn"
                onClick={() => setShowTrailerModal(true)}
              >
                Se Trailer
              </button>
            )}
          </span>

          {description?.split("\n").map((x, i) => (
            <p className="film-details__description" key={i}>
              {x}
            </p>
          ))}
        </Col>
      </Row>


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
          <label htmlFor="date-filter" className="film-details__date-filter-label">
            Välj datum
          </label>
          <input
            type="date"
            id="date-filter"
            className="film-details__date-filter-input"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedShowingIndex(null); // Reset selected showing when date changes
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
          {isLoadingShowings ? (
            <Col className="text-center">
              <p>Laddar visningstider...</p>
            </Col>
          ) : filteredShowings.length === 0 ? (
            <Col className="text-center">
              <p>Inga visningstider tillgängliga för detta datum.</p>
            </Col>
          ) : (
            filteredShowings.map((showing, i) => {
              const startTime = new Date(showing.start_time);
              return (
                <Col xs={3} key={showing.id} className="mb-3">
                  <div
                    className={`film-details__showtime-box border rounded p-3 text-center ${selectedShowingIndex === i ? 'film-details__showtime-box--selected' : ''}`}
                    onClick={() => setSelectedShowingIndex(i)}
                  >
                    <div className="film-details__showtime-date">
                      {startTime.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="film-details__showtime-time">
                      {startTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="film-details__showtime-hall">
                      {showing.hall_name}
                    </div>
                  </div>
                </Col>
              );
            })
          )}
        </Row>


      <div className="film-details__continue-btn-wrapper">
        <button
          className="film-details__continue-btn"
          onClick={() => {
            if (selectedShowingIndex === null) {
              alert('Välj en tid först!');
              return;
            }

            // Save film to context
            setFilm(film);

            // Save the real showing from database to context
            const selectedShowing = filteredShowings[selectedShowingIndex];
            setShowing(selectedShowing);

            // Navigate to ticket picker with real showing ID
            navigate(`/booking/${selectedShowing.id}/tickets`);
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