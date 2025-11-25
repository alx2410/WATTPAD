// src/pages/PerfilPublico.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/PerfilPublico.css";

export default function PerfilPublico() {
  const { uid } = useParams();
  const [datos, setDatos] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        // Obtener datos del usuario
        const userRef = doc(db, "usuarios", uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setDatos("no-existe");
          setCargando(false);
          return;
        }

        setDatos(snap.data());

        // Obtener historias del usuario
        const q = query(
          collection(db, "historias"),
          where("autorUid", "==", uid)
        );

        const historiasSnap = await getDocs(q);
        setHistorias(
          historiasSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (e) {
        console.error(e);
      }

      setCargando(false);
    };

    cargarPerfil();
  }, [uid]);

  if (cargando) return <p className="texto-carga">Cargando perfil...</p>;

  if (datos === "no-existe")
    return <p className="mensaje-error">Este usuario no existe.</p>;

  return (
    <div className="perfil-publico-container">
      <div className="perfil-header">
        <img
          src={datos.avatar || "https://via.placeholder.com/150"}
          alt="avatar"
          className="perfil-avatar"
        />

        <div>
          <h1 className="perfil-nombre">{datos.username}</h1>
          <p className="perfil-bio">
            {datos.bio || "Este usuario aún no ha escrito una biografía."}
          </p>
        </div>
      </div>

      <h2 className="titulo-seccion">Historias publicadas</h2>

      {historias.length === 0 ? (
        <p className="mensaje-vacio">Este usuario no tiene historias aún.</p>
      ) : (
        <div className="lista-historias">
          {historias.map((h) => (
            <div key={h.id} className="historia-card">
              <img
                src={h.portada || "https://via.placeholder.com/200x280"}
                alt="portada"
                className="historia-portada"
              />
              <p className="historia-titulo">{h.titulo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
