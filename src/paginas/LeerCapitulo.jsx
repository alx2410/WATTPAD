// LeerCapitulo.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { auth } from "../firebase/auth";
import "../styles/Leer.css";

export default function LeerCapitulo() {
  const { libroId, capituloId } = useParams();
  const navigate = useNavigate();

  const [capitulo, setCapitulo] = useState(null);
  const [capitulos, setCapitulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (!auth.currentUser) return;

        // Capítulo actual
        const capRef = doc(db, "capitulos", capituloId);
        const capSnap = await getDoc(capRef);

        if (!capSnap.exists()) {
          setCapitulo(null);
          setCargando(false);
          return;
        }

        setCapitulo({ id: capSnap.id, ...capSnap.data() });

        // Lista de capítulos del libro
        const q = query(
          collection(db, "capitulos"),
          where("libroId", "==", libroId)
        );

        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => (a.numero || 0) - (b.numero || 0));
        setCapitulos(lista);

        // Actualizar progreso y último capítulo
        const index = lista.findIndex(c => c.id === capituloId);
        const progreso = Math.round(((index + 1) / lista.length) * 100);

        const usuarioLibroRef = doc(db, "usuarios", auth.currentUser.uid, "biblioteca", libroId);
        await updateDoc(usuarioLibroRef, {
          ultimoCapitulo: capituloId,
          progreso,
        });

      } catch (error) {
        console.error("Error cargando capítulo:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [libroId, capituloId]);

  if (cargando) return <p>Cargando capítulo...</p>;
  if (!capitulo) return <p>Capítulo no encontrado.</p>;

  const index = capitulos.findIndex(c => c.id === capituloId);
  const anterior = capitulos[index - 1];
  const siguiente = capitulos[index + 1];

  return (
    <div className="leer-layout">

      <button className="btn-menu" onClick={() => setMenuAbierto(true)}>
        ☰
      </button>

      <div className="leer-capitulo">
        <h1>{capitulo.titulo}</h1>
        <p>{capitulo.contenido}</p>

        <div className="nav-capitulos">
          {anterior && (
            <button onClick={() => navigate(`/leer/${libroId}/${anterior.id}`)}>
              Capítulo anterior
            </button>
          )}
          {siguiente && (
            <button onClick={() => navigate(`/leer/${libroId}/${siguiente.id}`)}>
              Siguiente capítulo
            </button>
          )}
        </div>
      </div>

      <aside className="menu-capitulos desktop">
        <h3>Capítulos</h3>
        <ul>
          {capitulos.map((cap, i) => (
            <li key={cap.id}>
              <button
                className={cap.id === capituloId ? "activo" : ""}
                onClick={() => navigate(`/leer/${libroId}/${cap.id}`)}
              >
                Capítulo {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {menuAbierto && (
        <div className="menu-overlay" onClick={() => setMenuAbierto(false)}>
          <aside className="menu-capitulos mobile" onClick={e => e.stopPropagation()}>
            <h3>Capítulos</h3>
            <ul>
              {capitulos.map((cap, i) => (
                <li key={cap.id}>
                  <button
                    className={cap.id === capituloId ? "activo" : ""}
                    onClick={() => {
                      navigate(`/leer/${libroId}/${cap.id}`);
                      setMenuAbierto(false);
                    }}
                  >
                    Capítulo {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
