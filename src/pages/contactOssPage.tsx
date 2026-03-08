import { useState, useEffect } from "react";
import type { FC } from "react";
import { Row, Col } from "react-bootstrap";
import "/sass/_contactOss.scss";

// Types 
interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

//Icons
const IconEmail: FC = () => (
  <svg width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconPhone: FC = () => (
  <svg width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.14 6.14l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconLocation: FC = () => (
  <svg width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconCheck: FC = () => (
  <svg width="26" height="26" fill="none" stroke="#f59e0b" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Route
ContactOssPage.route = {
  path: "/kontakta-oss",
  menuLabel: "Kontakta oss",
  index: 10,
};

//  Page Component 
export default function ContactOssPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = (): void => {
    setSubmitted(false);
    setForm(INITIAL_FORM);
  };

  const fade = (d: "d1" | "d2" | "d3"): string =>
    `fade-up fade-up--${d}${visible ? " fade-up--visible" : ""}`;

  return (
    <div className="contactoss-page">
      <div className="contactoss-page__glow" />
      <div className="contactoss-page__topbar" />

      <div className="contactoss-inner">

        {/* ── Header ── */}
        <Row className={fade("d1")}>
          <Col>
            <div className="contactoss-header">
              <p className="contactoss-header__eyebrow">— Kontakta oss</p>
              <h1 className="contactoss-header__title">
                Hur kan vi<br />
                <em>hjälpa dig?</em>
              </h1>
              <div className="contactoss-header__rule" />
              <p className="contactoss-header__sub">
                Fyll i formuläret eller nå oss direkt via e-post eller telefon.
                Vi svarar inom 24 timmar.
              </p>
            </div>
          </Col>
        </Row>

        {/* ── Form + Info ── */}
        <Row>

          {/* Left: Form */}
          <Col md={7} className={fade("d2")}>
            {submitted ? (
              <div className="contactoss-success">
                <div className="contactoss-success__circle">
                  <IconCheck />
                </div>
                <h3 className="contactoss-success__title">Tack!</h3>
                <p className="contactoss-success__body">
                  Ditt meddelande har skickats.<br />
                  Vi återkommer till dig så snart som möjligt.
                </p>
                <button className="contactoss-success__back" onClick={handleReset}>
                  Skicka ett nytt meddelande
                </button>
              </div>
            ) : (
              <form className="contactoss-form" onSubmit={handleSubmit} noValidate>

                <Row>
                  <Col sm={6}>
                    <div className="contactoss-form__field">
                      <label htmlFor="name" className="contactoss-form__label">Namn</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="contactoss-form__input"
                        placeholder="Ditt namn"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="contactoss-form__field">
                      <label htmlFor="phone" className="contactoss-form__label">Telefon</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="contactoss-form__input"
                        placeholder="+46 xx xxx xx xx"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </div>
                  </Col>
                </Row>

                <div className="contactoss-form__field">
                  <label htmlFor="email" className="contactoss-form__label">E-postadress</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="contactoss-form__input"
                    placeholder="din@epost.se"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="contactoss-form__field">
                  <label htmlFor="subject" className="contactoss-form__label">Ämne</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className="contactoss-form__input"
                    placeholder="Vad gäller ditt ärende?"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="contactoss-form__field">
                  <label htmlFor="message" className="contactoss-form__label">Meddelande</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="contactoss-form__textarea"
                    placeholder="Beskriv ditt ärende..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="contactoss-form__submit">
                  <span>Skicka meddelande</span>
                </button>

              </form>
            )}
          </Col>

          {/* Right: Contact Info */}
          <Col md={5} className={fade("d3")}>
            <div className="contactoss-info">

              <div className="info-block">
                <div className="info-block__head">
                  <div className="info-block__icon"><IconEmail /></div>
                  <span className="info-block__tag">E-post</span>
                </div>
                <a href="mailto:info@filmvisarna.se" className="info-block__link">
                  info@filmvisarna.se
                </a>
                <a href="mailto:support@filmvisarna.se" className="info-block__link">
                  support@filmvisarna.se
                </a>
              </div>

              <div className="info-block">
                <div className="info-block__head">
                  <div className="info-block__icon"><IconPhone /></div>
                  <span className="info-block__tag">Telefon</span>
                </div>
                <a href="tel:+46812345678" className="info-block__link">
                  +46 8 123 456 78
                </a>
                <span className="info-block__hint">
                  Måndag – Fredag &nbsp;09:00 – 17:00
                </span>
              </div>

              <div className="info-block">
                <div className="info-block__head">
                  <div className="info-block__icon"><IconLocation /></div>
                  <span className="info-block__tag">Adress</span>
                </div>
                <address className="info-block__address">
                   Propellergatan 1<br/>
                   211 15 Malmö<br/>
                </address>
              </div>

            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}