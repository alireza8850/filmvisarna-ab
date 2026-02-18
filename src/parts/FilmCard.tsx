import type Film from "../interfaces/Film";
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col } from "react-bootstrap";
// import Image from "./Image";

export default function FilmCard({
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
  created_at,
}: Film) {

  const navigate = useNavigate();
  return (
    <Card
      className="mb-4 border-0"
      role="button" /*sets the cursor to pointer*/
      onClick={() => navigate("/films/" + id)}
    >
      <Card.Body as={Row}>
        <Col md={4}>
          <Card.Img
            as={Image}
            src={poster_url}
            alt={"Poster image of the film " + title + "."} 
            className="w-100 rounded"
          />
        </Col>
        <Col md={8}>
          <Card.Title className="fs-3 fw-bold">{title}</Card.Title>
          <Card.Text className="mb-2 text-muted">
            {genre} | {release_year} | {duration_minutes} min | Age limit: {age_limit}+
          </Card.Text>
          <Card.Text className="mb-3">{description?.slice(0, 120)}...</Card.Text>
          <button className="btn btn-primary">Visa detaljer</button>
        </Col>
      </Card.Body>
    </Card>
  );
}
