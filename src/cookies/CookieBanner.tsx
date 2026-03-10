import { useCookieConsent } from "./CookieContext";

export default function CookieBanner() {
  const { consent, setConsent, openSettings } = useCookieConsent();

  //if allready accepted
  if (consent !== null) return null;

  return (
    <div className="cookie-banner">
      <h4>Vi använder cookies</h4>

      <p>
        Vi använder nödvändiga tekniska cookies för inloggning och säkerhet. Vi
        använder även (snart) statistik‑cookies som kan ligga till grund för
        marknadsföring. Du kan välja att inte godkänna statistik‑cookies.
      </p>

      <div className="cookie-buttons">
        <button
          className="btn-accept-all"
          onClick={() =>
            setConsent({
              necessary: true,
              statistics: true,
            })
          }
        >
          Acceptera alla cookies
        </button>

        <button
          className="btn-necessary-only"
          onClick={() =>
            setConsent({
              necessary: true,
              statistics: false,
            })
          }
        >
          Endast nödvändiga
        </button>

        <button
          className="btn-reject"
          onClick={() =>
            setConsent({
              necessary: true,
              statistics: false,
            })
          }
        >
          Avvisa statistik‑cookies
        </button>

        <button className="btn-settings" onClick={openSettings}>
          Inställningar
        </button>
      </div>
    </div>
  );
}
