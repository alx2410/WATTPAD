import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/auth";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

export default function Biblioteca() {
  const navigate = useNavigate();

  // ESTADOS REALES QUE VIENEN DE FIREBASE
  const [enLectura, setEnLectura] = useState([]);
  const [miLista, setMiLista] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cargarLibros = async () => {
      // BIBLIOTECA (EN LECTURA)
      const snapBiblio = await getDocs(
        collection(db, "usuarios", user.uid, "biblioteca")
      );

      const arrBiblio = [];
      snapBiblio.forEach((doc) => arrBiblio.push({ id: doc.id, ...doc.data() }));
      setEnLectura(arrBiblio);

      // MI LISTA
      const snapLista = await getDocs(
        collection(db, "usuarios", user.uid, "lista")
      );

      const arrLista = [];
      snapLista.forEach((doc) => arrLista.push({ id: doc.id, ...doc.data() }));
      setMiLista(arrLista);

      // FAVORITOS
      const snapFav = await getDocs(
        collection(db, "usuarios", user.uid, "favoritos")
      );

      const arrFav = [];
      snapFav.forEach((doc) => arrFav.push({ id: doc.id, ...doc.data() }));
      setFavoritos(arrFav);
    };

    cargarLibros();
  }, []);

  // FUNCIONES BÁSICAS
  const seguirLeyendo = (id) => {
    navigate(`/leer/${id}`);
  };

  const empezarALeer = (id) => {
    const libro = miLista.find((l) => l.id === id);
    if (!libro) return;

    setMiLista(miLista.filter((l) => l.id !== id));
    setEnLectura([...enLectura, libro]);
  };

  const quitarDeBiblioteca = (id) => {
    setEnLectura(enLectura.filter((l) => l.id !== id));
  };

  const quitarDeMiLista = (id) => {
    setMiLista(miLista.filter((l) => l.id !== id));
  };

  const quitarFavorito = (id) => {
    setFavoritos(favoritos.filter((l) => l.id !== id));
  };

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div className="biblioteca-contenedor">

      {/* EN LECTURA */}
      <div className="biblioteca-seccion">
        <h2>En lectura</h2>

        <div className="libros-grid">
          {enLectura.length === 0 && <p>No estás leyendo nada aún.</p>}

          {enLectura.map((libro) => (
            <div className="libro-card" key={libro.id}>
              <img src={libro.portada} alt={libro.titulo} />
              <p>{libro.titulo}</p>

              <button onClick={() => seguirLeyendo(libro.id)}>
                Seguir leyendo
              </button>

              <button onClick={() => quitarDeBiblioteca(libro.id)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MI LISTA */}
      <div className="biblioteca-seccion">
        <h2>Mi lista</h2>

        <div className="libros-grid">
          {miLista.length === 0 && <p>Tu lista está vacía.</p>}

          {miLista.map((libro) => (
            <div className="libro-card" key={libro.id}>
              <img src={libro.portada} alt={libro.titulo} />
              <p>{libro.titulo}</p>

              <button onClick={() => empezarALeer(libro.id)}>
                Empezar
              </button>

              <button onClick={() => quitarDeMiLista(libro.id)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAVORITOS */}
      <div className="biblioteca-seccion">
        <h2>Favoritos</h2>

        <div className="libros-grid">
          {favoritos.length === 0 && <p>No tienes favoritos todavía.</p>}

          {favoritos.map((libro) => (
            <div className="libro-card" key={libro.id}>
              <img src={libro.portada} alt={libro.titulo} />
              <p>{libro.titulo}</p>

              <button onClick={() => seguirLeyendo(libro.id)}>
                Leer otra vez
              </button>

              <button onClick={() => quitarFavorito(libro.id)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
