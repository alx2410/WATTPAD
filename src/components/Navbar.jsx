import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import logo from "../assets/logo.png";
import "../styles/Explorar.css"; // NUEVO

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCategories, setShowCategories] = useState(false); // NUEVO
  const navigate = useNavigate(); // NUEVO

  const categorias = [ // NUEVO
    "romance", "fantasía", "ciencia ficcion",
    "misterio", "drama", "terror",
    "comedia", "aventura"
    
  ];

  function seleccionar(cat) { // NUEVO
    navigate(`/explorar?genero=${cat}`);
    setShowCategories(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    console.log("Buscando:", searchTerm);
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
          className="explorar-wrapper"
          style={{ position: "relative" }} // Necesario para posicionar el menú
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
            <div className="mega-menu">
              <h3>Categorías</h3>

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

        <li><Link to="/comunidad">Comunidad</Link></li>
      </ul>

      {/* BUSCADOR */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar historias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* LINKS DERECHA */}
      <ul className="links-right">
        <li><Link to="/escribir">Escribir</Link></li>
        <li><Link to="/biblioteca">Biblioteca</Link></li>
        <li><Link to="/intranet">Intranet</Link></li>
      </ul>

      {/* BOTÓN O FOTO (USUARIO) */}
      {!user ? (
        <button
          onClick={() => setShowAuth(true)}
          className="boton-navbar"
        >
          Iniciar sesión
        </button>
      ) : (
        <div className="user-toolkit">
          <img
            src={user.photoURL || "https://via.placeholder.com/40"}
            alt="avatar"
            className="avatar"
            onClick={() => setShowMenu(!showMenu)}
          />

          {showMenu && (
            <div className="dropdown-menu">
              <div className="user-info">
                <img
                  src={user.photoURL || "https://via.placeholder.com/50"}
                  className="avatar-big"
                  alt="avatar"
                />
                <p className="user-name">Hola, {user.displayName || "Usuario"} 👋</p>
              </div>

              <ul className="menu-options">
                <li><Link to="/perfil">Mi perfil</Link></li>
                <li><Link to="/cuenta">Mi cuenta</Link></li>
                <li><Link to="/biblioteca">Mi biblioteca</Link></li>
                <li><Link to="/notificaciones">Mis notificaciones</Link></li>

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
