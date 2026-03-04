import {useState} from "react";
import {Row, Col} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "/sass/_login.scss";

LoginPage.route = {
  path: "/login",
};
export default function LoginPage(){

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [userInput, setUserInput] = useState({email: false, pass: false});
    const validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
    const validPass = pass.length >= 8;
    const bothValid = validEmail && validPass;

    const loginButton = (): void =>{
        setUserInput({email: true, pass: true});

        if(!bothValid) return;
    }

    return(
        <div className="login-page">
            <div>

                <div className="login-wrap">
                    <h1 className="login-title">Logga In</h1>

                    <div className="login-form">
                        <Row>
                            <Col>
                                <label className="auth-label">E-Post</label>
                                <div className="auth-input-wrap">
                                    <i className="bi bi-envelope auth-input-icon"></i>
                                    <input
                                        type="email"
                                        placeholder="Skriv in din e-post adress"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onBlur={() => setUserInput(p => ({ ...p, email: true }))}
                                        className={userInput.email && !validEmail ? 'fel' : ''}
                                    />
                                </div>
                                {userInput.email && !validEmail && (
                                    <p className="auth-fel">Ange en giltig e-post adress.</p>
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
                                        className={userInput.pass && !validPass ? 'fel' : ''}
                                    />
                                </div>
                                {userInput.pass && !validPass && (
                                    <p className="auth-fel">Lösenordet måste vara minst 8 tecken.</p>
                                )}
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <button
                                    className="login-submit-btn"
                                    onClick={loginButton}
                                    type="button"
                                >
                                    Logga in
                                </button>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <p className="auth-lank-text">
                                    Inte medlem än?{' '}
                                    <button onClick={() => navigate("/register")} type="button">
                                        Registrera dig här!
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