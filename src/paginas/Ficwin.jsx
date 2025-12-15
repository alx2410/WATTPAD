
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/Ficwin.css";

export default function Ficwin() {
  const [masLeidos, setMasLeidos] = useState([]);
  const [masBiblioteca, setMasBiblioteca] = useState([]);

  useEffect(() => {
    const qLeidos = query(
      collection(db, "libros"),
      orderBy("leidas", "desc"),
      limit(5)
    );

    const qBiblioteca = query(
      collection(db, "libros"),
      orderBy("enBiblioteca", "desc"),
      limit(5)
    );

    const unsubLeidos = onSnapshot(qLeidos, (snap) => {
      setMasLeidos(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    const unsubBiblio = onSnapshot(qBiblioteca, (snap) => {
      setMasBiblioteca(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => {
      unsubLeidos();
      unsubBiblio();
    };
  }, []);

  return (
    <div className="ficwin-container">
      <h1>🏆 Ficwin Awards</h1>

      {/* MÁS LEÍDOS */}
      <section>
        <h2>📖 Libros más leídos</h2>
        <div className="ficwin-grid">
          {masLeidos.map((libro) => (
            <div key={libro.id} className="ficwin-card">
              <img src={libro.portada} alt={libro.titulo} />
              <h3>{libro.titulo}</h3>
              <p>🔥 {libro.leidas || 0} lecturas</p>
            </div>
          ))}
        </div>
      </section>

      {/* MÁS EN BIBLIOTECA */}
      <section>
        <h2>⭐ Más agregados a biblioteca</h2>
        <div className="ficwin-grid">
          {masBiblioteca.map((libro) => (
            <div key={libro.id} className="ficwin-card">
              <img src={libro.portada} alt={libro.titulo} />
              <h3>{libro.titulo}</h3>
              <p>📚 {libro.enBiblioteca || 0} veces</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}