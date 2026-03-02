import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type CancelResponse from "../interfaces/CancelRespons";

CancellationPage.route = {
  path: "/cancel",
};

export default function CancellationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // To read the email and booking number from the link
  // we need useState to save the page status
  const [status, setStatus] = useState<"waiting" |"loading" | "success" | "error">(
    "waiting",
  );
  const [message, setMessage] = useState<string>("");

  // READING the email and the bookingNumber
  const bookingNumber = searchParams.get("booking");
  const email = searchParams.get("email");

  // validate link
  useEffect(() => {
    // first check if the link has a booking and an email
    if (!bookingNumber || !email) {
      setStatus("error");
      setMessage("Ogiltig avbokningslänk.");
      return;
    }
  }, [bookingNumber, email]);

  // function to execute the cancelation
    // Send a post to backend ==> Read the response ==> set and display the response
    // ==> change the page status depending on the response
    const cancelBooking = async () => {
      try {
        const response = await fetch("/api/bookings/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_number: bookingNumber,
            email: email,
          }),
        });

        const data: CancelResponse = await response.json();

        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage(data.message || "Bokningen har avbokats.");
        }
      } catch {
        setStatus("error");
        setMessage("Ett fel inträffade vid avbokningen.");
      }
    };
  
  // UI
  
  return (
    <article className="cancelation-page">
      <div className="cancelation-page__content">
        {status === "waiting" && (
          <>
            <h1 className="cancelation-page__title">Avboka din boking</h1>
            <p className="cancelation-page__message">
              Vill du verkligen avboka denna bokning?
            </p>
            <div className="cancelation-page__buttons">
              <button className="cancelation-page__btnAvboka" onClick={cancelBooking}>
                AVBOKA
              </button>
              <button
                className="cancelation-page__buttonHome"
                onClick={() => navigate("/")}
              >
                Gå till start sidan
              </button>
            </div>
          </>
        )}

        {status === "loading" && (
          <>
            <h1 className="cancelation-page__title">Avbokar...</h1>
            <p className="cancelation-page__message">
              Var god vänta medan vi behandlar din avbokning.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="cancelation-page__title">Avbokad!</h1>
            <p className="cancelation-page__message">{message}</p>
            <button
              className="cancelation-page__button"
              onClick={() => navigate("/")}
            >
              Gå till start sidan
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="cancelation-page__title">Avbokning misslyckades</h1>
            <p className="cancelation-page__message">{message}</p>
            <button
              className="cancelation-page__button"
              onClick={() => navigate("/")}
            >
              Gå till start sidan
            </button>
          </>
        )}
      </div>
    </article>
  );

}
