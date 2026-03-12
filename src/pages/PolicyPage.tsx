import { Row, Col } from "react-bootstrap";
import "/sass/_policy.scss";

PolicyPage.route = {
  path: "/policy",
};

export default function PolicyPage() {
  return (
    <div className="policy-page">
      <div className="policy-wrap">
        <Row>
          <Col>
            <h1 className="policy-title">Policy</h1>
          </Col>
        </Row>

        <Row>
          <Col>
            <section className="policy-section">
              <h2 className="policy-section-title">Integritetspolicy</h2>
              <p className="policy-text">
                Filmvisarna AB värnar om din integritet. Vi samlar in personuppgifter såsom namn, e-postadress och telefonnummer 
                i samband med registrering och bokning. Dessa uppgifter används enbart för att hantera ditt konto och dina bokningar,
                och delas aldrig med tredje part utan ditt samtycke. Du har rätt att begära ut, ändra eller radera dina uppgifter när 
                som helst genom att kontakta oss.
              </p>
            </section>
          </Col>
        </Row>

        <Row>
          <Col>
            <section className="policy-section">
              <h2 className="policy-section-title">Användarvillkor</h2>
              <p className="policy-text">
                Genom att använda Filmvisarna ABs tjänster godkänner du dessa villkor. Du ansvarar för att hålla dina inloggningsuppgifter 
                säkra. Missbruk av tjänsten, såsom försök att manipulera bokningssystem eller sprida skadlig kod, kan leda till att ditt 
                konto stängs av. Vi förbehåller oss rätten att ändra dessa villkor med rimlig förvarning.
              </p>
            </section>
          </Col>
        </Row>

        <Row>
          <Col>
            <section className="policy-section">
              <h2 className="policy-section-title">Cookie-policy</h2>
              <p className="policy-text">
                Vi använder cookies för att hålla dig inloggad och förbättra din upplevelse på webbplatsen. Sessionen lagras i en cookie 
                som automatiskt tas bort när du loggar ut eller efter 2 timmar. Vi använder inga spårnings- eller reklamcookies. Genom att 
                fortsätta använda webbplatsen godkänner du vår användning av cookies.
              </p>
            </section>
          </Col>
        </Row>

        <Row>
          <Col>
            <p className="policy-footer">
              2026 Filmvisarna AB 
            </p>
          </Col>
        </Row>
      </div>
    </div>
  );
}