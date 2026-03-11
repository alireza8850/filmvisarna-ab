import { useLoaderData } from "react-router-dom";
import type Hall from "../interfaces/Hall";
import hallLoader from "../utils/HallLoader";
import "/sass/_hall.scss";

const HALL_IMAGES: Record<number, { hallImg: string; audioImg: string }> = {
  1: {
    hallImg:  "/public/Hallimage/bild 1.png",
    audioImg: "/public/Hallimage/bild 2.png",
  },
  2: {
    hallImg:  "/public/Hallimage/bild 3.png",
    audioImg: "/public/Hallimage/bild 4.png",
  },
};

HallDesPage.route = {
  path: "/salonger",
  menuLabel: "Våra Salonger",
  index: 5,
  loader: hallLoader,
};

export default function HallDesPage() {
  const { halls } = useLoaderData() as { halls: Hall[] };

  return (
    <div className="hall-page">

      {/* Page title */}
      <section className="hall-hero">
        <h1>Våra <span>Salonger</span></h1>
        <div className="hall-hero__line" />
      </section>

      {/* Hall cards */}
      <div className="hall-list">
        {halls.map((hall, index) => {
          const images = HALL_IMAGES[hall.id];

          return (
            <div key={hall.id}>
              <article className="hall-card">

                {/* Hall image */}
                <img
                  className="hall-card__hero-img"
                  src={images?.hallImg}
                  alt={hall.hall_name}
                />

                {/* Name + description */}
                <div className="hall-card__body">
                  <h2 className="hall-card__name">{hall.hall_name}</h2>
                  <p className="hall-card__description">{hall.hall_description}</p>
                </div>

                {/* Audio image + info */}
                <div className="hall-card__audio">
                  <img
                    className="hall-card__audio-img"
                    src={images?.audioImg}
                    alt={hall.audio_name}
                  />
                  <h3 className="hall-card__audio-name">{hall.audio_name}</h3>
                  <p className="hall-card__audio-description">
                    {hall.audio_description}
                  </p>
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