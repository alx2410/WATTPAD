import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import "../styles/Explorar.css";

export default function Explorar() {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroGenero, setFiltroGenero] = useState("");

  useEffect(() => {
    const q = query(collection(db, "libros"), orderBy("fecha", "desc"));
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

  const librosFiltrados = filtroGenero
    ? libros.filter((libro) => libro.genero === filtroGenero)
    : libros;

  return (
    <div className="explorar-container">
      <h1>Explorar</h1>
      <p>Aquí puedes descubrir nuevas historias y cómics.</p>

      <div className="filtro-genero">
        <select
          value={filtroGenero}
          onChange={(e) => setFiltroGenero(e.target.value)}
        >
          <option value="">Todos los géneros</option>
          <option value="romance"> Romance</option>
          <option value="fantasia"> Fantasía</option>
          <option value="ciencia-ficcion"> Ciencia ficción</option>
          <option value="misterio"> Misterio</option>
          <option value="drama"> Drama</option>
          <option value="terror"> Terror</option>
          <option value="comedia"> Comedia</option>
          <option value="aventura"> Aventura</option>
        </select>
      </div>

      {cargando ? (
        <p>Cargando libros...</p>
      ) : (
        <div className="grid-libros">
          {librosFiltrados.map((libro) => (
            <div key={libro.id} className="libro-card">
              <img src={libro.portada} alt={libro.titulo} />
              <div className="info-libro">
                <h2>{libro.titulo}</h2>
                <p>{libro.genero}</p>
                <p>Autor: {libro.autor}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}