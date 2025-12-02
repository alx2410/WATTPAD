import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";


export default function LibroDetalle() {
  const { id } = useParams();
  const [libro, setLibro] = useState(null);

  useEffect(() => {
    const fetchLibro = async () => {
      const docRef = doc(db, "libros", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setLibro(docSnap.data());
    };
    fetchLibro();
  }, [id]);

  if (!libro) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <img src={libro.portada} alt={libro.titulo} style={{ width: "300px" }} />
      <h1>{libro.titulo}</h1>
      <h3>{libro.autor}</h3>
      <p><strong>Género:</strong> {libro.genero}</p>
      <p>{libro.sipnosis}</p>
      <button onClick={() => window.open(libro.archivo, "_blank")}>
        Empezar a leer
      </button>
    </div>
  );
}
