import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import LibroSidebar from "../components/escribir/LibroSidebar";
import EditarLibro from "../components/escribir/EditarLibro";
import CapitulosEditor from "../components/escribir/CapitulosEditor";
import "../styles/Escribir.css";
import EncuestaButton from "../components/EncuestaButton";


export default function Escribir() {
  const { user } = useAuth();
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [tituloNuevoLibro, setTituloNuevoLibro] = useState("");

  if (!user) return <p>Debes iniciar sesión para escribir libros.</p>;

  // Función para enviar notificación a tus seguidores
  const notificarSeguidores = async (mensaje, tituloLibro) => {
    try {
      // Obtener lista de seguidores
      const seguidoresSnap = await getDocs(collection(db, "usuarios", user.uid, "seguidores"));
      seguidoresSnap.forEach(async (seguidorDoc) => {
        const seguidorId = seguidorDoc.id;
        await addDoc(collection(db, "usuarios", seguidorId, "notificaciones"), {
          tipo: "historia",
          texto: mensaje,
          tituloHistoria: tituloLibro,
          visto: false,
          fecha: serverTimestamp(),
          fromUID: user.uid,
          nombreAutor: user.displayName || "Autor",
        });
      });
    } catch (err) {
      console.error("Error notificando a seguidores:", err);
    }
  };

  // Crear libro y notificación a seguidores
  const crearLibro = async () => {
    if (!tituloNuevoLibro) return;

    try {
      const libroRef = await addDoc(collection(db, "libros"), {
        titulo: tituloNuevoLibro,
        autorId: user.uid,
        autorNombre: user.displayName || "Autor",
        fechaCreacion: serverTimestamp(),
      });

      await notificarSeguidores(`Ha publicado un nuevo libro: ${tituloNuevoLibro}`, tituloNuevoLibro);

      setLibroSeleccionado(libroRef.id);
      setTituloNuevoLibro("");
      console.log("Libro creado y notificación enviada a seguidores ✅");
    } catch (error) {
      console.error("Error creando libro:", error);
    }
  };

  // Crear capítulo y notificación a seguidores
  const crearCapitulo = async (titulo, contenido) => {
    if (!titulo || !libroSeleccionado) return;

    try {
      await addDoc(collection(db, `libros/${libroSeleccionado}/capitulos`), {
        titulo,
        contenido,
        fechaCreacion: serverTimestamp(),
      });

      const libroSnap = await getDoc(doc(db, "libros", libroSeleccionado));
      const libro = libroSnap.data();

      await notificarSeguidores(`Ha publicado un nuevo capítulo: ${titulo}`, libro.titulo);

      console.log("Capítulo creado y notificación enviada a seguidores ✅");
    } catch (error) {
      console.error("Error creando capítulo:", error);
    }
  };

  return (
    <div className="escribir-contenedor">
      <LibroSidebar onSelect={setLibroSeleccionado} />

      <div className="escribir-contenido">
        {!libroSeleccionado && (
          <div style={{ marginBottom: 20 }}>
            <h2>Crear nuevo libro</h2>
            <input
              type="text"
              placeholder="Título del libro"
              value={tituloNuevoLibro}
              onChange={(e) => setTituloNuevoLibro(e.target.value)}
              style={{ padding: 6, width: "70%", marginRight: 10 }}
            />
            <button onClick={crearLibro} style={{ padding: "6px 12px" }}>
              Crear libro
            </button>
          </div>
        )}

        {libroSeleccionado && (
          <>
            <EditarLibro libroId={libroSeleccionado} />
            <CapitulosEditor libroId={libroSeleccionado} crearCapitulo={crearCapitulo} />
          </>
        )}
      </div>
    </div>
  );
}
