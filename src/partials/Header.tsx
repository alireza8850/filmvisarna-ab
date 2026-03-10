import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../utils/UserContext";

const MER_LANKAR = [
    {text:"Nu på bio", href:"/"},
    {text:"Kommande filmer", href:"/upcoming"},
    {text:"Mat & Dryck", href:"#"},
    {text:"Kontakta oss", href:"#"},
];


const Header: React.FC = () => {
  // whether the navbar is expanded or not
  // (we use this to close it after a click/selection)
  const [menuOpen, setMenuOpen] = useState(false);

  const[dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user, logout } = useUser();

  const openMenu = (): void => {                            //öppna menyn och lås scrollning
    setMenuOpen(true);
    document.body.style.overflow = 'hidden';
  }

  const closeMenu = (): void => {                           //stäng menyn och lås upp scrollning
    setMenuOpen(false);
    document.body.style.overflow = '';
  }

useEffect(
    ()=>
    {          //när man klickar utanför, dropdown stängs

        const clickOutside = (e: MouseEvent) =>
        {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
            {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", clickOutside);
        return () =>
        {
            document.removeEventListener("mousedown", clickOutside);
            document.body.style.overflow = "";
        }
    }, []);

  return (
    <>
      
            <header className="header py-3">                          {/* padding y 3 */}
                <div className="container-fluid px-3 px-md-4">          {/* full bredd container med padding x 3 och padding 4 för skärm medium och större*/}
                    <div className="d-flex justify-content-between align-items-center">
 
                        <h1 className="logo" onClick={() => navigate("/")}>Filmvisarna AB</h1>                 
                        <nav className="desktop-nav d-none d-lg-flex align-items-center ms-auto gap-3">    {/* dold som standard och visas på lg(desktop)*/}

                            <ul className="nav-links list-unstyled d-flex gap-3 mb-0">
                                <li><a onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>NU PÅ BIO</a></li>
                                <li><a onClick={() => navigate("/upcoming")} style={{ cursor: 'pointer' }}>KOMMANDE FILMER</a></li>
                                <li><a href="#">MAT &amp; DRYCK</a></li>
                            </ul>
                          
                            <div className="d-flex gap-2 align-items-center">
                            {user ? (
                            <>
                                <button className="user-icon" onClick={() => navigate("/my-bookings")} title={user.firstName}>
                                    <i className="bi bi-person-circle"></i>
                                </button>
                                <button className="sign-button" onClick={() => { logout(); navigate("/"); }}>
                                    LOGGA UT
                                </button>
                            </>
                            ) : (
                            <>
                                <button className="sign-button" onClick={() => navigate("/register")}>BLI MEDLEM</button>
                                <button className="sign-button" onClick={() => navigate("/login")}>LOGGA IN</button>
                            </>
                            )}
</div>
                            <div className="mer-dropdown" ref={dropdownRef}>
                                <button className={`mer-klass${dropdownOpen ? ' aktiv' : ''}`} 
                                        onClick={()=> setDropdownOpen(prev => !prev)}>
                                Mer 
                                    <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} ms-1`}></i>
                                </button>
                                {dropdownOpen && (
                                        <div className="mer-panel" role="menu">
                                            {MER_LANKAR.map(lank => (
                                                <a
                                                    key={lank.text}
                                                    href={lank.href}
                                                    className="mer-lank"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    {lank.text}
                                                </a>
                                            ))}
                                            
                                            {user ? (
                                                <button
                                                    className="mer-lank"
                                                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                                                    onClick={() => { logout(); navigate("/"); setDropdownOpen(false); }}
                                                >
                                                    Logga ut
                                                </button>
                                            ) : (
                                                <>
                                                    <a className="mer-lank" style={{ cursor: 'pointer' }} onClick={() => { navigate("/register"); setDropdownOpen(false); }}>
                                                        Bli medlem
                                                    </a>
                                                    <a className="mer-lank" style={{ cursor: 'pointer' }} onClick={() => { navigate("/login"); setDropdownOpen(false); }}>
                                                        Logga in
                                                    </a>
                                                </>
                                            )}
                                            {/* Stäng-knapp */}
                                            <button
                                                className="mer-stang"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </div>
                                    )}

                            </div>
                        </nav>

                    
                        <div className="d-flex d-lg-none align-items-center gap-2">
                            <button
                                className="user-icon" aria-label="Mitt konto"onClick={() => user ? navigate("/my-bookings") : navigate("/login")}>
                                <i className="bi bi-person-circle"></i>
                            </button>
                            <button
                                className="hamburger-icon"
                                aria-label="Öppna meny"        
                                onClick={openMenu}
                            >
                                <i className="bi bi-list"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </header>

         
            <div
                className={`mobile-menu${menuOpen ? ' active' : ''}`}
                aria-label="Mobilmeny"
            >
             
                <div className="header-mobile-menu">
                    <h2>Meny</h2>
                    <button
                        className="close-menu"
                        aria-label="Stäng meny"
                        onClick={closeMenu}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                
                <nav className="mobile-nav">
                    <ul>
                        <li><a onClick={() => { navigate("/"); closeMenu(); }} style={{ cursor: 'pointer' }}>PÅ BION</a></li>
                        <li><a onClick={() => { navigate("/upcoming"); closeMenu(); }} style={{ cursor: 'pointer' }}>KOMMANDE FILMER</a></li>
                        <li><a href="#">MAT &amp; DRYCK</a></li>
                    </ul>
                </nav>

               
                <div className="d-flex flex-column gap-2 p-3">
                    {!user && (
                    <>
                    <button className="auth-btn" onClick={()=> navigate("/register")}>BLI MEDLEM</button>
                    <button className="auth-btn" onClick={()=> navigate("/login")}>LOGGA IN</button>
                    </>
                    )}
                    {user && (
                      <button className="auth-btn" onClick={() => { logout(); closeMenu(); }}>LOGGA UT</button>
                    )}
                </div>
            </div>
    
    </>
  )

};

export default Header;
