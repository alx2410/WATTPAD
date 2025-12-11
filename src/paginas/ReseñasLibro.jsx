import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

export default function Comunidad({ libroId, usuario }) {

  const [reseñas, setReseñas] = useState([]);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");

  // CARGAR RESEÑAS
  useEffect(() => {
    if (!libroId) return;

    const q = query(
      collection(db, "reseñas"),
      where("libroId", "==", libroId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // ordenar por fecha más reciente
      data.sort((a, b) => {
        const fa = a.fecha?.seconds || 0;
        const fb = b.fecha?.seconds || 0;
        return fb - fa;
      });

      setReseñas(data);
    });

    return () => unsubscribe();
  }, [libroId]);

  // AGREGAR RESEÑA A FIREBASE
  const agregarReseña = async () => {
    if (!usuario) return;
    if (!comentario.trim() || estrellas === 0) return;

    await addDoc(collection(db, "reseñas"), {
      libroId,
      usuario: usuario.displayName 
        || usuario.email?.split("@")[0] 
        || "Usuario",
      avatar: usuario.photoURL || null,
      estrellas,
      comentario,
      likes: 0,
      dislikes: 0,
      fecha: serverTimestamp(),
      userId: usuario.uid
    });

    setComentario("");
    setEstrellas(0);
  };

  // ACTUALIZAR LIKE/DISLIKE EN FIREBASE
  const reaccionar = async (id, tipo) => {
    const ref = doc(db, "reseñas", id);
    const actual = reseñas.find(r => r.id === id);

    await updateDoc(ref, {
      likes: tipo === "like" ? actual.likes + 1 : actual.likes,
      dislikes: tipo === "dislike" ? actual.dislikes + 1 : actual.dislikes
    });
  };

  // Funcion para mostrar fecha bonita
  const formatearFecha = (f) => {
    if (!f?.seconds) return "";
    return new Date(f.seconds * 1000).toLocaleString();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reseñas</h2>

      {!usuario && (
        <p style={{ color: "#555", marginBottom: "15px" }}>
          Inicia sesión para dejar tu reseña.
        </p>
      )}

      <div style={{ marginBottom: "20px", opacity: usuario ? 1 : 0.4 }}>
        
        {/* ESTRELLAS */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              onClick={() => usuario && setEstrellas(i + 1)}
              style={{
                cursor: usuario ? "pointer" : "not-allowed",
                fontSize: "22px",
                color: i < estrellas ? "#f5b301" : "#aaa",
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* COMENTARIO */}
        <textarea
          placeholder="Escribe tu reseña..."
          value={comentario}
          onChange={(e) => usuario && setComentario(e.target.value)}
          disabled={!usuario}
          style={{
            width: "100%",
            height: "80px",
            padding: "10px",
            borderRadius: "8px",
          }}
        />

        <button
          onClick={agregarReseña}
          disabled={!usuario}
          style={{
            marginTop: "10px",
            padding: "10px",
            borderRadius: "8px",
            background: usuario ? "black" : "#999",
            color: "white",
            border: "none",
            cursor: usuario ? "pointer" : "not-allowed",
          }}
        >
          Publicar
        </button>
      </div>

      {/* LISTA DE RESEÑAS */}
      {reseñas.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {r.avatar && (
              <img
                src={r.avatar}
                alt="avatar"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )}
            <strong>{r.usuario}</strong>
          </div>

          <div>
            {Array.from({ length: r.estrellas }).map((_, i) => (
              <span key={i} style={{ color: "#f5b301", fontSize: "18px" }}>
                ★
              </span>
            ))}
          </div>

          <p style={{ marginTop: "5px" }}>{r.comentario}</p>

          <small style={{ color: "#666" }}>{formatearFecha(r.fecha)}</small>

          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>

            {/* LIKE */}
            <button
              onClick={() => reaccionar(r.id, "like")}
              style={{
                background: "none",
                border: "1px solid #ccc",
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12H3V10h4zM21 10a2 2 0 0 0-2-2h-6l1-4-3-1-1 5v13h9a2 2 0 0 0 2-2v-9z"/>
              </svg>
              {r.likes}
            </button>

            {/* DISLIKE */}
            <button
              onClick={() => reaccionar(r.id, "dislike")}
              style={{
                background: "none",
                border: "1px solid #ccc",
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 14V2H3v12h4zm14-2a2 2 0 0 1-2 2h-6l1 4-3 1-1-5V1h9a2 2 0 0 1 2 2v9z"/>
              </svg>
              {r.dislikes}
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}
