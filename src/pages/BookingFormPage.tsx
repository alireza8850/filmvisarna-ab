
import { Row, Col } from "react-bootstrap";
import "/sass/-booking-form.scss";


BookingFormPage.route = {
  path: "/bookingformpage",
  
};



export default function BookingFormPage(){

  return(

    <div className="overview-page">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title text-center">Översikt</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <div className="card p-3">
            <Row className="g-3">
              <Col>
                {
                  [
                    /*en array av objekt med etikett och varde */

                    { etikett: "Film:"},
                    { etikett: "Tid:"},
                    { etikett: "Datum"},
                    { etikett: "Salong"},
                  ]
                  .map(({etikett}) =>
                    (
                    <Row key={etikett} className="mb-2">
                      <Col><span className="film-info">{etikett}</span></Col>
                      <Col xs="auto"><span className="film-info-value">--</span></Col>
                    </Row>
                    )
                  )
                }
              </Col>
            </Row>
            <hr style={{borderColor: "var(--border-color)", margin: "12px 0"}} />
            <Row className="mb-1">
              <Col>
              <span className="film-info">Rad:</span>
              </Col>
              <Col xs="auto">
                <span className="film-info">Plats:</span>
              </Col>
              <Col>
              <span className="film-info">Rad:</span>
              </Col>
              <Col xs="auto">
                <span className="film-info">Plats:</span>
              </Col>
            </Row>
            <hr style={{borderColor: "var(--border-color)", margin: "12px 0"}} />

            <Row className="price-summery">
                <Col><span className="summery-info">Vuxen x --</span></Col>
                <Col xs="auto"><span className="summery-info-value"> kr</span></Col>
            </Row>
            <Row className="price-summery">
                <Col><span className="summery-info">Barn x --</span></Col>
                <Col xs="auto"><span className="summery-info-value"> kr</span></Col>
            </Row>
            <Row className="price-summery">
                <Col><span className="summery-info">Pansionär x --</span></Col>
                <Col xs="auto"><span className="summery-info-value"> kr</span></Col>
            </Row>
            <Row className="price-summery" style={{borderBottom:"none", paddingTop: "10px"}}>
                <Col><span className="summery-info">Total pris</span></Col>
                <Col xs="auto"><span className="summery-info-value">kr</span></Col>
            </Row>
          </div>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Row className="mb-2">
            <Col>
                <input type="email" className="email-input" placeholder="skriv in din e-post" />
            </Col>
          </Row>
          <Row className="mt-3 justify-content-end">
            <Col xs="auto">
                <button className="slutfor-btn" type="button">Slutför</button>
            </Col>
          </Row>
        </Col>

      </Row>



    </div>


  )

}