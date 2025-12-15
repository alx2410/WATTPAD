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

      {cargando ? (
        <p>Cargando libros...</p>
      ) : (
        <div className="grid-libros-explorar">
          {librosFiltrados.length > 0 ? (
            librosFiltrados.map((libro) => (
              <Link
                to={`/libro/${libro.id}`}
                key={libro.id}
                className="libro-card-explorar"
              >
                {libro.portada && <img src={libro.portada} alt={libro.titulo} />}
                <div className="info-libro-explorar">
                  <h2>{libro.titulo}</h2>
                  <p>{libro.autorNombre || "Autor desconocido"}</p>
                </div>
              </Link>
            ))
          ) : (
            <p>No hay resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}
