import { useLoaderData } from "react-router-dom";
import type Hall from "../interfaces/Hall";
import hallLoader from "../utils/HallLoader";
import "/sass/_hall.scss";

const HALL_IMAGES: Record<number, { hallImg: string; audioImg: string }> = {
  1: {
    hallImg:  "/images/halls/hall1.png",   
    audioImg: "/images/halls/audio1.png",
  },
  2: {
    hallImg:  "/images/halls/hall2.png",
    audioImg: "/images/halls/audio2.png",
  },
};

HallDesPage.route = {
  path: "/salonger",
  menuLabel: "Om oss",
  index: 5,
  loader: hallLoader,
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
        {halls.map((hall, index) => {
          const images = HALL_IMAGES[hall.id];

          return (
            <div key={hall.id}>
              <article className="hall-card">

                <img
                  className="hall-card__hero-img"
                  src={images?.hallImg}
                  alt={hall.hall_name}
                  onError={(e) => {
                    console.error("❌ Missing:", (e.target as HTMLImageElement).src);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />

                <div className="hall-card__body">
                  <h2 className="hall-card__name">{hall.hall_name}</h2>
                  <p className="hall-card__description">{hall.hall_description}</p>
                </div>

                <div className="hall-card__audio">
                  <img
                    className="hall-card__audio-img"
                    src={images?.audioImg}
                    alt={hall.audio_name}
                    onError={(e) => {
                      console.error("❌ Missing:", (e.target as HTMLImageElement).src);
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <h3 className="hall-card__audio-name">{hall.audio_name}</h3>
                  <p className="hall-card__audio-description">
                    {hall.audio_description}
                  </p>
                </div>

                <div className="hall-card__extras">
                  <div className="hall-card__extra-item">
                    <div className="hall-card__extra-icon">🍿</div>
                    <h4 className="hall-card__extra-name">{hall.food_name}</h4>
                    <p className="hall-card__extra-description">{hall.food_description}</p>
                  </div>
                  <div className="hall-card__extra-item">
                    <div className="hall-card__extra-icon">🕶️</div>
                    <h4 className="hall-card__extra-name">{hall.glasses_name}</h4>
                    <p className="hall-card__extra-description">{hall.glasses_description}</p>
                  </div>
                </div>

              </article>

              {index < halls.length - 1 && <div className="hall-divider" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}