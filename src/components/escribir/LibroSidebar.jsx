import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth } from "../../firebase/auth";
import "../../styles/Sidebar.css";

export default function LibroSidebar({ onSelect }) {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "libros"),
      where("autorId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLibros(data);
    });

    return () => unsub();
  }, []);

  return (
    <div className="sidebar-libro">
      <h3 className="sidebar-title">Mis libros</h3>

      {libros.length === 0 && (
        <p className="sidebar-sin-libros">Aún no tienes libros creados.</p>
      )}

      <div className="sidebar-lista">
        {libros.map((libro) => (
          <div
            key={libro.id}
            className="sidebar-card"
            onClick={() => onSelect(libro.id)}
          >
            {libro.portada && (
              <img className="sidebar-portada" src={libro.portada} alt="portada" />
            )}
            <div className="sidebar-info">
              <h4 className="sidebar-titulo">{libro.titulo}</h4>
              <div className="sidebar-estados">
                <span className={`sidebar-estado ${libro.estado}`}>
                  {libro.estado === "borrador" ? "Borrador" : "Publicado"}
                </span>
                <span className={`sidebar-progreso ${libro.estadoProgreso}`}>
                  {libro.estadoProgreso === "en_proceso" ? "En proceso" : "Terminado"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
