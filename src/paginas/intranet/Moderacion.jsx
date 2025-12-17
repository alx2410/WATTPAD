// src/paginas/moderacion/Moderacion.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Moderacion.css";

// Firestore
import { db } from "../../firebase/config";
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Presence
import { usePresence } from "../../context/PresenceContext";

// ===============================
// 👤 FILA DE USUARIO
// ===============================
function UsuarioRow({ u, cambiarRolUsuario, eliminarUsuario }) {
  const { listenToPresence } = usePresence();
  const [presencia, setPresencia] = useState({ estado: "offline" });

  useEffect(() => {
    if (!u?.id) return;
    const unsub = listenToPresence(u.id, setPresencia);
    return () => unsub && unsub();
  }, [u.id, listenToPresence]);

  const online = presencia.estado === "online";

  return (
    <tr>
      <td>{u.username || "—"}</td>
      <td>{u.email}</td>
      <td>{u.role}</td>
      <td>{online ? "🟢 Online" : "⚪ Offline"}</td>
      <td>
        <button
          className="btn-primario"
          onClick={() =>
            cambiarRolUsuario(u.id, u.role === "user" ? "admin" : "user")
          }
        >
          Cambiar rol
        </button>

        <button
          className="btn-secundario"
          onClick={() => eliminarUsuario(u.id)}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}

export default function Moderacion() {
  const navigate = useNavigate();
  const { user, cambiarRolUsuario, eliminarUsuario } = useAuth();

  const [tab, setTab] = useState("moderacion");
  const [campanias, setCampanias] = useState([]);
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");

  // ✅ CREAR CAMPAÑA (SETUP INICIAL)
  const crearCampaniaDemo = async () => {
    try {
      await addDoc(collection(db, "campañas"), {
        nombre: "Campaña Inicial",
        activa: true,
        hero: {
          titulo: "Bienvenido a Ficwin",
          subtitulo: "Publica, comparte y crece",
          imagen: "https://TU_IMAGEN_AQUI",
        },
        createdAt: serverTimestamp(),
      });
      alert("✅ Campaña creada");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Libros
  useEffect(() => {
    const q = query(collection(db, "libros"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => {
      setLibros(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
  }, []);

  // 🔥 Usuarios
  useEffect(() => {
    const q = query(collection(db, "usuarios"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // 🔥 Campañas
  useEffect(() => {
    const q = query(collection(db, "campañas"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => {
      setCampanias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // ✅ ACTIVAR CAMPAÑA
  const activarCampania = async (id) => {
    for (const c of campanias) {
      await updateDoc(doc(db, "campañas", c.id), { activa: false });
    }
    await updateDoc(doc(db, "campañas", id), { activa: true });
  };

  return (
    <div className="moderacion-layout">
      <aside className="moderacion-sidebar">
        <ul>
          <li onClick={() => setTab("moderacion")}>🛡 Moderación</li>
          <li onClick={() => setTab("usuarios")}>👤 Usuarios</li>
          <li onClick={() => setTab("campanias")}>🎯 Campañas</li>
        </ul>
      </aside>

      <main className="moderacion-content">
        <h2>Hola, {user?.username}</h2>

        {tab === "campanias" && (
          <>
            <button className="btn-primario" onClick={crearCampaniaDemo}>
              ➕ Crear campaña inicial
            </button>

            <table>
              <tbody>
                {campanias.map(c => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>{c.activa ? "🟢 Activa" : "⚪ Inactiva"}</td>
                    <td>
                      {!c.activa && (
                        <button onClick={() => activarCampania(c.id)}>
                          Activar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  );
}
