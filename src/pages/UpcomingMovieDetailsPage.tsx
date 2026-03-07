import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails, getImageUrl, type TMDBMovieDetails } from "../utils/tmdbService";
import { Row, Col, Spinner, Alert, Accordion, Modal } from "react-bootstrap";
import Image from "../parts/Image";

UpcomingMovieDetailsPage.route = {
  path: "/upcoming/:id",
};

export default function UpcomingMovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toLocaleDateString('sv-SE');
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await getMovieDetails(id);
        setMovie(data);
      } catch (err) {
        setError("Kunde inte hämta information om filmen.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <Alert variant="danger" className="mt-5">
        {error || "Film hittades inte."}
      </Alert>
    );
  }

  const trailer = movie.videos?.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
  const trailerKey = trailer?.key;

  // Hämta åldersgräns för Sverige (SE) om tillgängligt
  const seRelease = movie.release_dates?.results.find(r => r.iso_3166_1 === 'SE');
  const ageLimit = seRelease?.release_dates[0]?.certification || "Ej angivet";
  const actors = movie.credits?.cast.slice(0, 5).map(c => c.name).join(', ') || "Inga skådespelare tillgängliga";

  return (
    <article className="film-details">
      <Row>
        <Col>
          <h2 className="film-details__title">{movie.title}</h2>
          <span className="film-details__poster-and-trailer">
            <div className="film-details__poster-w">
              <Image
                src={getImageUrl(movie.poster_path)}
                alt={"Poster image of the film " + movie.title + "."}
              />
            </div>
            {trailerKey && (
              <button
                className="film-details__trailer-btn"
                onClick={() => setShowTrailerModal(true)}
              >
                Se Trailer
              </button>
            )}
          </span>

          {movie.overview?.split("\n").map((x, i) => (
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
                <strong>Åldersgräns:</strong> {ageLimit} {ageLimit !== "Ej angivet" ? "år" : ""}
              </div>
              <div className="film-details__spec-item">
                <strong>Premiär:</strong> {movie.release_date}
              </div>
              <div className="film-details__spec-item">
                <strong>Speltid:</strong> {movie.runtime} minuter
              </div>
              <div className="film-details__spec-item">
                <strong>Skådespelare:</strong> {actors}
              </div>
              <div className="film-details__spec-item">
                <strong>Språk:</strong> {movie.spoken_languages.map(l => l.english_name).join(', ')}
              </div>
              <div className="film-details__spec-item">
                <strong>Genre:</strong> {movie.genres.map(g => g.name).join(', ')}
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
        <Col>
          <div className="film-details__no-showtimes text-center p-5 border rounded bg-light">
            <p className="mb-0">Filmen har premiär {movie.release_date}</p>
          </div>
        </Col>
      </Row>

      <Modal
        show={showTrailerModal}
        onHide={() => setShowTrailerModal(false)}
        size="xl"
        centered
        className="trailer-modal"
      >
        <Modal.Header closeButton className="trailer-modal__header">
          <Modal.Title>{movie.title} - Trailer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="trailer-modal__body">
          {trailerKey && (
            <div className="trailer-modal__video-wrapper">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&volume=50`}
                title={`${movie.title} Trailer`}
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
