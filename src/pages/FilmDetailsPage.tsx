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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Set default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // if no film found, show 404
  if (!film) {
    return <NotFoundPage />;
  }

  // Generate mock showtimes for development - each film gets unique times based on film ID
  const generateAllShowtimes = (): Array<{ time: Date; hall: string }> => {
    const showtimes: Array<{ time: Date; hall: string }> = [];
    const today = new Date();

    // Different time slots for variety
    const timeSlots = [
      ['10:00', '13:00', '15:30', '18:00', '20:30'],
      ['10:30', '11:00', '13:00', '16:30', '18:00', '21:30'],
      ['11:00', '13:00', '15:30', '18:00', '20:00'],
      ['11:30', '13:00', '15:30', '18:00', '22:30'],
      ['10:00', '11:00', '13:00', '15:30', '18:00', '21:00']
    ];

    // Use film ID to pick a time slot pattern
    const filmId = film.id || 1;
    const times = timeSlots[filmId % timeSlots.length];

    // Generate showtimes for next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);

      // Add 3-4 times per day depending on film popularity
      const timesPerDay = (filmId % 2 === 0) ? 4 : 3;

      for (let i = 0; i < timesPerDay && i < times.length; i++) {
        const time = times[i];
        const [hours, minutes] = time.split(':');
        const showtime = new Date(date);
        showtime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Assign hall based on time
        let hall = '';
        if (time === '13:00' || time === '18:00') {
          hall = 'Stora salongen';
        } else if (time === '11:00' || time === '15:30') {
          hall = 'Lilla salongen';
        } else {
          // For other times, alternate between halls
          hall = i % 2 === 0 ? 'Stora salongen' : 'Lilla salongen';
        }

        showtimes.push({ time: showtime, hall });
      }
    }

    return showtimes;
  };

  const allShowtimes = generateAllShowtimes();

  // Filter showtimes based on selected date
  const showtimes = allShowtimes.filter(showtime => {
    const showtimeDate = showtime.time.toISOString().split('T')[0];
    return showtimeDate === selectedDate;
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
                onClick={() => {
                  // Ensure the URL is properly formatted
                  const url = film.trailer_url.startsWith('http')
                    ? film.trailer_url
                    : `https://${film.trailer_url}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
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
              setSelectedTime(null); // Reset selected time when date changes
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
          {showtimes.map((showtime, i) => (
              <Col xs={3} key={i} className="mb-3">
                <div
                  className={`film-details__showtime-box border rounded p-3 text-center ${selectedTime === i ? 'film-details__showtime-box--selected' : ''}`}
                  onClick={() => setSelectedTime(i)}
                >
                  <div className="film-details__showtime-date">
                    {showtime.time.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="film-details__showtime-time">
                    {showtime.time.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="film-details__showtime-hall">
                    {showtime.hall}
                  </div>
                </div>
              </Col>
          ))}
        </Row>


      <div className="film-details__continue-btn-wrapper">
        <button className="film-details__continue-btn">Gå vidare</button>
      </div>
    </article>
  );
}