import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import logo from "../assets/logo.png";
import "../styles/Explorar.css"; // NUEVO


export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false); // NUEVO
  const closeTimer = useRef(null); // TIEMPO DE GRACIA REAL
  const navigate = useNavigate(); // NUEVO
  const [busqueda, setBusqueda] = useState("");

const handleSearch = (e) => {
  e.preventDefault(); // evita recargar
  navigate(`/explorar?search=${busqueda}`); // manda a la página con el término
  setBusqueda(""); // ← AQUÍ SE LIMPIA
};


  // Mostrar solo primer nombre si es largo
  const mostrarNombre = () => {
    const nombre = user.displayName || "Usuario";
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
  "aventura"
];


  function seleccionar(cat) { // NUEVO
    navigate(`/explorar?genero=${cat}`);
    setShowCategories(false);
  }


  return (
    <nav className="navbar">
      
      {/* LOGO */}
      <div className="logo-container">
        <Link to="/miniwattpad">
          <img src={logo} alt="MiniWattpad Logo" className="logo" />
        </Link>
      </div>

      {/* LINKS IZQUIERDA */}
      <ul className="links-left">
        
        {/* EXPLORAR CON MENÚ NUEVO */}
        <li
          className="explorar-wrapper "
          style={{ position: "relative"}} // Necesario para posicionar el menú
        >
          <Link
           className="nav-links"
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setShowCategories(!showCategories);
            }}
          >
            Explorar
          </Link>

          {showCategories && (
            <div className="mega-menu-categorias">
              <div className="columnas-menu">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    className="categoria-opcion"
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

 {/* BUSCADOR -- Limpia el input automáticamente y usa icono de lupa */}
<div className="buscador-navbar">
  
  <input
    type="text"
    placeholder="Buscar..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = encodeURIComponent(busqueda.trim());
        if (q) {
          navigate(`/explorar?search=${q}`);
          setBusqueda(""); // ← SE LIMPIA AQUÍ
        }
      }
    }}
    aria-label="buscar libros"
    className="input-buscador"
  />

  <button
  type="button"
  className="btn-buscar lupa"
  onClick={() => {
    const q = encodeURIComponent(busqueda.trim());
    if (q) navigate(`/explorar?search=${q}`);
  }}
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
        <li ><Link to="/escribir" className="nav-links" >Escribir</Link></li>
        <li><Link to="/biblioteca" className="nav-links" >Biblioteca</Link></li>
        <li><Link to="/intranet" className="nav-links">Intranet</Link></li>
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

          // ⭐ ABRIR MENU
          onMouseEnter={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
            setShowMenu(true);
          }}

          // ⭐ CERRAR SOLO TRAS 2s DE GRACIA
          onMouseLeave={() => {
            closeTimer.current = setTimeout(() => {
              setShowMenu(false);
            }, 2000);
          }}
        >
          <img
            src={user.photoURL || "https://via.placeholder.com/40"}
            alt="avatar"
            className="avatar"
          />

          {showMenu && (
            <div
              className="dropdown-menu"

              // ⭐ Permitir entrar al menú sin que se cierre
              onMouseEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current);
              }}
              onMouseLeave={() => {
                closeTimer.current = setTimeout(() => {
                  setShowMenu(false);
                }, 100);
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
                <li><Link to="/notificaciones">Mis notificaciones</Link></li>
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
