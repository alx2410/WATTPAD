import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "../styles/Comunidad.css";

export default function Respuestas({ postId }) {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [desplegado, setDesplegado] = useState(false);

  // Cargar comentarios en tiempo real
  useEffect(() => {
    if (!postId) return;
    const q = query(
      collection(db, "feed", postId, "comentarios"),
      orderBy("fecha", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setComentarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [postId]);

  // Publicar comentario
  const publicarComentario = async () => {
    if (!nuevoComentario.trim() || !user) return;
    try {
      await addDoc(collection(db, "feed", postId, "comentarios"), {
        uid: user.uid,
        autor: user.displayName || user.username || "Anon",
        texto: nuevoComentario.trim(),
        fecha: serverTimestamp(),
        fotoPerfil: user.photoURL || "/default-profile.png",
      });
      setNuevoComentario("");
      setModalAbierto(false);
      setDesplegado(true); // Mostrar automáticamente al comentar
    } catch (err) {
      console.error("Error al publicar comentario:", err);
    }
  };

  return (
    <div className="respuestas-container">

      {/* Icono para abrir modal */}
      <button
        className="icon-btn"
        onClick={() => setModalAbierto(true)}
        title="Comentarios"
      >
        <span className="material-icons">chat_bubble</span>
      </button>

      {/* Modal para escribir comentario */}
      {modalAbierto && (
        <div className="modal-bg" onClick={() => setModalAbierto(false)}>
          <div
            className="modal-comentario"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Escribe un comentario</h3>
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe tu comentario..."
            />
            <button className="btn-comentar" onClick={publicarComentario}>
              Publicar
            </button>
            <button
              className="btn-cancelar"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Sección plegable de comentarios */}
      {comentarios.length > 0 && (
        <div className="comentarios-desplegable">
          <button
            className="btn-desplegar"
            onClick={() => setDesplegado(!desplegado)}
          >
            {desplegado ? "Ocultar comentarios" : `Ver comentarios (${comentarios.length})`}
          </button>

          {desplegado && (
            <div className="comentarios-lista">
              {comentarios.map((c) => (
                <div key={c.id} className="comentario-card">
                  <img
                    src={c.fotoPerfil || "/default-profile.png"}
                    alt="Foto"
                    className="foto-perfil"
                  />
                  <div>
                    <p className="nombre-usuario">{c.autor}</p>
                    <p className="post-texto">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}