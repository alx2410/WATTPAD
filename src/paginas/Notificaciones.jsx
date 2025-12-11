import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Notificaciones() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "usuarios", user.uid, "notificaciones");
    const q = query(ref, orderBy("fecha", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  if (!user) {
    return <div style={{ padding: 20 }}>Debes iniciar sesión para ver tus notificaciones.</div>;
  }

  const handleClickNoti = (n) => {
    switch (n.tipo) {
      case "follow":
        navigate(`/perfil/${n.fromUID}`);
        break;

      case "muro":
        navigate(`/perfil/${n.fromUID}`);
        break;

      case "historia":
        navigate(n.historiaID ? `/historia/${n.historiaID}` : `/perfil/${n.fromUID}`);
        break;

      case "comentario":
        navigate(n.historiaID ? `/historia/${n.historiaID}` : `/perfil/${n.fromUID}`);
        break;

      default:
        break;
    }
  };

  const renderMensaje = (n) => {
    switch (n.tipo) {
      case "follow":
        return (
          <p style={{ margin: 0, fontWeight: 600 }}>
            {n.nombreAutor} comenzó a seguirte
          </p>
        );

      case "muro":
        return (
          <>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {n.nombreAutor} publicó un nuevo anuncio
            </p>
            <p style={{ marginTop: 6, fontSize: "0.9rem" }}>{n.texto}</p>
          </>
        );

      case "historia":
        return (
          <>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {n.nombreAutor} publicó una nueva historia
            </p>
            <p style={{ marginTop: 6, fontStyle: "italic" }}>{n.tituloHistoria}</p>
          </>
        );

      case "comentario":
        return (
          <>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {n.nombreAutor} ha respondido:
            </p>
            <p style={{ marginTop: 6, fontSize: "0.9rem" }}>{n.texto}</p>
          </>
        );

      default:
        return <p>Notificación desconocida</p>;
    }
  };

  const icono = (tipo) => {
    switch (tipo) {
      case "follow": return "person_add";
      case "muro": return "campaign";
      case "historia": return "book";
      case "comentario": return "chat_bubble";
      default: return "notifications";
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 15 }}>Mis notificaciones</h1>

      {notifs.length === 0 ? (
        <p>No tienes notificaciones nuevas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifs.map((n) => (
            <li
              key={n.id}
              onClick={() => handleClickNoti(n)}
              style={{
                display: "flex",
                gap: 12,
                background: "#fff7f3",
                border: "1px solid #ffd4c4",
                borderRadius: 12,
                padding: "12px 15px",
                marginBottom: 10,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#ffe9df"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff7f3"}
            >
              <span className="material-icons" style={{ fontSize: 32 }}>
                {icono(n.tipo)}
              </span>

              <div style={{ flex: 1 }}>
                {renderMensaje(n)}
                <p style={{
                  marginTop: 6,
                  fontSize: "0.8rem",
                  opacity: 0.6
                }}>
                  {n.fecha?.toDate().toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
