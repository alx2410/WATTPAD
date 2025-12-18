// src/paginas/Explorar.jsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import "../styles/Explorar.css";

export default function Explorar() {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroGenero, setFiltroGenero] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoriaURL = queryParams.get("genero") || "";
  const searchURL = queryParams.get("search") || "";

  const formatearVistas = (num = 0) => {
  if (num < 1000) return num;
  if (num < 1000000) return `${Math.floor(num / 1000)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

const IconoOjo = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);


  // Actualizar filtros desde URL
  useEffect(() => {
    if (categoriaURL) setFiltroGenero(categoriaURL);
    else setFiltroGenero("");

    if (searchURL) setBusqueda(searchURL);
    else setBusqueda("");
  }, [categoriaURL, searchURL]);

  // Traer libros publicados
  useEffect(() => {
    const q = query(collection(db, "libros"), where("estado", "==", "publicado"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const librosArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLibros(librosArray);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar libros
  const librosFiltrados = libros.filter((libro) => {
    const generoLibro = (libro.genero || "").toLowerCase();
    const tituloLibro = (libro.titulo || "").toLowerCase();
    const autorLibro = (libro.autorNombre || "").toLowerCase();

    const coincideGenero = filtroGenero
      ? generoLibro === filtroGenero.toLowerCase()
      : true;

    const coincideBusqueda = busqueda
      ? tituloLibro.includes(busqueda.toLowerCase()) ||
        autorLibro.includes(busqueda.toLowerCase()) ||
        generoLibro.includes(busqueda.toLowerCase())
      : true;

    return coincideGenero && coincideBusqueda;
  });

  return (
    <div className="explorar-container">
      <h1 className="titulo-explorar">
        Historias de {filtroGenero
          ? filtroGenero.charAt(0).toUpperCase() + filtroGenero.slice(1)
          : busqueda
          ? `Resultados para "${busqueda}"`
          : "Todos los libros"}
      </h1>

      <h3>Fictory Originales</h3>

      {cargando ? (
        <p>Cargando libros...</p>
      ) : (
  <div className="grid-libros-explorar">
  {librosFiltrados.map((libro) => (
    <div key={libro.id} style={{ display: 'flex', alignItems: 'center' }}>
      <Link to={`/libro/${libro.id}`}>
        <img className="libro-portada" src={libro.portada} alt={libro.titulo} />
      </Link>
      <div className="libro-info">
        <h2>{libro.titulo}</h2>
        <p>{libro.autorNombre || "Autor desconocido"}</p>
        <div className="detalle-stat">
          <div className="detalle-stat-icon"><IconoOjo /></div>
          <div className="detalle-stat-text"><strong>{formatearVistas(libro.vistas)}</strong></div>
        </div>
      </div>
    </div>
  ))}
</div>

      )}
    </div>
  );
}
