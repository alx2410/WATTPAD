import { useState, useEffect } from "react";
import { db, storage } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import Respuestas from "../components/Respuestas";
import { Link } from "react-router-dom";
import "../styles/Comunidad.css";
import PopularBooksSidebar from "../components/PopularBooksSidebar";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";


export default function Comunidad() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [texto, setTexto] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [fileImg, setFileImg] = useState(null);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "feed"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const subirImagen = async () => {
    if (!fileImg) return null;
    const imgRef = ref(storage, `feed/${Date.now()}-${fileImg.name}`);
    await uploadBytes(imgRef, fileImg);
    return await getDownloadURL(imgRef);
  };

  const handlePost = async () => {
    if (!texto && !imgUrl && !fileImg) return;
    if (!user) return alert("Debes iniciar sesión.");

    let finalImgUrl = imgUrl;
    if (fileImg) {
      finalImgUrl = await subirImagen();
    }

    await addDoc(collection(db, "feed"), {
      texto,
      imgUrl: finalImgUrl || "",
      autor: user.displayName || user.username,
      fotoPerfil: user.photoURL || "/default-profile.png",
      uid: user.uid,
      fecha: serverTimestamp(),
      likesUsuarios: [],
      dislikesUsuarios: [],
    });

    setTexto("");
    setImgUrl("");
    setFileImg(null);
  };
  const handleLike = async (post) => {
  if (!user) return alert("Inicia sesión para dar like");

  const postRef = doc(db, "feed", post.id);

  const yaDioLike = post.likesUsuarios?.includes(user.uid);
  const yaDioDislike = post.dislikesUsuarios?.includes(user.uid);

  if (yaDioLike) {
    await updateDoc(postRef, {
      likesUsuarios: arrayRemove(user.uid),
    });
  } else {
    await updateDoc(postRef, {
      likesUsuarios: arrayUnion(user.uid),
      ...(yaDioDislike && {
        dislikesUsuarios: arrayRemove(user.uid),
      }),
    });
  }
};

const handleDislike = async (post) => {
  if (!user) return alert("Inicia sesión para dar dislike");

  const postRef = doc(db, "feed", post.id);

  const yaDioDislike = post.dislikesUsuarios?.includes(user.uid);
  const yaDioLike = post.likesUsuarios?.includes(user.uid);

  if (yaDioDislike) {
    await updateDoc(postRef, {
      dislikesUsuarios: arrayRemove(user.uid),
    });
  } else {
    await updateDoc(postRef, {
      dislikesUsuarios: arrayUnion(user.uid),
      ...(yaDioLike && {
        likesUsuarios: arrayRemove(user.uid),
      }),
    });
  }
};


  return (
    <div className="comunidad-container">
      <div className="comunidad-layout">

        {/* LEFT */}
        <aside className="comunidad-sidebar-left">
          <h2 className="comunidad-sidebar-titulo">📰 Categorías</h2>
          <Link to="/top-ventas" className="comunidad-sidebar-item">🔥 Top ventas del mes</Link>
          <Link to="/mejores-calificados" className="comunidad-sidebar-item">⭐ Mejores calificados</Link>
          <Link to="/actualizaciones" className="comunidad-sidebar-item">📢 Actualizaciones</Link>
          <Link to="/ficwin" className="comunidad-sidebar-item">📖 Ficwin</Link>
        </aside>

        {/* CENTER */}
        <main className="comunidad-posts-section">
          <div className="comunidad-form-publicar">
            <textarea
              placeholder="¿Qué estás leyendo hoy?... (Texto)"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <input
              type="text"
              placeholder="Imagen por URL (opcional)"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFileImg(e.target.files[0])}
            />
            <button onClick={handlePost} className="comunidad-btn-publicar">
              Publicar
            </button>
          </div>

          {posts.map((p, index) => (
            <div key={p.id}>
              {index % 5 === 0 && index !== 0 && (
                <div className="comunidad-anuncio-card">📢 Anuncio automático</div>
              )}

              <div className="comunidad-post-card">
                
                {/* PERFIL CLICKEABLE */}
                <Link
                  to={`/perfil/${p.uid}`}
                  className="comunidad-usuario-info"
                >
                  <img
                    src={p.fotoPerfil || "/default-profile.png"}
                    alt="Foto"
                    className="comunidad-foto-perfil"
                  />
                  <span className="comunidad-nombre-usuario">
                    {p.autor}
                  </span>
                </Link>

                <p className="comunidad-post-texto">{p.texto}</p>

                {p.imgUrl && (
                  <img
                    src={p.imgUrl}
                    className="comunidad-post-img-tw"
                    onClick={() => setModalImg(p.imgUrl)}
                  />
                )}

                <div className="comunidad-post-reacciones">
                  <button
  className={`comunidad-icon-btn ${
    p.likesUsuarios?.includes(user?.uid) ? "activo" : ""
  }`}
  onClick={() => handleLike(p)}
>
  👍 {p.likesUsuarios?.length || 0}
</button>

<button
  className={`comunidad-icon-btn ${
    p.dislikesUsuarios?.includes(user?.uid) ? "activo" : ""
  }`}
  onClick={() => handleDislike(p)}
>
  👎 {p.dislikesUsuarios?.length || 0}
</button>

                  <button className="comunidad-icon-btn">🔁 Repost</button>

                  <Respuestas postId={p.id} />
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* RIGHT */}
        <aside className="comunidad-sidebar-right">
          <h2 className="comunidad-sidebar-right-title">📚 Recomendados</h2>
          <PopularBooksSidebar />
        </aside>

      </div>

      {modalImg && (
        <div className="comunidad-modal-bg" onClick={() => setModalImg(null)}>
          <img src={modalImg} className="comunidad-modal-img" />
        </div>
      )}
    </div>
  );
}
