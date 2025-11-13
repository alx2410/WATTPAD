import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [showAuth, setShowAuth] = useState(false); // 👈 controla el modal
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim() === "") return;
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

      {/*BARRA DE BUSQUEDA*/}
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
        <li><Link to="/escribir">Escribir</Link></li>
        <li><Link to="/biblioteca">Biblioteca</Link></li>
        <li ><Link to="/mundolector">MundoLector</Link></li>
         <li ><Link to="/perfil">Perfil</Link></li>
      </ul>

     <button onClick={() => setShowAuth(true)}>Iniciar sesión</button>

      {/* 👇 aquí el modal aparece solo cuando showAuth es true */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </nav>
  );
}
