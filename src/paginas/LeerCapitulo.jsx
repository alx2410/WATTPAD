import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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
        // Capítulo actual
        const capRef = doc(db, "capitulos", capituloId);
        const capSnap = await getDoc(capRef);

        if (!capSnap.exists()) {
          setCapitulo(null);
          setCargando(false);
          return;
        }

        setCapitulo({ id: capSnap.id, ...capSnap.data() });

        // Lista de capítulos
        const q = query(
          collection(db, "capitulos"),
          where("libroId", "==", libroId)
        );

        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        lista.sort((a, b) => (a.numero || 0) - (b.numero || 0));
        setCapitulos(lista);

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

      {/* BOTÓN HAMBURGUESA (solo móvil) */}
      <button
        className="btn-menu"
        onClick={() => setMenuAbierto(true)}
      >
        ☰
      </button>

      {/* CONTENIDO PRINCIPAL */}
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

      {/* MENÚ LATERAL (desktop) */}
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

      {/* MENÚ HAMBURGUESA (mobile) */}
      {menuAbierto && (
        <div className="menu-overlay" onClick={() => setMenuAbierto(false)}>
          <aside
            className="menu-capitulos mobile"
            onClick={e => e.stopPropagation()}
          >
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
