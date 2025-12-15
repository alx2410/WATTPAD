import { useEffect, useState } from "react";
import { db,storage } from "../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
export default function EditarLibro({ libroId }) {
  const [titulo, setTitulo] = useState("");
  const [sinopsis, setSinopsis] = useState("");
  const [genero, setGenero] = useState("");
  const [portada, setPortada] = useState("");
  const [estado, setEstado] = useState("borrador"); // borrador / publicado
  const [estadoProgreso, setEstadoProgreso] = useState("en_proceso"); // en proceso / terminado
  const [loading, setLoading] = useState(false);
  const [subiendo, setSubiendo] = useState(false);


   const handlePortadaUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      setSubiendo(true);
      try {
        const fileRef = ref(storage, `portadas/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        setPortada(url);
      } catch (err) {
        console.error("Error subiendo portada:", err);
      }
      setSubiendo(false);
    };
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
          setEstadoProgreso(d.estadoProgreso || "en_proceso");
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
      estadoProgreso
    });

    // ❌ Eliminado alert
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

       <label>Portada</label>
      <input type="file" accept="image/*" onChange={handlePortadaUpload} />
      {subiendo && <p>Subiendo portada...</p>}
      {portada && <img src={portada} alt="portada" style={{ width: 140, borderRadius: 10, marginTop: 12 }} />}


      <label>Estado</label>
      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="borrador">Borrador</option>
        <option value="publicado">Publicado</option>
      </select>

      <label>Progreso de la historia</label>
      <select
        value={estadoProgreso}
        onChange={(e) => setEstadoProgreso(e.target.value)}
      >
        <option value="en_proceso">En proceso</option>
        <option value="terminado">Terminado</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
