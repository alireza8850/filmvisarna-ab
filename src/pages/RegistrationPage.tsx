import {useState} from "react";
import {Row , Col} from "react-bootstrap";
import "/sass/_login.scss";
import { useNavigate } from "react-router-dom";

RegistrationPage.route = {
  path: "/register",
};

export default function RegistrationPage (){
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [pass,setPass] = useState("");
    const [repeatPass,setRepeatPass] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userInput,setUserInput] = useState({phoneNumber: false, email: false, pass: false, repeatPass: false, firstName: false, lastName: false});


    const validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
    const validPass = pass.length >= 8;
    const validRepeatPass = repeatPass === pass && repeatPass.length > 0;
    const validFirstName = firstName.trim().length >= 2;      //.trim() tar bort mellanrum/whitespace i början och slutet
    const validLastName = lastName.trim().length >= 2;
    const allValid = phoneNumber && validEmail && validPass && validRepeatPass && validFirstName && validLastName;
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);   // State för att visa laddningsindikator medan API-anrop pågår tex visar Registrerar ist för Registrera

    const registerButton = async (): Promise<void> => {
        setUserInput({
          phoneNumber: true,
          email: true,
          pass: true,
          repeatPass: true,
          firstName: true,
          lastName: true,
        });
        setServerError("");
    if (!allValid) return;

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        password: pass,
        phoneNumber: phoneNumber.trim(),
         }),
    });

      const data = await res.json();

      if (data.error) {
          setServerError(data.error);
        }
      else {
        navigate("/login");
      }
    } catch (error) {
        setServerError("Något gick fel. Försök igen.");
        console.error(error);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="register-page">
            <div>
                <div className="register-wrap">
                    <h1 className="register-title">Bli Medlem Hos Oss</h1>

                    <div className="register-form">
        {serverError && (
                <Row>
                  <Col>
                    <p className="auth-fel server-error">{serverError}</p>
                  </Col>
                </Row>
              )}

            <Row>
              <Col>
                <label className="auth-label">Förnamn</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-person auth-input-icon"></i>
                  <input
                    type="text"
                    placeholder="Skriv in ditt förnamn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() =>
                      setUserInput((p) => ({ ...p, firstName: true }))
                    }
                    className={userInput.firstName && firstName.length > 0 && !validFirstName ? "fel" : ""}
                  />
                </div>
                {userInput.firstName && firstName.length > 0 && !validFirstName && (
                  <p className="auth-fel">Förnamnet måste vara minst 2 tecken.</p>
                )}
              </Col>
            </Row>

            <Row>
              <Col>
                <label className="auth-label">Efternamn</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-person auth-input-icon"></i>
                  <input
                    type="text"
                    placeholder="Skriv in ditt efternamn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() =>
                      setUserInput((p) => ({ ...p, lastName: true }))
                    }
                    className={userInput.lastName && lastName.length > 0 && !validLastName ? "fel" : ""}
                  />
                </div>
                {userInput.lastName && lastName.length > 0 && !validLastName && (
                  <p className="auth-fel">Efternamnet måste vara minst 2 tecken.</p>
                )}
              </Col>
            </Row>

                        <Row>
                            <Col>
                                <label className="auth-label">Telefon nummer</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-telephone auth-input-icon"></i>
                                    <input
                                        type="text"
                                        maxLength={12}
                                        placeholder="0712345678"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        onBlur={() => setUserInput(p => ({ ...p, phoneNumber: true }))}
                                    />
                                    
                                </div>
                                
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label className="auth-label">E-Post</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-envelope auth-input-icon"></i>
                                    <input
                                        type="email"
                                        placeholder="Skriv in din E-post adress"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onBlur={() => setUserInput(p => ({ ...p, email: true }))}
                                        className={userInput.email && email.length > 0 && !validEmail ? 'fel' : ''}
                                    />
                                </div>
                                {userInput.email && email.length > 0 && !validEmail && (
                                    <p className="auth-fel">Ange en giltig e-postadress.</p>
                                )}
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label className="auth-label">Lösenord</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-lock auth-input-icon"></i>
                                    <input
                                        type="password"
                                        placeholder="********"
                                        value={pass}
                                        onChange={e => setPass(e.target.value)}
                                        onBlur={() => setUserInput(p => ({ ...p, pass: true }))}
                                        className={userInput.pass && pass.length > 0 && !validPass ? 'fel' : ''}
                                    />
                                </div>
                                {userInput.pass && pass.length > 0 && !validPass && (
                                    <p className="auth-fel">Lösenordet måste vara minst 8 tecken.</p>
                                )}
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <label className="auth-label">Repetera Lösenord</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-lock auth-input-icon"></i>
                                    <input
                                        type="password"
                                        placeholder="********"
                                        value={repeatPass}
                                        onChange={e => setRepeatPass(e.target.value)}
                                        onBlur={() => setUserInput(p => ({ ...p, repeatPass: true }))}
                                        className={userInput.repeatPass && repeatPass.length > 0 && !validRepeatPass ? 'fel' : ''}
                                    />
                                </div>
                                {userInput.repeatPass && repeatPass.length > 0 && !validRepeatPass && (
                                    <p className="auth-fel">Lösenorden matchar inte.</p>
                                )}
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <button
                                    className="register-submit-btn"
                                    onClick={registerButton}
                                    type="button"
                                    disabled={loading}
                                >
                                    {loading ? "Registrerar" :"Registrera"}
                                </button>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <p className="auth-lank-text">
                                    Har du redan ett konto?{' '}
                                    <button onClick={() => navigate("/login")} type="button">
                                        Logga in här!
                                    </button>
                                </p>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </div>
    );




}