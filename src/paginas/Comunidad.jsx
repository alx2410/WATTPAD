import { useState, useEffect } from "react";
import { db, storage } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import Respuestas from "../components/Respuestas";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Comunidad.css";
import PopularBooksSidebar from "../components/PopularBooksSidebar";
import AnuncioCard from "../components/AnuncioCard";



export default function Comunidad() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState({});

  const [posts, setPosts] = useState([]);
  const [texto, setTexto] = useState("");
  const [fileImg, setFileImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [modalImg, setModalImg] = useState(null);

   // 🔥 CAMPAÑA ACTIVA (HERO)
  const [campaniaActiva, setCampaniaActiva] = useState(null);
  const [anuncios, setAnuncios] = useState([]);

  useEffect(() => {
  const q = query(
    collection(db, "anuncios"),
    where("activo", "==", true),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    setAnuncios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}, []);





  // ================== FEED ==================
  useEffect(() => {
    const q = query(collection(db, "feed"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

   // ================== CAMPAÑA ACTIVA ==================
  useEffect(() => {
    const q = query(
      collection(db, "campañas"),
      where("activa", "==", true),
      limit(1)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCampaniaActiva({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      } else {
        setCampaniaActiva(null);
      }
    });

    return () => unsub();
  }, []);




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


  // ================== IMAGEN ==================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileImg(file);
    setPreviewImg(URL.createObjectURL(file));
  };

  const subirImagen = async () => {
    if (!fileImg) return "";
    const imgRef = ref(storage, `feed/${Date.now()}-${fileImg.name}`);
    await uploadBytes(imgRef, fileImg);
    return await getDownloadURL(imgRef);
  };

  // ================== POST ==================
  const handlePost = async () => {
    if (!texto && !fileImg) return;
    if (!user) return alert("Debes iniciar sesión.");

    let imgUrl = "";
    if (fileImg) imgUrl = await subirImagen();

    await addDoc(collection(db, "feed"), {
      texto,
      imgUrl,
      autor: user.displayName || user.username,
      fotoPerfil: user.avatar || "/default-profile.png",
      uid: user.uid,
      fecha: serverTimestamp(),
      likesUsuarios: [],
      dislikesUsuarios: [],
    });

    setTexto("");
    setFileImg(null);
    setPreviewImg(null);
  };

  // ================== LIKES ==================
  const handleLike = async (post) => {
    if (!user) return;
    const postRef = doc(db, "feed", post.id);
    const liked = post.likesUsuarios?.includes(user.uid);
    const disliked = post.dislikesUsuarios?.includes(user.uid);
    await updateDoc(postRef, {
      likesUsuarios: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      ...(disliked && { dislikesUsuarios: arrayRemove(user.uid) }),
    });
  };

  const handleDislike = async (post) => {
    if (!user) return;
    const postRef = doc(db, "feed", post.id);
    const disliked = post.dislikesUsuarios?.includes(user.uid);
    const liked = post.likesUsuarios?.includes(user.uid);
    await updateDoc(postRef, {
      dislikesUsuarios: disliked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      ...(liked && { likesUsuarios: arrayRemove(user.uid) }),
    });
  };

  return (
    <div className="comunidad-page">

      {/* ================= HERO ================= */}
        <section
        className="comunidad-hero-container"
        style={{
          backgroundImage: campaniaActiva?.hero?.imagen
            ? `url(${campaniaActiva.hero.imagen})`
            : undefined,
        }}
      >
        <div className="comunidad-hero-texto">
          <p className="comunidad-hero-subtitulo">
            {campaniaActiva?.hero?.subtitulo ||
              "DONDE LOS ESCRITORES SE ESFUERZAN"}
          </p>

          <h1 className="comunidad-hero-titulo">
            {campaniaActiva?.hero?.titulo || "Bienvenida a la Comunidad"}
          </h1>

          <p className="comunidad-hero-descripcion">
            {campaniaActiva?.hero?.descripcion ||
              "Descubre historias increíbles"}
          </p>


    <button
      className="comunidad-hero-btn"
      onClick={() => navigate("/ficwin")}
    >
      Ficwin
    </button>
  </div>

  {/* Cubos de fondo */}
  <div className="comunidad-hero-cubo comunidad-hero-cubo-1">FICWIN</div>
  <div className="comunidad-hero-cubo comunidad-hero-cubo-2">FICWIN</div>
  <div className="comunidad-hero-cubo comunidad-hero-cubo-3">FICWIN</div>
</section>

      {/* ================= LAYOUT ================= */}
      <div className="comunidad-container">
        <div className="comunidad-layout">

          {/* LEFT - Anuncios */}
         <aside className="comunidad-sidebar-left">
  <h2>📰 Anuncios</h2>

  {anuncios.length === 0 && (
    <p className="anuncio-vacio">No hay anuncios</p>
  )}

  {anuncios.map((a) => (
    <AnuncioCard
      key={a.id}
      titulo={a.titulo}
      descripcion={a.descripcion}
      bannerUrl={a.bannerUrl}
    />
  ))}
</aside>



          {/* CENTER - Posts */}
          <main className="comunidad-posts-section">
            <div className="comunidad-form-publicar">
              <textarea
                placeholder="¿Qué estás leyendo hoy?"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {previewImg && (
                <img
                  src={previewImg}
                  className="comunidad-preview-img"
                  alt="preview"
                />
              )}
              <button onClick={handlePost} className="comunidad-btn-publicar">
                Publicar
              </button>
            </div>

            {posts.map((p, index) => (
              <div key={p.id}>
                {index % 5 === 0 && index !== 0 && (
                  <div className="comunidad-anuncio-card">📢 Anuncio</div>
                )}

                <div className="comunidad-post-card">
                  <Link to={`/perfil/${p.uid}`} className="comunidad-usuario-info">
                    <img
  src={avatars[p.uid] || p.fotoPerfil || "/default-profile.png"}
  className="comunidad-foto-perfil"
/>

                    <span>{p.autor}</span>
                  </Link>

                  <p>{p.texto}</p>

                  {p.imgUrl && (
                    <img
                      src={p.imgUrl}
                      className="comunidad-post-img"
                      onClick={() => setModalImg(p.imgUrl)}
                    />
                  )}

                  <div className="comunidad-post-reacciones">
                    <button onClick={() => handleLike(p)}>👍 {p.likesUsuarios?.length || 0}</button>
                    <button onClick={() => handleDislike(p)}>👎 {p.dislikesUsuarios?.length || 0}</button>
                    <Respuestas postId={p.id} />
                  </div>
                </div>
              </div>
            ))}
          </main>

          {/* RIGHT - Recomendados */}
          <aside className="comunidad-sidebar-right">
            <PopularBooksSidebar />
          </aside>

        </div>
      </div>

      {modalImg && (
        <div className="comunidad-modal-bg" onClick={() => setModalImg(null)}>
          <img src={modalImg} className="comunidad-modal-img" />
        </div>
      )}
      
    </div>
  );
}