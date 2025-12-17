// src/paginas/moderacion/Moderacion.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Moderacion.css";

// Firestore
import { 
  db 
} from "../../firebase/config";
import { 
  collection, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc 
} from "firebase/firestore";

// ===============================
// 👤 FILA DE USUARIO (TAB USUARIOS)
// ===============================
import { usePresence } from "../../context/PresenceContext";



function UsuarioRow({
  u,
  cambiarRolUsuario,
  eliminarUsuario
}) {
  const { listenToPresence } = usePresence();
  const [presencia, setPresencia] = useState({ estado: "offline" });

  useEffect(() => {
    if (!u?.id) return;
    const unsub = listenToPresence(u.id, setPresencia);
    return () => unsub && unsub();
  }, [u.id, listenToPresence]);

  const online = presencia.estado === "online";

  return (
    <tr className={u.bloqueado ? "fila-bloqueada" : ""}>
      <td>{u.username || "—"}</td>
      <td>{u.email}</td>
      <td>{u.role}</td>

<td>
  <span className={`estado-cuenta ${u.bloqueado ? "estado-bloqueado" : "estado-activo"}`}>
    {u.bloqueado ? "Bloqueado" : "Activo"}
  </span>
</td>

<td>
  <span className={`actividad ${online ? "actividad-online" : "actividad-offline"}`}>
    {online ? "En línea" : "Offline"}
  </span>
</td>


      <td>

        <button
          className="btn-primario"
          onClick={() =>
            cambiarRolUsuario(
              u.id,
              u.role === "user" ? "admin" : "user"
            )
          }
        >
          Cambiar rol
        </button>

        <button
          className="btn-secundario"
          onClick={() => {
            if (confirm("⚠️ Esto borra TODO el usuario. ¿Seguro?")) {
              eliminarUsuario(u.id);
            }
          }}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}



export default function Moderacion() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("moderacion"); // moderacion, biblioteca, usuarios
  const [filtro, setFiltro] = useState("");
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ordenDenunciasAsc, setOrdenDenunciasAsc] = useState(true);


  const { 
    user, 
    cambiarRolUsuario, 
    eliminarUsuario, 
  } = useAuth();


// 🔥 Cargar libros en tiempo real
useEffect(() => {
  const q = query(collection(db, "libros"), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => {
      const libroData = doc.data();
      return {
        id: doc.id,
        ...libroData,
        denuncias: libroData.denuncias || 0,
        usuariosDenunciaron: libroData.usuariosDenunciaron || []
      };
    });
    setLibros(data);
  });
  return unsub;
}, []);



  // 🔥 Cargar usuarios en tiempo real
  useEffect(() => {
    const q = query(collection(db, "usuarios"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(data);
    });
    return unsub;
  }, []);

  // Filtrado
  const filtrarLibros = libros.filter(libro =>
    libro.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    (libro.autorNombre || "").toLowerCase().includes(filtro.toLowerCase())
  );

  const filtrarUsuarios = usuarios.filter(u =>
    (u.username || "").toLowerCase().includes(filtro.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(filtro.toLowerCase())
  );

  // Acciones de libro
const handleMarcarRevision = async (id) => {
  try {
    await updateDoc(doc(db, "libros", id), { estado: "en revisión" });
    // Actualizar state local para que React re-renderice
    setLibros(prev =>
      prev.map(libro =>
        libro.id === id ? { ...libro, estado: "en revisión" } : libro
      )
    );
    console.log("Libro actualizado");
  } catch (err) {
    console.error("Error marcando en revisión:", err);
  }
};


const handleVerDetalles = (id) => {
  navigate(`/libro/${id}`);
};



  const handleOcultarLibro = async (id) => {
    try {
      await updateDoc(doc(db, "libros", id), { estado: "borrador" });
      setLibros(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error("Error ocultando libro:", err);
    }
  };

  return (
    <div className="moderacion-layout">
      {/* Sidebar */}
      <aside className="moderacion-sidebar">
        <h2>Intranet</h2>
        <ul>
          <li className={tab === "moderacion" ? "active" : ""} onClick={() => setTab("moderacion")}>🛡 Moderación</li>
          <li className={tab === "usuarios" ? "active" : ""} onClick={() => setTab("usuarios")}>👤 Usuarios</li>
        </ul>
      </aside>

      {/* Contenido */}
      <main className="moderacion-content">
        <header>
          <h2>Hola, {user?.username || "Usuario"} 👋</h2>
          <p>Panel de administración</p>
        </header>

        {/* Filtro */}
        <div className="moderacion-filtro">
          <input
            type="text"
            placeholder="Filtrar por nombre, libro, autor..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {/* TAB MODERACION */}
        {tab === "moderacion" && (
          <section className="moderacion-tab">
            <h3>Moderación de Contenido</h3>
<table>
  <thead>
    <tr>
      <th>Libro</th>
      <th>Autor</th>
      <th>Motivo</th>
      <th style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
  Denuncias
  <span
    onClick={() => {
      setOrdenDenunciasAsc(prev => !prev);
      setLibros(prev =>
        [...prev].sort((a, b) =>
          ordenDenunciasAsc ? a.denuncias - b.denuncias : b.denuncias - a.denuncias
        )
      );
    }}
    title="Ordenar por denuncias"
    style={{ fontSize: "1.2em", userSelect: "none"}}
  >
    {ordenDenunciasAsc ? "⇧" : "⇩"}
  </span>
</th>


      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {filtrarLibros.map(libro => {
      const autor = libro.autorNombre || "Autor desconocido";
      const motivo = libro.denuncias > 0 ? "Contenido inapropiado" : "-";

      return (
        <tr key={libro.id}>
          <td>{libro.titulo}</td>
          <td>{autor}</td>
          <td>{motivo}</td>
          <td>{libro.denuncias || 0}</td>
          <td>{libro.estado}</td>
          <td>
            <button className="btn-secundario" onClick={() => handleVerDetalles(libro.id)}>
              Ver detalles
            </button>
            {libro.denuncias > 0 && (
              <button
                className="btn-primario"
                onClick={() => handleMarcarRevision(libro.id)}
                disabled={libro.estado?.toLowerCase() === "en revisión"}
              >
                Marcar "En revisión"
              </button>
            )}
            <button className="btn-secundario" onClick={() => handleOcultarLibro(libro.id)}>
              Ocultar libro
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

          </section>
        )}

       {tab === "usuarios" && (
  <section className="usuarios-tab">
    <h3>Gestión de Usuarios</h3>

    <table>
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado cuenta</th>
          <th>Actividad</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {filtrarUsuarios.map(u => (
          <UsuarioRow
            key={u.id}
            u={u}
            cambiarRolUsuario={cambiarRolUsuario}
            eliminarUsuario={eliminarUsuario}
          />
        ))}
      </tbody>
    </table>
  </section>
)}
      </main>
    </div>
  );
}