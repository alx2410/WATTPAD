// src/componentes/Perfil.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/Perfil.css";

// ===== MOCKS =====
const mockHistorias = [
  {
    id: 1,
    titulo: "La Reina de Hielo",
    descripcion: "Una historia de magia, traición y un destino congelado.",
    portada: "https://via.placeholder.com/200x280",
  },
  {
    id: 2,
    titulo: "Sombras del Pasado",
    descripcion: "Un misterio que regresa para cambiarlo todo.",
    portada: "https://via.placeholder.com/200x280",
  },
];

const mockSeguidores = [
  {
    id: 1,
    nickname: "LunaVelvet",
    usuario: "@lunita",
    foto: "https://via.placeholder.com/80",
    historias: 12,
    seguidores: 250,
    siguiendo: 51,
  },
  {
    id: 2,
    nickname: "LeoWriter",
    usuario: "@leo_w",
    foto: "https://via.placeholder.com/80",
    historias: 4,
    seguidores: 88,
    siguiendo: 12,
  },
];

export default function Perfil() {
  const { uid: uidPerfil } = useParams(); // uid del perfil a visitar
  const { user, updateProfileData, getMuro, publicarPost, seguirUsuario, dejarDeSeguirUsuario, obtenerSiguiendo } = useAuth();

  // si uidPerfil existe → estamos viendo un perfil ajeno
  // si no existe → es nuestro perfil normal
  const esPerfilAjeno = Boolean(uidPerfil);
  const uidObjetivo = esPerfilAjeno ? uidPerfil : user.uid;

  // ===== DATOS DEL PERFIL =====
  const [datosPerfil, setDatosPerfil] = useState(null);
  const [esPropio, setEsPropio] = useState(false);
  const [yaSigo, setYaSigo] = useState(false);

  // ===== TU ESTADO ORIGINAL =====
  const [tab, setTab] = useState("info");
  const [posts, setPosts] = useState([]);
  const [nuevoPost, setNuevoPost] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // =========================
  // 1. Cargar Perfil Objetivo
  // =========================
  useEffect(() => {
    async function fetchPerfil() {
      const ref = doc(db, "usuarios", uidObjetivo);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setDatosPerfil(data);
        setDisplayName(data.username || "Sin nombre");
        setBio(data.bio || "");
        setPreview(data.avatar || data.photoURL || "");

      }

      setEsPropio(!esPerfilAjeno || user?.uid === uidPerfil);
    }

    fetchPerfil();
  }, [uidObjetivo, uidPerfil, user]);

  // =============================
  // 2. Saber si YA SIGO al usuario
  // =============================
  useEffect(() => {
    if (!user || !esPerfilAjeno) return;

    async function checkFollow() {
      const siguiendo = await obtenerSiguiendo(user.uid);
      setYaSigo(siguiendo.includes(uidPerfil));
    }

    checkFollow();
  }, [user, uidPerfil, esPerfilAjeno]);

  // =============================
  // 3. Cargar Muro del usuario
  // =============================
  useEffect(() => {
    async function cargarMuro() {
      const data = await getMuro(uidObjetivo);
      setPosts(data);
    }
    cargarMuro();
  }, [uidObjetivo, getMuro]);

  // =============================
  // 4. Alternar seguimiento
  // =============================
  const toggleFollow = async () => {
    if (yaSigo) {
      await dejarDeSeguirUsuario(uidPerfil);
      setYaSigo(false);
    } else {
      await seguirUsuario(uidPerfil);
      setYaSigo(true);
    }
  };

  // =============================
  // 5. Editar perfil (si es mío)
  // =============================
  const handleFileChange = (e) => {
    const img = e.target.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
    }
  };

  const guardarCambios = async () => {
    try {
      await updateProfileData({ displayName, bio, file });
      alert("Perfil actualizado ✔");
      setEditMode(false);
    } catch (error) {
      alert("Error al actualizar perfil");
    }
  };

  // =============================
  // 6. Publicar en muro (solo propio)
  // =============================
  const publicarEnMuro = async () => {
    if (!nuevoPost.trim()) return;

    const nuevo = await publicarPost(nuevoPost);
    setPosts((prev) => [nuevo, ...prev]);
    setNuevoPost("");
  };

  if (!datosPerfil) return <p>Cargando perfil...</p>;

  // ====================================================================================
  // ===========================   HTML DEL PERFIL (el tuyo)   ===========================
  // ====================================================================================

  return (
    <div className="perfil-container">
      {/* ===================== ENCABEZADO ===================== */}
      <div className="perfil-header">

        <img src={preview} alt="avatar" className="perfil-avatar" />

        <div>
          {!editMode ? (
            <>
              <h2 className="perfil-nombre">{datosPerfil.username}</h2>
              <p className="perfil-username">@{datosPerfil.email?.split("@")[0]}</p>

              <div className="perfil-stats">
                <span><strong>Historias:</strong> 2</span>
                <span><strong>Listas:</strong> 1</span>
                <span><strong>Seguidores:</strong> {datosPerfil.seguidores?.length || 0}</span>
                <span><strong>Siguiendo:</strong> {datosPerfil.siguiendo?.length || 0}</span>
              </div>

              {/* === BOTÓN SEGUIR SOLO SI ES PERFIL AJENO === */}
              {!esPropio && (
                <button
                  onClick={toggleFollow}
                  className={`btn-follow ${yaSigo ? "siguiendo" : ""}`}
                >
                  {yaSigo ? "Siguiendo" : "Seguir"}
                </button>
              )}

              {/* === BOTÓN EDITAR SOLO SI ES MI PERFIL === */}
              {esPropio && (
                <button className="btn-editar" onClick={() => setEditMode(true)}>
                  Editar perfil
                </button>
              )}
            </>
          ) : (
            <>
              <input
                className="input-text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <textarea
                className="textarea-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tu biografía..."
              ></textarea>

              <label className="file-label">
                Cambiar foto
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>

              <button className="btn-guardar" onClick={guardarCambios}>
                Guardar cambios
              </button>

              <button className="btn-cancelar" onClick={() => setEditMode(false)}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===================== PESTAÑAS ===================== */}
      <div className="perfil-tabs">
        <button onClick={() => setTab("info")} className={tab === "info" ? "active" : ""}>
          INFO
        </button>

        <button onClick={() => setTab("muro")} className={tab === "muro" ? "active" : ""}>
          MURO
        </button>

        <button
          onClick={() => setTab("seguidores")}
          className={tab === "seguidores" ? "active" : ""}
        >
          SEGUIDORES
        </button>
      </div>

      {/* ===================== INFO ===================== */}
      {tab === "info" && (
        <div className="info-layout">
          <div className="info-col-1">
            <h3>Biografía</h3>
            <p>{bio || "Aún no has escrito tu biografía."}</p>

            <h3>Siguiendo</h3>
            <p>Próximamente...</p>

            <h3>Último post</h3>
            {posts[0] ? <p>{posts[0].texto}</p> : <p>No has publicado aún.</p>}
          </div>

          <div className="info-col-2">
            <h3>Historias de {datosPerfil.username}</h3>

            {mockHistorias.map((h) => (
              <div key={h.id} className="historia-card">
                <div className="historia-content">
                  <h4>{h.titulo}</h4>
                  <p>{h.descripcion}</p>
                </div>
                <img src={h.portada} alt="portada" className="historia-portada" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== MURO ===================== */}
      {tab === "muro" && (
        <div className="muro">

          {esPropio && (
            <div className="muro-publicar">
              <textarea
                value={nuevoPost}
                onChange={(e) => setNuevoPost(e.target.value)}
                placeholder="Escribe algo en tu muro..."
              ></textarea>
              <button onClick={publicarEnMuro} className="btn-editar">Publicar</button>
            </div>
          )}

          {posts
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .map((post) => (
              <div key={post.id} className="muro-post">
                <img src={post.foto} className="post-avatar" />

                <div className="post-contenido">
                  <p className="post-autor">{post.autor}</p>
                  <p className="post-texto">{post.texto}</p>
                  <span className="post-fecha">
                    {new Date(post.fecha).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

          {posts.length === 0 && <p>No hay publicaciones aún.</p>}
        </div>
      )}

      {/* ===================== SEGUIDORES ===================== */}
      {tab === "seguidores" && (
        <div className="seguidores-grid">
          {mockSeguidores.map((seg) => (
            <div key={seg.id} className="seguidor-card">
              <img src={seg.foto} className="seguidor-avatar" />
              <h4>{seg.nickname}</h4>
              <p className="seg-username">{seg.usuario}</p>

              <div className="seguidor-stats">
                <p>📘 Historias: {seg.historias}</p>
                <p>👥 Seguidores: {seg.seguidores}</p>
                <p>➡️ Siguiendo: {seg.siguiendo}</p>
              </div>

              <button className="btn-ver">Ver perfil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
