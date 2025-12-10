import { storage } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/config";
import { query, orderBy, onSnapshot } from "firebase/firestore";

import "../styles/Perfil.css";

export default function Perfil() {
  const { uid: uidPerfil } = useParams();
  const navigate = useNavigate();
  const { user, getMuro, publicarPost, seguirUsuario, dejarSeguirUsuario, updateProfileData } = useAuth();

  const esPerfilAjeno = Boolean(uidPerfil);
  const uidObjetivo = esPerfilAjeno ? uidPerfil : user?.uid;

  // ===== ESTADOS =====
  const [datosPerfil, setDatosPerfil] = useState(null);
  const [esPropio, setEsPropio] = useState(false);
  const [yaSigo, setYaSigo] = useState(false);

  const [seguidoresCount, setSeguidoresCount] = useState(0);
  const [siguiendoCount, setSiguiendoCount] = useState(0);

  const [tab, setTab] = useState("info");
  const [posts, setPosts] = useState([]);
  const [nuevoPost, setNuevoPost] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [showSiguiendoModal, setShowSiguiendoModal] = useState(false);
  const [listaSiguiendo, setListaSiguiendo] = useState([]);
  const [paginaSiguiendo, setPaginaSiguiendo] = useState(1);
  const [cargandoMas, setCargandoMas] = useState(false);
  const ITEMS_POR_PAGINA = 9;

  const [ultimaCargaUid, setUltimaCargaUid] = useState(null);

  const [listaSeguidores, setListaSeguidores] = useState([]);
  const [historias, setHistorias] = useState([]);

  const [menuAbierto, setMenuAbierto] = useState(null);

  const [busquedaLibro, setBusquedaLibro] = useState("");
const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
const [leyendoAhora, setLeyendoAhora] = useState(null);

const [notificaciones, setNotificaciones] = useState([]);



  // =========================
  // 1. Cargar Perfil
  // =========================
  useEffect(() => {
    async function fetchPerfil() {
      if (!uidObjetivo) return;
      const ref = doc(db, "usuarios", uidObjetivo);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setDatosPerfil({
          ...data,
          seguidores: [],
          siguiendo: [],
        });
        setDisplayName(data.username || "Sin nombre");
        setBio(data.bio || "");
        setPreview(data.avatar || data.photoURL || "");
      } else {
        setDatosPerfil(null);
      }
      setEsPropio(user?.uid === uidObjetivo);
    }
    fetchPerfil();
  }, [uidObjetivo, uidPerfil, user]);

  /////////////////////////////////////////////

useEffect(() => {
  async function buscar() {
    if (!busquedaLibro.trim()) {
      setResultadosBusqueda([]);
      return;
    }

    try {
      const snap = await getDocs(collection(db, "historias")); // ← AQUÍ EL CAMBIO

      const lista = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(lib =>
          lib.titulo?.toLowerCase?.().includes(busquedaLibro.toLowerCase())
        );

      setResultadosBusqueda(lista);
    } catch (err) {
      console.error("Error al buscar historias:", err);
    }
  }

  buscar();
}, [busquedaLibro]);

  // =========================
  // NOTIFICACIONES
  // =========================

useEffect(() => {
  if (!user) return;

  const q = query(
    collection(db, "usuarios", user.uid, "notificaciones"),
    orderBy("fecha", "desc")
  );

  const unsub = onSnapshot(q, (snap) => {
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setNotificaciones(lista);
  });

  return () => unsub();
}, [user]);


/////////////////////////////////////////////////////////////////////////

const seleccionarLeyendoAhora = async (libro) => {
  if (!user) return;

  try {
    const refLeyendo = doc(db, "usuarios", user.uid, "leyendo", libro.id);

    await setDoc(refLeyendo, {
      libroId: libro.id,
      titulo: libro.titulo,
      descripcion: libro.descripcion || "",
      portada: libro.portada || "",
      timestamp: serverTimestamp()
    });

    setLeyendoAhora(libro);
    setBusquedaLibro("");         // limpia barra
    setResultadosBusqueda([]);    // limpia lista

    alert("Lectura actual actualizada.");
  } catch (err) {
    console.error("Error al guardar lectura:", err);
  }
};


///////////////////////////////////////////////

useEffect(() => {
  if (!uidObjetivo) return;

  async function cargarLeyendo() {
    try {
      const ref = collection(db, "usuarios", uidObjetivo, "leyendo");
      const snap = await getDocs(ref);

      if (snap.empty) {
        setLeyendoAhora(null);
        return;
      }

      // Solo hay 1 lectura, así tomamos la primera
      const data = snap.docs[0].data();
      setLeyendoAhora(data);
    } catch (err) {
      console.error("Error cargando lectura actual:", err);
    }
  }

  cargarLeyendo();
}, [uidObjetivo]);



  // =========================
  // 2. Cargar seguidores y siguiendo
  // =========================
  useEffect(() => {
    if (!user || !datosPerfil || !uidObjetivo) return;

    async function cargarCounts() {
      const snapSeguidores = await getDocs(collection(db, "usuarios", uidObjetivo, "seguidores"));
      const seguidores = snapSeguidores.docs.map(d => d.id);

      const snapSiguiendo = await getDocs(collection(db, "usuarios", uidObjetivo, "siguiendo"));
      const siguiendo = snapSiguiendo.docs.map(d => d.id);

      setSeguidoresCount(seguidores.length);
      setSiguiendoCount(siguiendo.length);

      setDatosPerfil(prev => ({
        ...prev,
        seguidores,
        siguiendo,
      }));

      // reset de paginación si cambia de perfil
      if (ultimaCargaUid !== uidObjetivo) {
        setPaginaSiguiendo(1);
        setListaSiguiendo([]);
        setUltimaCargaUid(uidObjetivo);
      }
    }
    cargarCounts();
  }, [uidObjetivo, user, datosPerfil, ultimaCargaUid]);

  // =========================
  // 3. Saber si ya sigo
  // =========================
  useEffect(() => {
    if (!user || !esPerfilAjeno) return;

    async function checkFollow() {
      const snap = await getDocs(collection(db, "usuarios", user.uid, "siguiendo"));
      const siguiendo = snap.docs.map(d => d.id);
      setYaSigo(siguiendo.includes(uidPerfil));
    }
    checkFollow();
  }, [user, uidPerfil, esPerfilAjeno]);

  // =========================
  // 4. Cargar muro
  // =========================
useEffect(() => {
  if (!uidObjetivo) return;

  const q = query(
    collection(db, "muro"),
    orderBy("fecha", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    setPosts(prevPosts => {
      const prevMap = prevPosts.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      const nuevosPosts = snapshot.docs.map(doc => {
        const p = doc.data();
        const existing = prevMap[doc.id] || {};

        return {
          id: doc.id,
          uid: p.uid,
          autor: p.autor,
          texto: p.texto,
          fecha: p.fecha,
          foto: p.foto || "",
          likesUsuarios: p.likesUsuarios || existing.likesUsuarios || [],
          dislikesUsuarios: p.dislikesUsuarios || existing.dislikesUsuarios || [],
          likes: (p.likesUsuarios || existing.likesUsuarios || []).length,
          dislikes: (p.dislikesUsuarios || existing.dislikesUsuarios || []).length,
          editando: existing.editando || false,
          textoEditado: existing.textoEditado || p.texto || "",
          editado: p.editado || false,  // 👈 NUEVO

        };
      });

      return nuevosPosts;
    });
  });

  return () => unsubscribe();
}, [uidObjetivo]);

// =========================
// 5. Toggle Follow
// =========================
const toggleFollow = async () => {
  if (!user) return;

  setYaSigo(prev => !prev);

  if (yaSigo) {
    // DEJAR DE SEGUIR
    await dejarSeguirUsuario(user.uid, uidPerfil);

    setDatosPerfil(prev => ({
      ...prev,
      seguidores: prev.seguidores.filter(id => id !== user.uid),
    }));

    setSeguidoresCount(prev => prev - 1);

  } else {
    // SEGUIR
    await seguirUsuario(user.uid, uidPerfil);

    // Actualizar estado local primero
    setDatosPerfil(prev => ({
      ...prev,
      seguidores: [...prev.seguidores, user.uid],
    }));

    setSeguidoresCount(prev => prev + 1);

    // Crear notificación después
    await addDoc(
      collection(db, "usuarios", uidPerfil, "notificaciones"),
      {
        tipo: "follow",
        fromUID: user.uid,
        nombreAutor: user.displayName || user.email || "Usuario",
        fecha: serverTimestamp(),
        leida: false
      }
    );
  }
};

  


  const toggleMenu = (postId) => {
  setMenuAbierto(prev => (prev === postId ? null : postId));
};



  // =========================
  // 6. Editar perfil
  // =========================
  const handleFileChange = e => {
    const img = e.target.files[0];
    if (img) {
      setFile(img);
      setPreview(URL.createObjectURL(img));
    }
  };

const guardarCambios = async () => {
  if (!user) return;

  try {
    const refUsuario = doc(db, "usuarios", user.uid);
    let avatarURL = preview;

    // Si subieron una nueva imagen, subimos a Storage
    if (file) {
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      avatarURL = await getDownloadURL(storageRef);
    }

    // Actualizamos Firestore
    await setDoc(
      refUsuario,
      { username: displayName, bio, avatar: avatarURL },
      { merge: true }
    );

    // Actualizamos estado local
    setDatosPerfil(prev => ({
      ...prev,
      username: displayName,
      bio,
      avatar: avatarURL
    }));

    alert("Perfil actualizado ✔");
    setEditMode(false);
    setFile(null); // limpiar archivo cargado
  } catch (err) {
    console.error(err);
    alert("Error al actualizar perfil");
  }
};


// ===================================================
// Cargar SOLO las historias (libros) del usuario
// ===================================================
useEffect(() => {
  if (!uidObjetivo) return;

  async function cargarLibros() {
    try {
      const ref = collection(db, "libros");
      const snap = await getDocs(ref);

      const librosDelUsuario = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(libro => libro.autorId === uidObjetivo);

      setHistorias(librosDelUsuario);
    } catch (err) {
      console.error("Error cargando libros:", err);
    }
  }

  cargarLibros();
}, [uidObjetivo]);


  // =======================================================
// Cargar lista de seguidores COMPLETA (con foto y username)
// =======================================================
useEffect(() => {
  if (!uidObjetivo || seguidoresCount === 0) {
    setListaSeguidores([]);
    return;
  }

  async function cargarSeguidores() {
    try {
      const refSeg = collection(db, "usuarios", uidObjetivo, "seguidores");
      const snap = await getDocs(refSeg);

      const seguidoresUIDs = snap.docs.map(d => d.id);

      // Convertir cada UID en datos reales del usuario
      const datos = await Promise.all(
        seguidoresUIDs.map(async (uid) => {
          const info = await getDoc(doc(db, "usuarios", uid));
          if (!info.exists()) return null;

          const data = info.data();

          // 🔥 Cargar cantidad de historias de este seguidor
          const librosSnap = await getDocs(
            collection(db, "libros")
          );
          const historias = librosSnap.docs.filter(
            libro => libro.data().autorId === uid
          ).length;

          // 🔥 Cargar cantidad de seguidores de este seguidor
          const segSnap = await getDocs(
            collection(db, "usuarios", uid, "seguidores")
          );
          const seguidores = segSnap.size;

          return {
            uid,
            nickname: data.username || "Sin nombre",
            usuario: data.email?.split("@")[0] || "user",
            foto: data.avatar || data.photoURL || "",
            historias,
            seguidores,
          };
        })
      );

      setListaSeguidores(datos.filter(Boolean));
    } catch (err) {
      console.error("Error cargando seguidores:", err);
    }
  }

  cargarSeguidores();
}, [uidObjetivo, seguidoresCount]);




  // =========================
  // 7. Publicar en muro
  // =========================
 const publicarEnMuro = async () => {
  if (!esPropio || !nuevoPost.trim() || !user) return;

  try {
    const fotoPerfil = datosPerfil?.avatar || user.photoURL || "";

    // 1. Publicar en muro
    const postRef = await addDoc(collection(db, "muro"), {
      uid: user.uid,
      autor: datosPerfil?.username || user.displayName || user.email,
      texto: nuevoPost.trim(),
      fecha: serverTimestamp(),
      foto: fotoPerfil,
      likesUsuarios: [],
      dislikesUsuarios: []
    });

    setNuevoPost("");

    // 2. Obtener seguidores
    const seguidoresSnap = await getDocs(
      collection(db, "usuarios", user.uid, "seguidores")
    );

    const seguidoresUIDs = seguidoresSnap.docs.map(d => d.id);

    // 3. Crear notificación para cada seguidor
    for (const segUID of seguidoresUIDs) {
      await addDoc(
        collection(db, "usuarios", segUID, "notificaciones"),
        {
          tipo: "muro",
          fromUID: user.uid,
          nombreAutor: datosPerfil?.username,
          texto: nuevoPost,
          postId: postRef.id,
          fecha: serverTimestamp(),
          leida: false
        }
      );
    }

  } catch (err) {
    console.error("publicarEnMuro error:", err);
    alert("No se pudo publicar en el muro.");
  }
};




  // =========================
  // 8. Likes / Dislikes
  // =========================
  const toggleLike = async postId => {
    const postActualizado = posts.map(p => {
      if (p.id !== postId) return p;

      const likesUsuarios = p.likesUsuarios || [];
      const dislikesUsuarios = p.dislikesUsuarios || [];
      const yaDioLike = likesUsuarios.includes(user.uid);

      let nuevosLikes = yaDioLike ? likesUsuarios.filter(uid => uid !== user.uid) : [...likesUsuarios, user.uid];
      let nuevosDislikes = dislikesUsuarios.filter(uid => uid !== user.uid);

      return {
        ...p,
        likes: nuevosLikes.length,
        dislikes: nuevosDislikes.length,
        likesUsuarios: nuevosLikes,
        dislikesUsuarios: nuevosDislikes
      };
    });

    setPosts(postActualizado);

    const post = postActualizado.find(p => p.id === postId);
    if (!post) return;
    const postRef = doc(db, "muro", postId);
    await setDoc(postRef, { likesUsuarios: post.likesUsuarios, dislikesUsuarios: post.dislikesUsuarios }, { merge: true });
  };

  const darDislike = async postId => {
    const postActualizado = posts.map(p => {
      if (p.id !== postId) return p;

      const likesUsuarios = p.likesUsuarios || [];
      const dislikesUsuarios = p.dislikesUsuarios || [];
      const yaDioDislike = dislikesUsuarios.includes(user.uid);

      const nuevosDislikes = yaDioDislike ? dislikesUsuarios.filter(uid => uid !== user.uid) : [...dislikesUsuarios, user.uid];
      const nuevosLikes = likesUsuarios.filter(uid => uid !== user.uid);

      return {
        ...p,
        likes: nuevosLikes.length,
        dislikes: nuevosDislikes.length,
        likesUsuarios: nuevosLikes,
        dislikesUsuarios: nuevosDislikes,
      };
    });

    setPosts(postActualizado);

    const post = postActualizado.find(p => p.id === postId);
    if (!post) return;
    const postRef = doc(db, "muro", postId);
    await setDoc(postRef, { likesUsuarios: post.likesUsuarios, dislikesUsuarios: post.dislikesUsuarios }, { merge: true });
  };

  // =========================
  // 9. Editar y borrar posts
  // =========================
  const activarEdicion = postId => setPosts(prev => prev.map(p => p.id === postId ? { ...p, editando: true, textoEditado: p.texto } : p));
  const cancelarEdicion = postId => setPosts(prev => prev.map(p => p.id === postId ? { ...p, editando: false } : p));
  const guardarEdicion = async postId => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const postRef = doc(db, "muro", postId);
      await setDoc(
  postRef,
  { 
    texto: post.textoEditado,
    editado: true  // 👈 AÑADIDO
  },
  { merge: true }
);

setPosts(prev =>
  prev.map(p =>
    p.id === postId
      ? { ...p, texto: post.textoEditado, editando: false, editado: true } // 👈 AÑADIDO
      : p
  )
);

      setPosts(prev => prev.map(p => p.id === postId ? { ...p, texto: post.textoEditado, editando: false } : p));
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la edición.");
    }
    
  };

  const borrarPost = async postId => {
    if (!confirm("¿Eliminar publicación?")) return;
    try {
      await deleteDoc(doc(db, "muro", postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("No se pudo borrar la publicación.");
    }
  };

  // =========================
  // 10. Cargar siguiendo (modal)
  // =========================
  const cargarSiguiendo = async reset => {
    if (!datosPerfil) return;
    const segs = datosPerfil.siguiendo || [];

    if (segs.length <= ITEMS_POR_PAGINA) {
      const lista = await Promise.all(segs.map(async uid => {
        const snap = await getDoc(doc(db, "usuarios", uid));
        if (!snap.exists()) return null;
        const data = snap.data();
        return { uid, nickname: data.username, usuario: data.email?.split("@")[0], foto: data.avatar || data.photoURL || "" };
      }));
      setListaSiguiendo(lista.filter(Boolean));
      return;
    }

    setCargandoMas(true);
    const paginaActual = reset ? 1 : paginaSiguiendo;
    const start = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const lote = segs.slice(start, start + ITEMS_POR_PAGINA);

    const nuevos = await Promise.all(lote.map(async uid => {
      const snap = await getDoc(doc(db, "usuarios", uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      return { uid, nickname: data.username, usuario: data.email?.split("@")[0], foto: data.avatar || data.photoURL || "" };
    }));

    if (reset) setListaSiguiendo(nuevos.filter(Boolean));
    else setListaSiguiendo(prev => [...prev, ...nuevos.filter(Boolean)]);

    setPaginaSiguiendo(paginaActual + 1);
    setCargandoMas(false);
  };

  if (!datosPerfil) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      {/* =======================================================
           ENCABEZADO
      ======================================================= */}
      <div className="perfil-header">
        <img src={preview} alt="avatar" className="perfil-avatar" />

        <div>
          {!editMode ? (
            <>
              <h2 className="perfil-nombre">{datosPerfil.username}</h2>
              <p className="perfil-username">@{datosPerfil.email?.split("@")[0]}</p>

              <div className="perfil-stats">
                <span>
                  <strong>Historias:</strong> {historias.length}
                </span>
                <span>
                  <strong>Listas:</strong> 1
                </span>
                <span>
                  <strong>Seguidores:</strong> {seguidoresCount}
                </span>

                <span
                  className="clickable"
                  onClick={() => {
                    setShowSiguiendoModal(true);
                    setListaSiguiendo([]);
                    setPaginaSiguiendo(1);
                    cargarSiguiendo(true);
                  }}
                >
                  <strong>Siguiendo:</strong> {siguiendoCount}
                </span>
              </div>

              {!esPropio && (
                <button onClick={toggleFollow} className={`btn-editar ${yaSigo ? "siguiendo" : ""}`}>
                  {yaSigo ? "Siguiendo" : "Seguir"}
                </button>
              )}

              {esPropio && (
                <button className="btn-editar" onClick={() => setEditMode(true)}>
                  Editar perfil
                </button>
              )}
            </>
          ) : (
            <>
              <input className="input-text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <textarea className="textarea-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tu biografía..."></textarea>

              <label className="file-label">
                Cambiar foto
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>

              <div className="editar-lectura-actual">

  <input
    type="text"
    className="input-text"
    placeholder="Selecciona tu lectura actual..."
    value={busquedaLibro}
    onChange={(e) => setBusquedaLibro(e.target.value)}
  />

  {resultadosBusqueda.length > 0 && (
    <div className="resultado-busqueda-lista">
      {resultadosBusqueda.map((lib) => (
        <div
          key={lib.id}
          className="resultado-item"
          onClick={() => seleccionarLeyendoAhora(lib)}
          style={{
            cursor: "pointer",
            padding: "6px",
            borderBottom: "1px solid #ddd"
          
          }}
        >
          {lib.titulo}
        </div>
      ))}
    </div>
  )}

  {/* Vista previa de lo que escogiste */}
  {leyendoAhora && (
    <p style={{ marginTop: "6px", fontStyle: "italic", color: "gray" }}>
      Seleccionado: {leyendoAhora.titulo}
    </p>
  )}
</div>

          
              <button onClick={guardarCambios} className="btn-editar">Guardar cambios</button>
              <button className="btn-cancelar" onClick={() => setEditMode(false)}>Cancelar</button>
            </>
          )}
        </div>
      </div>

      {/* =======================================================
           PESTAÑAS
      ======================================================= */}
      <div className="perfil-tabs">
        <button onClick={() => setTab("info")} className={tab === "info" ? "active" : ""}>INFO</button>
        <button onClick={() => setTab("muro")} className={tab === "muro" ? "active" : ""}>MURO</button>
        <button onClick={() => setTab("seguidores")} className={tab === "seguidores" ? "active" : ""}>SEGUIDORES</button>
      </div>

<div className="perfil-contenido">
      {/* =======================================================
           INFO
      ======================================================= */}
      {tab === "info" && (
        <div className="info-layout">
          <div className="info-col-1">
            <h3>Biografía</h3>
            <p>{bio || "Aún no has escrito tu biografía."}</p>

            <h3>Lectura actual</h3>

{leyendoAhora ? (
  <div className="leyendo-ahora-card" style={{ marginTop: "10px" }}>
    <p style={{ margin: "0 0 6px 0" }}>
      Estás leyendo ahora mismo:
    </p>

    <div
      className="historia-card"
      onClick={() => navigate(`/libro/${leyendoAhora.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="historia-content">
        <h4>{leyendoAhora.titulo}</h4>
        <p>{leyendoAhora.descripcion}</p>
      </div>

      {leyendoAhora.portada && (
        <img src={leyendoAhora.portada} className="historia-portada"/>
      )}
    </div>
  </div>
) : (
  <p>No tienes una lectura actual.</p>
)}


            <h3>Último post</h3>
{(() => {
  const postsUsuario = posts
    .filter(p => p.uid === uidObjetivo)
    .sort((a, b) => {
      const fechaA = a.fecha?.seconds ? a.fecha.toDate() : new Date(a.fecha);
      const fechaB = b.fecha?.seconds ? b.fecha.toDate() : new Date(b.fecha);
      return fechaB - fechaA; // Más nuevo arriba
    });

  return postsUsuario.length
    ? <p className="ultimo-post-texto">{postsUsuario[0].texto}</p>
    : <p>No has publicado aún.</p>;
})()}

          </div>

          <div className="info-col-2">
            <h3>Historias de {datosPerfil.username}</h3>

            {historias.length === 0 && <p>Este usuario aún no tiene historias.</p>}

            {historias.map((h) => (
  <div
    key={h.id}
    className="historia-card"
    onClick={() => navigate(`/libro/${h.id}`)}
    style={{ cursor: "pointer" }}
  >
    <div className="historia-content">
      <h4>{h.titulo}</h4>

      {h.genero && (
        <p className="genero-label"> {h.genero}</p>
      )}

      <p>{h.descripcion}</p>
    </div>

    {h.portada && (
      <img src={h.portada} alt="portada" className="historia-portada" />
    )}
  </div>
))}

          </div>
        </div>
      )}

{/* =======================================================
     MURO
======================================================= */}
{tab === "muro" && (
  <div className="muro">
    {/* Solo mostrar textarea si es tu perfil */}
    {esPropio && (
      <div className="muro-publicar">
        <textarea
          value={nuevoPost}
          onChange={(e) => setNuevoPost(e.target.value)}
          placeholder="Escribe algo en tu muro..."
        ></textarea>
        <button onClick={publicarEnMuro} className="btn-editar">
          Publicar
        </button>
      </div>
    )}

    {posts.length ? (
      posts
        .filter((post) => post.uid === uidObjetivo)
        .sort((a, b) => {
          const fechaA = a.fecha?.seconds
            ? a.fecha.toDate()
            : new Date(a.fecha);
          const fechaB = b.fecha?.seconds
            ? b.fecha.toDate()
            : new Date(b.fecha);
          return fechaB - fechaA; // 🔥 Más nuevo arriba
        })
        .map((post) => (
          <div key={post.id} className="muro-post">

            {/* 🔥 AQUI REGRESAMOS LA FOTO COMO ANTES */}
            {post.foto && (
              <img src={post.foto} className="post-avatar" alt="foto" />
            )}

            <div className="post-contenido">
              <p className="post-autor">{post.autor}</p>

              {/* TEXTO */}
{!post.editando ? (
  <p className="post-texto">{post.texto}</p>
  
) : (
  <textarea
    value={post.textoEditado}
    onChange={(e) =>
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, textoEditado: e.target.value } : p
                      )
                    )
                  }
                />
              )}

              {/* FECHA */}
{post.fecha && (
  <span className="post-fecha">
    {(post.fecha?.toDate
      ? post.fecha.toDate()
      : new Date(post.fecha)
    ).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
    
    {/*  MOSTRAR (EDITADO) JUNTO A LA FECHA */}
    {post.editado && (
      <span className="post-editado"> (EDITADO)</span>
    )}
  </span>
)}


  {/* BOTÓN DE 3 PUNTOS ARRIBA A LA DERECHA */}
  {post.uid === user?.uid && !post.editando && (
    <div className="post-menu-wrapper">
      <button
        className="icon-btn menu-btn"
        onClick={() => toggleMenu(post.id)}
      >
        <span className="material-icons">more_vert</span>
      </button>

      {menuAbierto === post.id && (
        <div className="post-menu">
          <button onClick={() => activarEdicion(post.id)}>
            <span className="material-icons">edit</span> Editar
          </button>

          <button onClick={() => borrarPost(post.id)}>
            <span className="material-icons">delete</span> Borrar
          </button>
        </div>
      )}
    </div>
  )}

  {/* REACCIONES */}
  <div className="post-reacciones">
    <button className="icon-btn" onClick={() => toggleLike(post.id)}>
      <span className="material-icons">thumb_up</span> {post.likes || 0}
    </button>

    <button className="icon-btn" onClick={() => darDislike(post.id)}>
      <span className="material-icons">thumb_down</span> {post.dislikes || 0}
    </button>

    {post.editando && (
      <button className="icon-btn" onClick={() => guardarEdicion(post.id)}>
        <span className="material-icons">save</span>
      </button>
    )}

</div>


            </div>
          </div>
        ))
    ) : (
      <p>No hay publicaciones aún.</p>
    )}
  </div>
)}



      {/* =======================================================
           SEGUIDORES
      ======================================================= */}
      {tab === "seguidores" && (
        <div className="seguidores-grid">
          {listaSeguidores.length ? (
            listaSeguidores.map((seg) => (
              <div key={seg.uid} className="seguidor-card" onClick={() => navigate(`/perfil/${seg.uid}`)}>
                <img src={seg.foto} className="seguidor-avatar" />

                <div className="seguidor-info">
                  <h4>{seg.nickname}</h4>
                  <p>@{seg.usuario}</p>
                  <p>📖 {seg.historias} historias</p>
                  <p>👥 {seg.seguidores} seguidores</p>
                </div>
              </div>
            ))
          ) : (
            <p>No tienes seguidores aún.</p>
          )}
        </div>
      )}

      {/* MODAL SIGUIENDO */}
      {showSiguiendoModal && (
        <div className="modal-overlay" onClick={() => setShowSiguiendoModal(false)}>
          <div className="modal-siguiendo" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar-modal" onClick={() => setShowSiguiendoModal(false)}>✕</button>
            <h3 className="titulo-modal">({datosPerfil.siguiendo.length}) Siguiendo</h3>

            <div className="modal-lista">
              {listaSiguiendo.map((u) => (
                <div key={u.uid} className="modal-item" onClick={() => navigate(`/perfil/${u.uid}`)}>
                  <img src={u.foto} className="modal-avatar" />
                  <div>
                    <p className="modal-nick">{u.nickname}</p>
                    <p className="modal-user">@{u.usuario}</p>
                  </div>
                </div>
              ))}
            </div>

            {listaSiguiendo.length < datosPerfil.siguiendo.length && (
              <button className="btn-cargar" onClick={() => cargarSiguiendo(false)} disabled={cargandoMas}>
                {cargandoMas ? "Cargando..." : "Cargar más"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}





