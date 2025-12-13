import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, query, where, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import "../styles/Leer.css";

export default function LeerLibro() {
  const { libroId } = useParams();
  const navigate = useNavigate();

  const [libro, setLibro] = useState(null);
  const [capitulos, setCapitulos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Traer libro
        const libroRef = doc(db, "libros", libroId);
        const libroSnap = await getDoc(libroRef);

        if (!libroSnap.exists()) {
          setLibro(null);
          setCargando(false);
          return;
        }

        setLibro({ id: libroSnap.id, ...libroSnap.data() });

        // Traer capítulos
        let q = query(
          collection(db, "capitulos"),
          where("libroId", "==", libroId)
          // orderBy("numero", "asc") // solo si ya tienes el índice
        );

        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Ordenar manualmente si no hay índice
        lista.sort((a, b) => (a.numero || 0) - (b.numero || 0));

        setCapitulos(lista);
      } catch (error) {
        console.error("Error cargando libro o capítulos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [libroId]);

  if (cargando) return <p>Cargando libro...</p>;
  if (!libro) return <p>Libro no encontrado.</p>;

  return (
    <div className="leer-libro">
      <h1>{libro.titulo}</h1>
      <p>{libro.sinopsis}</p>

      {capitulos.length > 0 ? (
        <button
          className="btn-leer"
          onClick={() => navigate(`/leer/${libroId}/${capitulos[0].id}`)}
        >
          Empezar capítulo 1
        </button>
      ) : (
        <p>Aún no hay capítulos disponibles.</p>
      )}
    </div>
  );
}
