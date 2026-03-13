import { Link, useLocation } from "react-router-dom";

NotFoundPage.route = {
  path: "*",
};

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <>
      <h2>Sidan hittades inte: 404</h2>
      <p>
        Vi är ledsna, men det verkar inte finnas någon sida på denna webbplats
        som matchar webbadressen:
      </p>
      <p>
        <strong>{location.pathname.slice(1)}</strong>
      </p>
      <p>
        Vänligen <Link to="/" style={{ color: "white" }}>gå till startsidan</Link> istället.
      </p>
    </>
  );
}
