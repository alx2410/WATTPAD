
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
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { Link } from "react-router-dom";
import "../styles/ReseñasLibros.css";

export default function Comunidad({ libroId, usuario }) {
  const [reseñas, setReseñas] = useState([]);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [yaReseño, setYaReseño] = useState(false);

  useEffect(() => {
    if (!libroId) return;

    const q = query(collection(db, "reseñas"), where("libroId", "==", libroId));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
      setReseñas(data);
      if (usuario) setYaReseño(data.some(r => r.userId === usuario.uid));
    });

    return () => unsub();
  }, [libroId, usuario]);

  const publicarReseña = async () => {
    if (!usuario || estrellas === 0 || yaReseño) return;

    await addDoc(collection(db, "reseñas"), {
      libroId,
      userId: usuario.uid,
      usuario: usuario.displayName || "Usuario",
      avatar: usuario.photoURL || null,
      estrellas,
      comentario: comentario.trim(),
      likes: 0,
      dislikes: 0,
      fecha: serverTimestamp()
    });

    const snap = await getDocs(query(collection(db, "reseñas"), where("libroId", "==", libroId)));
    const total = snap.size;
    const suma = snap.docs.reduce((acc, d) => acc + d.data().estrellas, 0);
    const rating = +(suma / total).toFixed(1);

    await updateDoc(doc(db, "libros", libroId), { rating, totalReseñas: total });

    setComentario("");
    setEstrellas(0);
  };

  return (
    <div className="reseñas-container">
      <h2 className="reseñas-titulo">Reseñas</h2>

      {!usuario && <p>Inicia sesión para dejar una reseña.</p>}

      {usuario && !yaReseño && (
        <div className="reseñas-form">
          <div className="reseñas-estrellas">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                onClick={() => setEstrellas(i + 1)}
                className={i < estrellas ? "activo" : ""}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="reseñas-textarea"
            placeholder="Comentario (opcional)"
            value={comentario}
            onChange={e => setComentario(e.target.value)}
          />

          <button className="reseñas-btn" onClick={publicarReseña}>
            Publicar reseña
          </button>
        </div>
      )}

      {usuario && yaReseño && <p className="reseñas-aviso">Ya dejaste una reseña en este libro.</p>}

      <div className="reseñas-lista">
        {reseñas.map(r => (
          <div key={r.id} className="reseñas-card">
            <div className="reseñas-header">
              {r.avatar && <img src={r.avatar} alt="avatar" className="reseñas-avatar" />}
              <Link to={`/perfil/${r.userId}`} className="reseñas-usuario">{r.usuario}</Link>
              <div className="reseñas-fecha">{r.fecha?.seconds ? new Date(r.fecha.seconds * 1000).toLocaleDateString() : ""}</div>
            </div>

            <div className="reseñas-estrellas-card">
              {Array.from({ length: r.estrellas }).map((_, i) => <span key={i}>★</span>)}
            </div>

            {r.comentario && <p className="reseñas-comentario">{r.comentario}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
