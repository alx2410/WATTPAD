import { useState } from "react";
import { db, storage } from "../../firebase/config";
import { auth } from "../../firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CrearLibroForm({ onCreated }) {
  const [titulo, setTitulo] = useState("");
  const [sinopsis, setSinopsis] = useState("");
  const [genero, setGenero] = useState("");
  const [portada, setPortada] = useState("");
  const [estado, setEstado] = useState("borrador"); // Borrador o Publicado
  const [progreso, setProgreso] = useState("en_proceso"); // en_proceso | terminado
  const [loading, setLoading] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // ===============================
  // SUBIR PORTADA DESDE EL PC
  // ===============================
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

  // ===============================
  // CREAR LIBRO
  // ===============================
  const crearLibro = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Necesitas iniciar sesión para crear un libro.");
        setLoading(false);
        return;
      }

      const docRef = await addDoc(collection(db, "libros"), {
        titulo,
        sinopsis,
        genero: genero.toLowerCase(),
        portada,
        autorId: user.uid,
        autorNombre: user.displayName || "Autor desconocido",
        estado,          // Borrador o Publicado
        estadoProgreso: progreso, // en_proceso | terminado
        permitirCalificacion: true,
        createdAt: serverTimestamp(),
      });

      onCreated(docRef.id);

      // Reset
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
    <form className="crear-libro-form" onSubmit={crearLibro}>
      <h2>Crear nuevo libro</h2>

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

      <label>Portada (imagen desde tu PC)</label>
      <input type="file" accept="image/*" onChange={handlePortadaUpload} />
      {subiendo && <p>Subiendo portada...</p>}
      {portada && (
        <img
          src={portada}
          alt="portada"
          style={{ width: "140px", marginTop: "12px", borderRadius: "10px" }}
        />
      )}

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

      <button className="boton-crear" type="submit" disabled={loading || subiendo}>
        {loading ? "Creando..." : "Crear libro"}
      </button>
    </form>
  );
}
