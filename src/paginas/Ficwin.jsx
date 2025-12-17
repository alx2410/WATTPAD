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
import CarruselFicwin from "../components/CarruselFicwin";
import FicwinPopular from "../components/FicwinPopular";
import EncuestaFicwin from "../components/EncuestaFicwin";

export default function Ficwin() {
  const [masLeidos, setMasLeidos] = useState([]);

  useEffect(() => {
    // Cambié "leidas" por "vistas" para mostrar los libros con más vistas
    const qMasVistos = query(
      collection(db, "libros"),
      orderBy("vistas", "desc"), // <-- aquí está el cambio
      limit(5)
    );

    const unsub = onSnapshot(qMasVistos, (snap) => {
      setMasLeidos(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  return (
    <div className="ficwin-container">
      <h1>Ficwin Awards</h1>

      {/* MÁS LEÍDOS (CARRUSEL) */}
      <section>
        <h2>Libros más leídos</h2>
        <CarruselFicwin libros={masLeidos} />
      </section>

      {/* CARRUSEL POPULAR */}
      <section>
        <h2>Libros populares Ficwin</h2>
        <FicwinPopular />
      </section>

      {/* ENCUESTA */}
      <section>
        <EncuestaFicwin />
      </section>
    </div>
  );
}