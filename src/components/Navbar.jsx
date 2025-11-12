import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false); // 👈 controla el modal
  return (
    <nav>
      <h1>MiniWattpad</h1>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/explorar">Explorar</Link></li>
        <li><Link to="/comunidad">Comunidad</Link></li>
      </ul>

     <button onClick={() => setShowAuth(true)}>Iniciar sesión</button>

      {/* 👇 aquí el modal aparece solo cuando showAuth es true */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </nav>
  );
}
