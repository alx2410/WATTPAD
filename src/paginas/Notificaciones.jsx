// src/paginas/Notificaciones.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Notificaciones() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Ruta: usuarios/{uid}/notificaciones
    const ref = collection(db, "usuarios", user.uid, "notificaciones");
    const q = query(ref, orderBy("fecha", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setNotifs(arr);
    });

    return () => unsub();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: "20px" }}>
        Debes iniciar sesión para ver tus notificaciones.
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "10px" }}>Mis notificaciones</h1>

      {notifs.length === 0 ? (
        <p>No tienes notificaciones nuevas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifs.map((n) => (
            <li
              key={n.id}
              style={{
                background: "#fff7f3",
                border: "1px solid #ffd4c4",
                borderRadius: "12px",
                padding: "12px 15px",
                marginBottom: "10px"
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>{n.titulo}</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem" }}>
                {n.mensaje}
              </p>
              <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
                {n.fecha?.toDate().toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
