import type Film from "../interfaces/Film";
import { Row, Col, Card, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
//import { Link, useLoaderData } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import Image from "../parts/Image";
// import productsLoader from "../utils/productsLoader";


export default function FilmDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState<Film | null>(null);

  useEffect(() => {
    fetch(`/api/films/${id}`)
      .then((response) => response.json())
      .then((data) => setFilm(data));
  }, [id]);

  // if no film found, show 404
  if (!film) {
    return <NotFoundPage />;
  }


  return (
    <article className="container py-5 film-details-page">
      <Row className="align-items-start">
        {/* Poster */}
        <Col md={4}>
          <Card.Img
            // as ={Image}
            src={film.poster_url}
            alt={"Poster image of the film" + film.title}
            className="w-100 rounded shadow-sm"
          />
        </Col>

        {/* Film Details */}
        <Col md={8}>
          <h1 className="fw-bold mb-3">{film.title}</h1>
          <p className="text-muted mb-2"> {film.description}</p>
        </Col>

        {/* Trailer Button */}

        {/* Boka biljetter */}
        {/* Date selector + showtimes */}
      </Row>
    </article>
  );
}
