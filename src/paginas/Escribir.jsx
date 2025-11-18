import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext"; // <-- PARA OBTENER AUTOR
import { db, storage } from "../firebase/config"; // <-- TU RUTA CORRECTA
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Escribir() {
  const { user } = useAuth(); // Datos del usuario LOGEADO

  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [portadaArchivo, setPortadaArchivo] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const [contenido, setContenido] = useState("");
  const [permitirCalificacion, setPermitirCalificacion] = useState(true);
  const textareaRef = useRef(null);

  // === FORMATO DE TEXTO ===
  const aplicarFormato = (formato) => {
    const textarea = textareaRef.current;
    const inicio = textarea.selectionStart;
    const fin = textarea.selectionEnd;
    const textoSeleccionado = contenido.substring(inicio, fin);

    let nuevoTexto = contenido;

    if (formato === "bold") {
      nuevoTexto =
        contenido.substring(0, inicio) +
        `**${textoSeleccionado || "negrita"}**` +
        contenido.substring(fin);
    } else if (formato === "italic") {
      nuevoTexto =
        contenido.substring(0, inicio) +
        `*${textoSeleccionado || "cursiva"}*` +
        contenido.substring(fin);
    } else if (formato === "underline") {
      nuevoTexto =
        contenido.substring(0, inicio) +
        `<u>${textoSeleccionado || "subrayado"}</u>` +
        contenido.substring(fin);
    }

    setContenido(nuevoTexto);
    setTimeout(() => textarea.focus(), 0);
  };

  // === SUBIR PORTADA ===
  const manejarPortada = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortadaArchivo(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  };

  // === PUBLICAR HISTORIA A FIREBASE ===
  const publicarHistoria = async (e) => {
    e.preventDefault();

    if (!titulo.trim() || !genero || !contenido.trim() || !portadaArchivo) {
      alert("Por favor completa todos los campos y sube una portada.");
      return;
    }

    try {
      // 1️⃣ SUBIR PORTADA A STORAGE
      const portadaRef = ref(
        storage,
        `portadas/${Date.now()}-${portadaArchivo.name}`
      );

      await uploadBytes(portadaRef, portadaArchivo);
      const portadaURL = await getDownloadURL(portadaRef);

      // 2️⃣ GUARDAR LIBRO EN FIRESTORE
      await addDoc(collection(db, "libros"), {
        titulo,
        genero,
        contenido,
        permitirCalificacion,
        portada: portadaURL,
        autor: user?.displayName || "Autor desconocido",
        autorId: user?.uid || null,
        fecha: new Date(),
      });

      alert("📚 Historia publicada correctamente");

      // 3️⃣ REINICIAR FORMULARIO
      setTitulo("");
      setGenero("");
      setContenido("");
      setPortadaArchivo(null);
      setPortadaPreview(null);
      setPermitirCalificacion(true);
    } catch (error) {
      console.error(error);
      alert("❌ Error al publicar la historia.");
    }
  };

  return (
    <div className="escribir-container">
      <div className="escribir-card">
        <h2>✍️ Escribir nueva historia</h2>

        <form onSubmit={publicarHistoria}>
          {/* === TÍTULO === */}
          <div>
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Escribe el título de tu historia"
              required
            />
          </div>

          {/* === GÉNERO === */}
          <div>
            <label htmlFor="genero">Género</label>
            <select
              id="genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              required
            >
              <option value="">Selecciona un género</option>
              <option value="romance">💞 Romance</option>
              <option value="fantasia">🧚 Fantasía</option>
              <option value="ciencia-ficcion">🚀 Ciencia ficción</option>
              <option value="misterio">🕵️ Misterio</option>
              <option value="drama">🎭 Drama</option>
              <option value="terror">👻 Terror</option>
              <option value="comedia">😂 Comedia</option>
              <option value="aventura">🌍 Aventura</option>
            </select>
          </div>

          {/* === PORTADA === */}
          <div>
            <label htmlFor="portada">Portada</label>
            <input
              type="file"
              id="portada"
              accept="image/*"
              onChange={manejarPortada}
            />

            {portadaPreview && (
              <img
                src={portadaPreview}
                alt="Vista previa portada"
                className="portada-preview"
              />
            )}
          </div>

          {/* === BOTONES DE FORMATO === */}
          <div className="format-buttons">
            <button type="button" onClick={() => aplicarFormato("bold")}>
              <b>B</b>
            </button>
            <button type="button" onClick={() => aplicarFormato("italic")}>
              <i>I</i>
            </button>
            <button type="button" onClick={() => aplicarFormato("underline")}>
              <u>U</u>
            </button>
          </div>

          {/* === CONTENIDO === */}
          <div>
            <label htmlFor="contenido">Contenido</label>
            <textarea
              id="contenido"
              ref={textareaRef}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Empieza a escribir tu historia aquí..."
              required
            />
          </div>

          {/* === CALIFICACIÓN === */}
          <div className="checkbox-calificacion">
            <input
              type="checkbox"
              id="permitirCalificacion"
              checked={permitirCalificacion}
              onChange={(e) => setPermitirCalificacion(e.target.checked)}
            />
            <label htmlFor="permitirCalificacion">
              Permitir que los lectores califiquen mi libro ⭐
            </label>
          </div>

          <button type="submit" className="boton-publicar">
            Publicar historia
          </button>
        </form>
      </div>
    </div>
  );
}
