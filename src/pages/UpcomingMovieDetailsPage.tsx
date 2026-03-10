import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieDetails, getImageUrl, type TMDBMovieDetails } from "../utils/tmdbService";
import { useStateContext } from "../utils/useStateObject";
import { Row, Col, Spinner, Alert, Accordion, Modal, Button } from "react-bootstrap";

UpcomingMovieDetailsPage.route = {
  path: "/upcoming/:id",
};

export default function UpcomingMovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [{ bwImages }] = useStateContext();
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
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

  const handleRelease = async () => {
    if (!movie) return;
    if (!window.confirm(`Vill du verkligen flytta "${movie.title}" till "Nu på bio"?\n\nDetta kommer att ta bort den äldsta filmen och skapa nya visningar för denna film.`)) return;

    setReleasing(true);
    try {
      // Hämta åldersgräns och annat
      const seRelease = movie.release_dates?.results.find(r => r.iso_3166_1 === 'SE');
      const ageLimitStr = seRelease?.release_dates[0]?.certification || "0";
      const ageLimit = parseInt(ageLimitStr) || 0;

      const payload = {
        title: movie.title,
        duration_minutes: movie.runtime,
        genre: movie.genres.map(g => g.name).join(', '),
        release_year: parseInt(movie.release_date.split('-')[0]),
        age_limit: ageLimit,
        description: movie.overview,
        language: movie.spoken_languages[0]?.english_name || "Svenska",
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "default.jpg",
        trailer_url: movie.videos?.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key 
          ? `https://www.youtube.com/watch?v=${movie.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key}` 
          : "",
        actors: movie.credits?.cast.slice(0, 5).map(c => c.name) || []
      };

      const res = await fetch('/api/release-movie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await res.json();
        alert(`"${movie.title}" har nu flyttats till "Nu på bio"!`);
        navigate('/');
      } else {
        const errorText = await res.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error("Kunde inte parsa JSON-fel från servern:", errorText);
        }
        console.error("Release movie failed:", res.status, errorData);
        throw new Error(`Server svarade med status ${res.status}: ${errorData.error || errorText || "Okänt fel"}`);
      }
    } catch (err: any) {
      console.error("Catch block release movie:", err);
      alert(`Ett fel uppstod när filmen skulle släppas: ${err.message}`);
    } finally {
      setReleasing(false);
    }
  };

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
    <Row className="film-details__main-row">
      <Col md={5} lg={4}>
        <div className="film-details__poster-and-trailer position-relative">
          <div className="film-details__poster-w">
            <img
              src={getImageUrl(movie.poster_path)}
              className={"film-details__poster" + (bwImages ? " bw" : "")}
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
        </div>
      </Col>

      <Col md={7} lg={8}>
        <h2 className="film-details__main-title">{movie.title}</h2>
        <section className="film-details__description-section">
          {movie.overview?.split("\n").map((x, i) => (
            <p className="film-details__description" key={i}>
              {x}
            </p>
          ))}
        </section>
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
          onClick={(e) => {
            try {
              (e.target as HTMLInputElement).showPicker();
            } catch (err) {
              console.error("Picker not supported", err);
            }
          }}
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
            <div className="mt-4 pt-3 border-top">
              <p className="text-muted small mb-3">Administratörsverktyg (Demo):</p>
              <Button 
                variant="outline-primary" 
                onClick={handleRelease}
                disabled={releasing}
              >
                {releasing ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                Flytta till "Nu på bio"
              </Button>
            </div>
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
