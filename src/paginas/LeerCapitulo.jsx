import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth } from "../firebase/auth";
import "../styles/Leer.css";

export default function LeerCapitulo() {
  const { libroId, capituloId } = useParams();
  const navigate = useNavigate();

  const [capitulo, setCapitulo] = useState(null);
  const [capitulos, setCapitulos] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

 
  // CARGAR CAPÍTULO Y LISTA

  useEffect(() => {
    const cargarDatos = async () => {
      if (!auth.currentUser) return;

      // Capítulo actual
      const capSnap = await getDoc(doc(db, "capitulos", capituloId));
      if (capSnap.exists()) {
        setCapitulo({ id: capSnap.id, ...capSnap.data() });
      }

      // Lista de capítulos (solo una vez)
      if (capitulos.length === 0) {
        const q = query(
          collection(db, "capitulos"),
          where("libroId", "==", libroId)
        );

        const snap = await getDocs(q);
        const lista = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.numero || 0) - (b.numero || 0));

        setCapitulos(lista);
      }
    };

    cargarDatos();
  }, [capituloId]);

  
  // CONTAR LECTURA (1 VEZ POR USUARIO)
  
  useEffect(() => {
    const contarLectura = async () => {
      if (!auth.currentUser) return;

      const lecturaRef = doc(
        db,
        "usuarios",
        auth.currentUser.uid,
        "lecturas",
        libroId
      );

      const yaConto = await getDoc(lecturaRef);
      if (yaConto.exists()) return;

      await setDoc(lecturaRef, {
        libroId,
        fecha: new Date(),
      });

      await updateDoc(doc(db, "libros", libroId), {
        lecturas: increment(1),
      });
    };

    contarLectura();
  }, [libroId]);

  
  // GUARDAR PROGRESO REAL
 
  useEffect(() => {
    const guardarProgreso = async () => {
      if (!auth.currentUser || !capitulos.length) return;

      const index = capitulos.findIndex(c => c.id === capituloId);
      if (index === -1) return;

      const progreso = Math.round(((index + 1) / capitulos.length) * 100);

      await setDoc(
        doc(db, "usuarios", auth.currentUser.uid, "biblioteca", libroId),
        {
          ultimoCapituloId: capituloId, // 👈 ESTE es el importante
          progreso,
          actualizado: new Date(),
        },
        { merge: true }
      );
    };

    guardarProgreso();
  }, [capituloId, capitulos]);

  if (!capitulo) return null;

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

      {/* MENÚ DESKTOP */}
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

      {/* MENÚ MOBILE */}
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
