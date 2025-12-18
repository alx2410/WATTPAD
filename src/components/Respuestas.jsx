import { useState, useEffect } from "react";
import { db, storage } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import "../styles/Comunidad.css";
import { Link } from "react-router-dom"; // asegúrate de importarlo arriba

export default function Respuestas({ postId }) {
  const { user } = useAuth();

  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [imgComentario, setImgComentario] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [desplegado, setDesplegado] = useState(false);
  const [avatars, setAvatars] = useState({});

  // 🔄 Cargar comentarios en tiempo real
  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "feed", postId, "comentarios"),
      orderBy("fecha", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setComentarios(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return () => unsub();
  }, [postId]);

  // ☁️ Subir imagen del comentario
  const subirImagenComentario = async () => {
    if (!imgComentario) return "";

    const imgRef = ref(
      storage,
      `comentarios/${postId}/${Date.now()}-${imgComentario.name}`
    );

    await uploadBytes(imgRef, imgComentario);
    return await getDownloadURL(imgRef);
  };

  useEffect(() => {
  const unsub = onSnapshot(collection(db, "usuarios"), (snap) => {
    const map = {};
    snap.forEach(doc => {
      map[doc.id] = doc.data().avatar;
    });
    setAvatars(map);
  });

  return () => unsub();
}, []);

  // ✍️ Publicar comentario (texto + imagen opcional)
  const publicarComentario = async () => {
    if (!nuevoComentario.trim() && !imgComentario) return;
    if (!user) return;

    try {
      const imgUrl = await subirImagenComentario();

      await addDoc(collection(db, "feed", postId, "comentarios"), {
        uid: user.uid,
        autor: user.displayName || user.username || "Anon",
        texto: nuevoComentario.trim(),
        imgUrl: imgUrl || "",
        fecha: serverTimestamp(),
        fotoPerfil: user.photoURL || "/default-profile.png",
      });

      setNuevoComentario("");
      setImgComentario(null);
      setModalAbierto(false);
      setDesplegado(true);
    } catch (err) {
      console.error("Error al publicar comentario:", err);
    }
  };

  return (
    <div className="respuestas-container">

      {/* 💬 Icono abrir comentarios */}
      <button
        className="icon-btn"
        onClick={() => setModalAbierto(true)}
        title="Comentarios"
      >
        <span className="material-icons">chat_bubble</span>
      </button>

      {/* 🪟 Modal comentario */}
      {modalAbierto && (
  <div className="modal-bg" onClick={() => setModalAbierto(false)}>
    <div
      className="modal-comentario comunidad-composer"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Responder al post</h3>

      {/* Texto */}
      <textarea
        className="comunidad-composer-textarea"
        value={nuevoComentario}
        onChange={(e) => setNuevoComentario(e.target.value)}
        placeholder="Escribe tu respuesta..."
      />

      {/* Vista previa de imagen */}
      {imgComentario && (
        <div className="comunidad-composer-preview">
          <img
            src={URL.createObjectURL(imgComentario)}
            alt="preview"
          />
          <button
            className="comunidad-preview-remove"
            onClick={() => setImgComentario(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Acciones */}
      <div className="comunidad-composer-actions">
        <label className="comunidad-btn-img">
          📷 Img
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImgComentario(e.target.files[0])}
          />
        </label>

        <button
          className="comunidad-btn-publicar"
          onClick={publicarComentario}
        >
          Publicar
        </button>
      </div>
    </div>
  </div>
)}


      {/* 📂 Lista de comentarios */}
      {comentarios.length > 0 && (
        <div className="comentarios-desplegable">
          <button
            className="btn-desplegar"
            onClick={() => setDesplegado(!desplegado)}
          >
            {desplegado
              ? "Ocultar comentarios"
              : `Ver comentarios (${comentarios.length})`}
          </button>

          {desplegado && (
            <div className="comentarios-lista">
              {comentarios.map((c) => (
                <div key={c.id} className="comentario-card">
                  <img
  src={avatars[c.uid] || c.fotoPerfil || "/default-profile.png"}
  alt="Foto"
  className="foto-perfil"
/>



                  <div>
                    <Link
  to={`/perfil/${c.uid}`}
  style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
>
  {c.autor}
</Link>

                    <p className="post-texto">{c.texto}</p>

                    {c.imgUrl && (
  <div
    className="comentario-img-wrapper"
    onClick={() => window.open(c.imgUrl, "_blank")}
  >
    <img src={c.imgUrl} alt="comentario" />
  </div>
)}

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