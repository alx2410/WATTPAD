import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import logo from "../assets/fictory-trans.png";
import "../styles/Explorar.css";
import { useNotifications } from "../context/NotificationContext";


export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(); // ← está aquí arriba
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const closeTimer = useRef(null);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
   const esAdmin =
    user?.role === "admin" || user?.role === "moderador";

  const handleSearch = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/explorar?search=${encodeURIComponent(busqueda.trim())}`);
      setBusqueda("");
    }
  };

  const mostrarNombre = () => {
    const nombre = user?.username || user?.displayName || "Usuario";
    return nombre.length <= 15 ? nombre : nombre.split(" ")[0];
  };

  const categorias = [
    "romance",
    "fantasia",
    "ciencia-ficcion",
    "misterio",
    "drama",
    "terror",
    "comedia",
    "aventura",
    "fanfic",
    "LGTBQ",
    "motivacional",
    "thriller"
  ];

  function seleccionar(cat) {
    navigate(`/explorar?genero=${cat}`);
    setShowCategories(false);
  }

  return (
    <nav className="main-navbar">
      {/* LOGO */}
      <div className="logo-container">
        <Link to="/miniwattpad">
          <img src={logo} alt="MiniWattpad Logo" className="logo" />
        </Link>
      </div>

      {/* LINKS IZQUIERDA */}
      <ul className="links-left">
        <li
          className="explorar-wrapper nav-links"
          style={{ position: "relative" }}
        >
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setShowCategories(!showCategories);
            }}
          >
            Explorar
          </Link>

          {showCategories && (
            <div className="mega-menu-modal">
              <div className="columnas-modal">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    className="categoria-modal"
                    onClick={() => seleccionar(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </li>

        <li><Link to="/comunidad" className="nav-links">Comunidad</Link></li>
      </ul>

      {/* BUSCADOR */}
      <div className="buscador-navbar">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(e);
          }}
          aria-label="buscar libros"
          className="input-buscador"
        />

        <button
          type="button"
          className="btn-buscar lupa"
          onClick={handleSearch}
          aria-label="Buscar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {/* LINKS DERECHA */}
      <ul className="links-right">
        <li>
  <button
    className="nav-links"
    onClick={() => {
      if (!user) {
        setShowAuth(true);   // abre login
      } else {
        navigate("/escribir"); // entra normal
      }
    }}
    style={{ background: "none", border: "none", cursor: "pointer" }}
  >
    Escribir
  </button>
</li>

        <li><Link to="/biblioteca" className="nav-links intranet-nav">Biblioteca</Link></li>

        {esAdmin && (
  <li>
    <Link to="/intranet/moderacion" className="nav-links" >
      Intranet  
    </Link>
  </li>
)}

      </ul>

      


      {/* USUARIO */}
      {!user ? (
        <button onClick={() => setShowAuth(true)} className="boton-navbar">
          Iniciar sesión
        </button>
      ) : (
        <div
          className="user-toolkit"
          style={{ position: "relative" }}
          onMouseEnter={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
            setShowMenu(true);
          }}
          onMouseLeave={() => {
            closeTimer.current = setTimeout(() => setShowMenu(false), 2000);
          }}
        >
            <div style={{ position: "relative", display: "inline-block" }}>
  <img
    src={user.photoURL || "https://via.placeholder.com/40"}
    alt="avatar"
    className="avatar"
  />
  {unreadCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: "-4px",    // ajusta para que quede en la esquina superior
        right: "-4px",  // ajusta para que quede pegada a la derecha
        width: "14px",
        height: "14px",
        backgroundColor: "red",
        color: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        fontWeight: "bold",
        boxShadow: "0 0 2px rgba(0,0,0,0.3)"
      }}
    >
      {unreadCount}
    </span>
  )}
</div>



          {showMenu && (
            <div
              className="dropdown-menu"
              onMouseEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current);
              }}
              onMouseLeave={() => {
                closeTimer.current = setTimeout(() => setShowMenu(false), 100);
              }}
            >
              <div className="user-info">
                <img
                  src={user.photoURL || "https://via.placeholder.com/50"}
                  className="avatar-big"
                  alt="avatar"
                />
                <p className="user-name">Hola, {mostrarNombre()} 👋</p>
              </div>

              <ul className="menu-options">
                <li><Link to="/perfil">Mi perfil</Link></li>
                <li><Link to="/cuenta">Mi cuenta</Link></li>
                <hr />
                <li><Link to="/biblioteca">Mi biblioteca</Link></li>
                <li>
  <Link to="/notificaciones" style={{ position: "relative" }}>
          Mis notificaciones
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: -5,
              right: -25,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "0.7rem"
            }}>
              {unreadCount}
            </span>
          )}
        </Link>
</li>
                <hr />
                <li className="cerrar-sesion" onClick={logout}>
                  Cerrar sesión
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </nav>
  );
}