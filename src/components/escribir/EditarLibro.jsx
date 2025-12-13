import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditarLibro({ libroId }) {
  const [titulo, setTitulo] = useState("");
  const [sinopsis, setSinopsis] = useState("");
  const [genero, setGenero] = useState("");
  const [portada, setPortada] = useState("");
  const [estado, setEstado] = useState("borrador"); // borrador / publicado
  const [loading, setLoading] = useState(false);

  // CARGAR DATOS DEL LIBRO
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const docRef = doc(db, "libros", libroId);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const d = snap.data();
          setTitulo(d.titulo || "");
          setSinopsis(d.sinopsis || "");
          setGenero(d.genero || "");
          setPortada(d.portada || "");
          setEstado(d.estado || "borrador");
        }
      } catch (err) {
        console.error("Error cargando libro:", err);
      }
    };

    cargarDatos();
  }, [libroId]);

  // GUARDAR CAMBIOS
  const guardarCambios = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ref = doc(db, "libros", libroId);

      await updateDoc(ref, {
        titulo,
        sinopsis,
        genero,
        portada,
        estado,
      });

      alert("Libro actualizado");
    } catch (err) {
      console.error("Error actualizando libro:", err);
    }

    setLoading(false);
  };

  return (
    <form className="editar-libro-form" onSubmit={guardarCambios}>
      <h2>Editar libro</h2>

      <label>Título</label>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />

      <label>Sinopsis</label>
      <textarea
        value={sinopsis}
        onChange={(e) => setSinopsis(e.target.value)}
        required
      />

      <label>Género</label>
      <input
        type="text"
        value={genero}
        onChange={(e) => setGenero(e.target.value)}
        required
      />

      <label>Portada (URL)</label>
      <input
        type="text"
        value={portada}
        onChange={(e) => setPortada(e.target.value)}
      />

      <label>Estado</label>
      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="borrador">Borrador</option>
        <option value="publicado">Publicado</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
