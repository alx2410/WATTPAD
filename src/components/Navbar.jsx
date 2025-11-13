import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { ZonaUsuario } from "./ZonaUsuario";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <nav className="navbar">
      <h1>MiniWattpad</h1>

      <ul className="nav-links">
        <li><Link to="/explorar">Explorar</Link></li>
        <li><Link to="/comunidad">Comunidad</Link></li>
      </ul>

      <ZonaUsuario onAbrirLogin={() => setShowAuth(true)} />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </nav>
  );
}
