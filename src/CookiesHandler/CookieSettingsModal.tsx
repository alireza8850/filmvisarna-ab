import { useCookieConsent } from "./CookieContext";

export default function CookieSettingsModal() {
  const { consent, setConsent, settingsOpen, closeSettings } =
    useCookieConsent();

  if (!settingsOpen) return null;

  // fallback إذا لم يكن هناك consent محفوظ
  const current = consent ?? { necessary: true, statistics: false };

  // تحديث الإعدادات محليًا قبل الحفظ (اختياري)
  const updateStatistics = (value: boolean) => {
    setConsent({
      necessary: true,
      statistics: value,
    });
  };

  return (
    <div className="cookie-modal">
      <div className="cookie-modal-content">
        <h3>Cookie‑inställningar</h3>

        <p>
          <strong>Nödvändiga cookies</strong> — alltid aktiva för inloggning och
          säkerhet.
        </p>

        <label className="cookie-checkbox">
          <input
            type="checkbox"
            checked={current.statistics}
            onChange={(e) => updateStatistics(e.target.checked)}
          />
          Tillåt statistik‑cookies (kan användas som underlag för
          marknadsföring)
        </label>

        <div className="modal-buttons">
          <button className="btn-save" onClick={closeSettings}>
            Spara
          </button>

          <button
            className="btn-reject"
            onClick={() => {
              setConsent({
                necessary: true,
                statistics: false,
              });
              closeSettings();
            }}
          >
            Avvisa alla
          </button>

          <button className="btn-close" onClick={closeSettings}>
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}