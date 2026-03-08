import React, { FC, useState, useEffect } from "react";
import "./_contactoss.scss";

//Types 
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
//Inline SVG Icons
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
 //Component
  const ContactOss: FC = () => {
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

      {/* Background glow */}
      <div className="contactoss-page__glow" />

      {/* Top accent bar */}
      <div className="contactoss-page__topbar" />

      {/* Main content */}
      <div className="contactoss-inner">

        {/* ── Header ── */}
        <div className={fade("d1")}>
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
        </div>

