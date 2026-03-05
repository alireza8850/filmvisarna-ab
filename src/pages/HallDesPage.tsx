import { useLoaderData } from "react-router-dom";
import type { Hall } from "../interfaces/Hall";
import hallLoader from "../utils/hallLoader";
//import "../saas/hall.scss";

const IMG_BASE = "/images/halls/";

HallDesPage.route = {
  path: "/salonger",
  menuLabel: "Våra Salonger",
  index: 5,
  loader: hallLoader
};

export default function HallDesPage() {
  const { halls } = useLoaderData() as { halls: Hall[] };

  return (
    <div className="hall-page">

      <section className="hall-hero">
        <h1>Våra <span>Salonger</span></h1>
        <div className="hall-hero__line" />
      </section>

      <div className="hall-list">
        {halls.map((hall, index) => (
          <div key={hall.id}>
            <article className="hall-card">

              <img
                className="hall-card__hero-img"
                src={`${IMG_BASE}${hall.halls_image}`}
                alt={hall.hall_name}
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />

              <div className="hall-card__body">
                <h2 className="hall-card__name">{hall.hall_name}</h2>
                <p className="hall-card__description">{hall.hall_description}</p>
              </div>

              <div className="hall-card__audio">
                <img
                  className="hall-card__audio-img"
                  src={`${IMG_BASE}${hall.audio_image}`}
                  alt={hall.audio_name}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
                <h3 className="hall-card__audio-name">{hall.audio_name}</h3>
                <p className="hall-card__audio-description">
                  {hall.audio_description}
                </p>
              </div>

             

            </article>

            {index < halls.length - 1 && <div className="hall-divider" />}
          </div>
        ))}
      </div>
    </div>
  );
}