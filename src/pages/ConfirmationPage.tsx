import { useNavigate } from "react-router-dom";

ConfirmationPage.route = {
  path: "/confirmation",
};

export default function ConfirmationPage() {
  const navigate = useNavigate();

  return (
    <article className="confirmation-page">
      <div className="confirmation-page__curtain confirmation-page__curtain--left"></div>
      <div className="confirmation-page__curtain confirmation-page__curtain--right"></div>
      <div className="confirmation-page__content">
        <h1 className="confirmation-page__title">Tack!</h1>
        <p className="confirmation-page__message">
          Din bokning har bekräftats och en bekräftelse<br />
          samt kvitto har skickats till din e-post.
       </p>
        <div className="cancelation-page__buttons">
        <button
          className="confirmation-page__button"
          onClick={() => navigate("/my-bookings")}
        >
          Se mina bokningar
        </button>
         <button
            className="cancelation-page__buttonHome"
          onClick={() => navigate("/")}
        >
            Gå till start sidan
      </button>
        </div>
      </div>
    </article>
  );
}
