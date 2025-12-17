import { useState } from "react";
import { db, storage } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../context/AuthContext";

export default function CrearLibroForm({ onCreated }) {
  const { user } = useAuth(); // tomamos el user completo
  const [titulo, setTitulo] = useState("");
  const [sinopsis, setSinopsis] = useState("");
  const [genero, setGenero] = useState("");
  const [portada, setPortada] = useState("");
  const [estado, setEstado] = useState("borrador");
  const [progreso, setProgreso] = useState("en_proceso");
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

  const crearLibro = async (e) => {
    e.preventDefault();
    if (!user) return alert("Necesitas iniciar sesión para crear un libro.");
    setLoading(true);

    try {
await addDoc(collection(db, "libros"), {
  titulo: titulo.trim(),
  sinopsis: sinopsis.trim(),
  genero: genero.trim().toLowerCase(),
  portada,
  autorId: user.uid,
  autorNombre: user.username || user.displayName || "Sin nombre",
  estado: estado.trim().toLowerCase(),
  estadoProgreso: progreso,
  permitirCalificacion: true,
  createdAt: serverTimestamp(),
  
  // ✅ Campos de denuncias inicializados
  denuncias: 0,
  usuariosDenunciaron: []
});


      onCreated && onCreated();

      setTitulo("");
      setSinopsis("");
      setGenero("");
      setPortada("");
      setEstado("borrador");
      setProgreso("en_proceso");
    } catch (err) {
      console.error("Error creando libro:", err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={crearLibro} className="crear-libro-form">
      <h2>Crear nuevo libro</h2>

      <label>Título</label>
      <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />

      <label>Sinopsis</label>
      <textarea value={sinopsis} onChange={(e) => setSinopsis(e.target.value)} required />

      <label>Género</label>
      <input value={genero} onChange={(e) => setGenero(e.target.value)} required />

      <label>Portada</label>
      <input type="file" accept="image/*" onChange={handlePortadaUpload} />
      {subiendo && <p>Subiendo portada...</p>}
      {portada && <img src={portada} alt="portada" style={{ width: 140, borderRadius: 10, marginTop: 12 }} />}

      <label>Estado de publicación</label>
      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="borrador">Borrador</option>
        <option value="publicado">Publicado</option>
      </select>

      <label>Progreso de la historia</label>
      <select value={progreso} onChange={(e) => setProgreso(e.target.value)}>
        <option value="en_proceso">En proceso</option>
        <option value="terminado">Terminado</option>
      </select>

      <button type="submit" disabled={loading || subiendo}>{loading ? "Creando..." : "Crear libro"}</button>
    </form>
  );
}