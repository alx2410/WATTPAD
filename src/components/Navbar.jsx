import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { ZonaUsuario } from "./ZonaUsuario";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {

  const { user, logout } = useAuth(); // <-- agregado logout
  console.log("USER EN NAVBAR:", user);
  
  const [showAuth, setShowAuth] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    console.log("Buscando:", searchTerm);
  }

  return (
    <nav>
      <h1>
        <Link to="/miniwattpad">MiniWattpad</Link>
      </h1>

      <ul>
        <li><Link to="/explorar">Explorar</Link></li>
        <li><Link to="/comunidad">Comunidad</Link></li>
      </ul>

      {/* 🔎 Barra de búsqueda */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar historias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" aria-label="Buscar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="icon-search"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </button>
      </form>

      <ul>
        <li>
          <button
            onClick={() => {
              if (!user) {
                setShowAuth(true);
                return;
              }
              window.location.href = "/escribir";
            }}
            className="btn-link"
          >
            Escribir
          </button>
        </li>

        <li><Link to="/biblioteca">Biblioteca</Link></li>
        <li><Link to="/mundolector">MundoLector</Link></li>
        <li><Link to="/perfil">Perfil</Link></li>
      </ul>

      {/* 🔥 Botón LOGIN → LOGOUT automático */}
      {user ? (
        <button onClick={logout}>Cerrar sesión</button>
      ) : (
        <button onClick={() => setShowAuth(true)}>Iniciar sesión</button>
      )}

      {/* Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </nav>
  );
}
