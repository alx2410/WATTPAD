import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function CapitulosEditor({ libroId }) {
  const [capitulos, setCapitulos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [numero, setNumero] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  // CARGAR CAPÍTULOS EN TIEMPO REAL
  useEffect(() => {
    const q = query(
      collection(db, "capitulos"),
      where("libroId", "==", libroId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.numero - b.numero);

      setCapitulos(data);
    });

    return () => unsub();
  }, [libroId]);

  // CREAR O EDITAR CAPÍTULO
  const guardarCapitulo = async (e) => {
    e.preventDefault();

    if (!titulo || !contenido) {
      alert("Llena todos los campos.");
      return;
    }

    try {
      if (editandoId) {
        // EDITAR EXISTENTE
        await updateDoc(doc(db, "capitulos", editandoId), {
          titulo,
          contenido,
          numero,
        });
      } else {
        // CREAR NUEVO
        await addDoc(collection(db, "capitulos"), {
          libroId,
          titulo,
          contenido,
          numero,
          createdAt: serverTimestamp(),
        });
      }

      // RESETEAR FORM
      setTitulo("");
      setContenido("");
      setNumero(null);
      setEditandoId(null);

    } catch (err) {
      console.error("Error guardando capítulo:", err);
    }
  };

  // CARGAR CAPÍTULO PARA EDICIÓN
  const editar = (cap) => {
    setEditandoId(cap.id);
    setTitulo(cap.titulo);
    setContenido(cap.contenido);
    setNumero(cap.numero);
  };

  // ELIMINAR CAPÍTULO
  const borrar = async (id) => {
    if (!confirm("¿Seguro que quieres borrar este capítulo?")) return;

    try {
      await deleteDoc(doc(db, "capitulos", id));
    } catch (err) {
      console.error("Error borrando capítulo:", err);
    }
  };

  return (
    <div className="capitulos-editor">
      <h2>Capítulos</h2>

      {/* FORMULARIO */}
      <form className="capitulo-form" onSubmit={guardarCapitulo}>
        <label>Número</label>
        <input
          type="number"
          value={numero ?? ""}
          onChange={(e) => setNumero(Number(e.target.value))}
          required
        />

        <label>Título del capítulo</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label>Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          required
        />

        <button type="submit">
          {editandoId ? "Guardar cambios" : "Agregar capítulo"}
        </button>
      </form>

      {/* LISTADO */}
      <ul className="lista-capitulos">
        {capitulos.map((cap) => (
          <li key={cap.id} className="capitulo-item">
            <strong>Cap. {cap.numero} — {cap.titulo}</strong>
            <div className="acciones">
              <button onClick={() => editar(cap)}>Editar</button>
              <button onClick={() => borrar(cap.id)}>Borrar</button>
            </div>
          </li>
        ))}
      </ul>

      {capitulos.length === 0 && (
        <p>Aún no tienes capítulos. Empieza a escribir, caramba.</p>
      )}
    </div>
  );
}
