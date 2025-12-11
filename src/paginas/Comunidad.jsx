import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "../styles/Comunidad.css";

export default function Comunidad() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [texto, setTexto] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    const q = query(collection(db, "feed"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handlePost = async () => {
    if (!texto && !imgUrl) return;
    if (!user) return alert("Debes iniciar sesión.");

    await addDoc(collection(db, "feed"), {
      texto,
      imgUrl,
      autor: user.username,
      uid: user.uid,
      fecha: serverTimestamp(),
    });

    setTexto("");
    setImgUrl("");
  };

  return (
    <div className="comunidad-container">
      <div className="comunidad-layout">

        {/* ================= LEFT ================= */}
        <aside className="sidebar-left">
          <h2 className="sidebar-titulo">📰 Noticias</h2>

          <div className="sidebar-item">🔥 Top ventas del mes</div>
          <div className="sidebar-item">⭐ Mejores calificados</div>
          <div className="sidebar-item">📢 Actualizaciones</div>
        </aside>

        {/* ================= CENTER (POSTS) ================= */}
        <main className="posts-section">

          {/* === Formulario para publicar === */}
          <div className="form-publicar">
            <textarea
              placeholder="¿Qué estás leyendo hoy?..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <input
              type="text"
              placeholder="Imagen URL (opcional)"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
            />
            <button onClick={handlePost} className="btn-publicar">
              Publicar
            </button>
          </div>

          {/* === FEED === */}
          {posts.map((p, index) => (
            <div key={p.id}>
              {/* anuncio automático */}
              {index % 5 === 0 && index !== 0 && (
                <div className="anuncio-card">📢 Anuncio automático</div>
              )}

              <div className="post-card">
                <p className="post-autor">{p.autor}</p>
                <p className="post-texto">{p.texto}</p>
                {p.imgUrl && (
                  <img src={p.imgUrl} alt="post" style={{ width: "100%", borderRadius: "12px" }} />
                )}
              </div>
            </div>
          ))}
        </main>

        {/* ================= RIGHT ================= */}
        <aside className="sidebar-right">
          <h2 className="sidebar-right-title">📚 Recomendados</h2>
          <p>📘 El niño con el pijama de rayas</p>
          <p>📗 Harry Potter</p>
          <p>📙 Los juegos del hambre</p>
        </aside>
      </div>
    </div>
  );
}
