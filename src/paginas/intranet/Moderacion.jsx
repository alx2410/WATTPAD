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

export default function Moderacion() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("moderacion"); // moderacion, biblioteca, usuarios
  const [filtro, setFiltro] = useState("");
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const { 
    user, 
    cambiarRolUsuario, 
    eliminarUsuario, 
    bloquearUsuario, 
    desbloquearUsuario 
  } = useAuth();

  // 🔥 Cargar libros en tiempo real
  useEffect(() => {
    const q = query(collection(db, "libros"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        denuncias: doc.data().denuncias || 0
      }));
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
  const handleVerDetalles = (id) => navigate(`/libro/${id}`);

  const handleMarcarRevision = async (id) => {
    try {
      await updateDoc(doc(db, "libros", id), { estado: "en revisión" });
    } catch (err) {
      console.error("Error marcando en revisión:", err);
    }
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
          <li className={tab === "biblioteca" ? "active" : ""} onClick={() => setTab("biblioteca")}>📚 Biblioteca</li>
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
                  <th>Denuncias</th>
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
                          <button className="btn-primario" onClick={() => handleMarcarRevision(libro.id)}>
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

        {/* TAB BIBLIOTECA */}
        {tab === "biblioteca" && (
          <section className="biblioteca-tab">
            <h3>Gestión de Biblioteca</h3>
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Estado</th>
                  <th>Likes</th>
                  <th>Vistas</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrarLibros.map(libro => (
                  <tr key={libro.id}>
                    <td>{libro.titulo}</td>
                    <td>{libro.autorNombre}</td>
                    <td>{libro.estado}</td>
                    <td>{libro.likes || 0}</td>
                    <td>{libro.vistas || 0}</td>
                    <td>
                      <button className="btn-secundario">Cambiar estado</button>
                      <button className="btn-primario">Eliminar libro</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* TAB USUARIOS */}
        {tab === "usuarios" && (
          <section className="usuarios-tab">
            <h3>Gestión de Usuarios</h3>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrarUsuarios.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.bloqueado ? "Bloqueado" : "Activo"}</td>
                    <td>
  <button
    className="btn-secundario"
    onClick={() => {
      u.bloqueado ? desbloquearUsuario(u.id) : bloquearUsuario(u.id);
    }}
  >
    {u.bloqueado ? "Desbloquear" : "Bloquear usuario"}
  </button>

  <button
    className="btn-primario"
    onClick={() => {
      const nuevoRol = u.role === "user" ? "admin" : "user";
      cambiarRolUsuario(u.id, nuevoRol);
    }}
  >
    Cambiar rol
  </button>

  <button
    className="btn-secundario"
    onClick={() => eliminarUsuario(u.id)}
  >
    Eliminar cuenta
  </button>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}