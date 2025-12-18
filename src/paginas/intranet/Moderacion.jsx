// src/paginas/moderacion/Moderacion.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/Moderacion.css";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../firebase/config";


import { db } from "../../firebase/config";
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { usePresence } from "../../context/PresenceContext";

const FILAS_POR_PAGINA = 6;



const IconModeracion = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="intranet-sidebar-icon"
  >
    <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
  </svg>
);

const IconUsuarios = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="intranet-sidebar-icon"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);


// ===============================
// 👤 FILA DE USUARIO
// ===============================
function UsuarioRow({ u, cambiarRolUsuario, eliminarUsuario }) {
  const { listenToPresence } = usePresence();
  const [presencia, setPresencia] = useState({ estado: "offline", lastChanged: null });
  


  useEffect(() => {
    if (!u?.uid) return;

    const unsub = listenToPresence(u.uid, (data) => {
      setPresencia(data);
    });

    return () => unsub && unsub();
  }, [u.uid, listenToPresence]);

    const TIEMPO_EXPIRACION = 60 * 1000; // 1 minuto

  const estaOnline =
    presencia.estado === "online" &&
    presencia.lastChanged &&
    Date.now() - presencia.lastChanged < TIEMPO_EXPIRACION;


  return (
    <tr className={u.bloqueado ? "intranet-fila-bloqueada" : ""}>
      <td>{u.username || "—"}</td>
      <td>{u.email}</td>
      <td>{u.role}</td>
      <td>
        <span className={`intranet-estado-cuenta ${u.bloqueado ? "intranet-estado-bloqueado" : "intranet-estado-activo"}`}>
          {u.bloqueado ? "Bloqueado" : "Activo"}
        </span>
      </td>
      <td>
        <span className={`intranet-actividad ${estaOnline ? "intranet-actividad-online" : "intranet-actividad-offline"}`}>
  {estaOnline
    ? "En línea"
    : presencia.lastChanged
      ? `Offline (hace ${Math.floor((Date.now() - presencia.lastChanged)/1000)} segundos)`
      : "Offline"}
</span>



      </td>
      <td>
        <button
          className="intranet-btn-primario"
          onClick={() => cambiarRolUsuario(u.id, u.role === "user" ? "admin" : "user")}
        >
          Cambiar rol
        </button>
        <button
          className="intranet-btn-secundario"
          onClick={() => {
            if (confirm("⚠️ Esto borra TODO el usuario. ¿Seguro?")) {
              eliminarUsuario(u.id);
            }
          }}
        >
          Silenciar
        </button>
      </td>
    </tr>
  );
}

export default function Moderacion() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("moderacion");
  const [filtro, setFiltro] = useState("");
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [paginaLibros, setPaginaLibros] = useState(1);
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);

  const { user, cambiarRolUsuario, eliminarUsuario } = useAuth();
  
  const [denuncias, setDenuncias] = useState([]);
const [libroDenuncias, setLibroDenuncias] = useState(null);
const [estadoFiltro, setEstadoFiltro] = useState("todos");
const [presencias, setPresencias] = useState({});

// ===============================
// 🔧 ORDENAR LIBROS
// ===============================
const ordenarLibros = (lista) => {
  return [...lista].sort((a, b) => {
    // 1️⃣ libros con denuncias primero
    if ((a.denuncias || 0) > 0 && (b.denuncias || 0) === 0) return -1;
    if ((a.denuncias || 0) === 0 && (b.denuncias || 0) > 0) return 1;

    // 2️⃣ en revisión primero
    if (a.estado === "en revisión" && b.estado !== "en revisión") return -1;
    if (a.estado !== "en revisión" && b.estado === "en revisión") return 1;

    // 3️⃣ más denuncias arriba
    return (b.denuncias || 0) - (a.denuncias || 0);
  });
};


const denunciasPorLibro = denuncias.reduce((acc, d) => {
  acc[d.libroId] = (acc[d.libroId] || 0) + 1;
  return acc;
}, {});
const [filtroUsuarios, setFiltroUsuarios] = useState("todos");

// ===============================
// NORMALIZAR PRESENCIAS
// ===============================
useEffect(() => {
  const statusRef = ref(rtdb, "status");
  const unsub = onValue(statusRef, (snap) => {
    const data = snap.val() || {};
    // 🔧 Convertir lastChanged a ms si viene en segundos
    const normalizado = Object.fromEntries(
      Object.entries(data).map(([uid, p]) => [
        uid,
        {
          estado: p.estado,
          lastChanged:
            p.lastChanged && p.lastChanged < 1e12 ? p.lastChanged * 1000 : p.lastChanged,
        },
      ])
    );
    setPresencias(normalizado);
  });

  return () => unsub();
}, []);


  // ===============================
  // 📚 LIBROS
  // ===============================
  useEffect(() => {
    const q = query(collection(db, "libros"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setLibros(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          denuncias: doc.data().denuncias || 0,
        }))
      );
    });
  }, []);

  useEffect(() => {
  const q = query(
    collection(db, "denuncias"),
    orderBy("fecha", "desc")
  );

  return onSnapshot(q, (snap) => {
    setDenuncias(
      snap.docs.map(d => ({ id: d.id, ...d.data() }))
    );
  });
}, []);


  // ===============================
  // 👥 USUARIOS
  // ===============================
  useEffect(() => {
    const q = query(collection(db, "usuarios"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setUsuarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);


  // ===============================
  // 🔍 FILTROS
  // ===============================
const filtrarLibros = ordenarLibros(
  libros
    .map((l) => ({
      ...l,
      denuncias: denunciasPorLibro[l.id] || 0,
    }))
    .filter((l) => {
      const coincideTexto =
        l.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        (l.autorNombre || "").toLowerCase().includes(filtro.toLowerCase());

      const coincideEstado =
        estadoFiltro === "todos" || l.estado === estadoFiltro;

      return coincideTexto && coincideEstado;
    })
);




// Tiempo para considerar online
const TIEMPO_EXPIRACION = 60 * 1000; // 1 minuto

// Función que devuelve true si el usuario está online
const estaOnlineUsuario = (u) => {
  const p = presencias[u.uid];
  if (!p) return false;
  // RTDB a veces da lastChanged en segundos
  const lastChangedMs = p.lastChanged && p.lastChanged < 1e12 ? p.lastChanged * 1000 : p.lastChanged;
  return p.estado === "online" && lastChangedMs && Date.now() - lastChangedMs < TIEMPO_EXPIRACION;
};

// ===============================
// 🔍 FILTROS USUARIOS FUNCIONAL
// ===============================
const filtrarUsuarios = usuarios.filter((u) => {
  const coincideTexto =
    (u.username || "").toLowerCase().includes(filtro.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(filtro.toLowerCase());
  if (!coincideTexto) return false;

  const p = presencias[u.uid] || { estado: "offline", lastChanged: 0 };
  const estaOnline = p.estado === "online" && p.lastChanged && Date.now() - p.lastChanged < 60 * 1000;

  switch (filtroUsuarios) {
    case "admins":
      return u.role === "admin";
    case "online":
      return estaOnline;
    case "admins-online":
      return u.role === "admin" && estaOnline;
    default:
      return true; // todos
  }
});











  // ===============================
  // 📄 PAGINACIÓN
  // ===============================
  const totalPaginasLibros = Math.ceil(
    filtrarLibros.length / FILAS_POR_PAGINA
  );
  const totalPaginasUsuarios = Math.ceil(
    filtrarUsuarios.length / FILAS_POR_PAGINA
  );

  const librosPagina = filtrarLibros.slice(
    (paginaLibros - 1) * FILAS_POR_PAGINA,
    paginaLibros * FILAS_POR_PAGINA
  );

  const usuariosPagina = filtrarUsuarios.slice(
    (paginaUsuarios - 1) * FILAS_POR_PAGINA,
    paginaUsuarios * FILAS_POR_PAGINA
  );

  const handleVerDetalles = (id) => navigate(`/libro/${id}`);
  const handleMarcarRevision = async (id) =>
    updateDoc(doc(db, "libros", id), { estado: "en revisión" });
  const handleOcultarLibro = async (id) =>
    updateDoc(doc(db, "libros", id), { estado: "borrador" });

  const abrirDenunciasLibro = (libroId) => {
  setLibroDenuncias(
    denuncias.filter(d => d.libroId === libroId)
  );
};

const cerrarDenuncias = () => setLibroDenuncias(null);


  const Paginacion = ({ pagina, setPagina, total }) => (
    <div className="intranet-paginacion">
      <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
        ‹
      </button>
      {[...Array(total)].map((_, i) => (
        <button
          key={i}
          className={pagina === i + 1 ? "activo" : ""}
          onClick={() => setPagina(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={pagina === total}
        onClick={() => setPagina(pagina + 1)}
      >
        ›
      </button>
    </div>
  );

  return (
    <div className="intranet-moderacion-layout">
      <aside className="intranet-moderacion-sidebar">
        <h2>Intranet</h2>
        <ul>
         <li
  className={tab === "moderacion" ? "intranet-active" : ""}
  onClick={() => setTab("moderacion")}
>
  <IconModeracion />
  Moderación
</li>

<li
  className={tab === "usuarios" ? "intranet-active" : ""}
  onClick={() => setTab("usuarios")}
>
  <IconUsuarios />
  Usuarios
</li>

        </ul>
      </aside>

      

      <main className="intranet-moderacion-content">
        <header>
          <h2>Hola, {user?.username || "Usuario"} 👋</h2>
          <p>Panel de administración</p>
        </header>

        <div className="intranet-moderacion-filtro">
  <input
    placeholder="Filtrar por título o autor..."
    value={filtro}
    onChange={(e) => {
      setFiltro(e.target.value);
      setPaginaLibros(1);
      setPaginaUsuarios(1);
    }}
  />

  {tab === "moderacion" && (
<div className="select-minimal">
  <select
    value={estadoFiltro}
    onChange={(e) => {
      setEstadoFiltro(e.target.value);
      setPaginaLibros(1);
    }}
  >
    <option value="todos">Todos</option>
    <option value="en revisión">En revisión</option>
    <option value="publicado">Publicado</option>
    <option value="borrador">Borrador</option>
  </select>
</div>
  )}
</div>

{tab === "usuarios" && (
  <div className="select-minimal">
    <select
      value={filtroUsuarios}
      onChange={(e) => {
        setFiltroUsuarios(e.target.value);
        setPaginaUsuarios(1);
      }}
    >
      <option value="todos">Todos</option>
      <option value="admins">Admins</option>
      <option value="online">En línea</option>
      <option value="admins-online">Admins en línea</option>
    </select>
  </div>
)}


        {/* ================= MODERACIÓN (LIBROS) ================= */}
        {tab === "moderacion" && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Libro</th>
                  <th>Autor</th>
                  <th>Denuncias</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {librosPagina.map((l) => (
                 <tr
  key={l.id}
  className={`
    fila-libro
    ${l.denuncias > 0 ? `alerta-${l.estado?.replace(" ", "-")}` : ""}
  `}
>



                    <td>{l.titulo}</td>
                    <td>{l.autorNombre || "—"}</td>
                    <td>
  {l.denuncias}
  {l.denuncias > 0 && (
    <button
      className="link-denuncias"
      onClick={() => abrirDenunciasLibro(l.id)}
    >
      Ver
    </button>
  )}
</td>

                    <td>{l.estado}</td>
                    <td>
                      <button onClick={() => handleVerDetalles(l.id)}>
                        Ver
                      </button>
                      <button onClick={() => handleMarcarRevision(l.id)}>
                        Revisar
                      </button>
                      <button onClick={() => handleOcultarLibro(l.id)}>
                        Ocultar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Paginacion
              pagina={paginaLibros}
              setPagina={setPaginaLibros}
              total={totalPaginasLibros}
            />
          </>
        )}

        {/* ================= USUARIOS ================= */}
        {tab === "usuarios" && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Actividad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPagina.map((u) => (
                  <UsuarioRow
                    key={u.id}
                    u={u}
                    cambiarRolUsuario={cambiarRolUsuario}
                    eliminarUsuario={eliminarUsuario}
                  />
                ))}
              </tbody>
            </table>

            <Paginacion
              pagina={paginaUsuarios}
              setPagina={setPaginaUsuarios}
              total={totalPaginasUsuarios}
            />
          </>
        )}
      </main>

      {libroDenuncias && (
  <div className="modal-overlay">
    <div className="modal-denuncia">
      <h3>Denuncias del libro</h3>

      {libroDenuncias.map(d => (
        <div key={d.id} className="denuncia-item">
          <p><strong>Motivo:</strong> {d.motivo}</p>
          <p><strong>Estado:</strong> {d.estado}</p>
        </div>
      ))}

      <button onClick={cerrarDenuncias}>Cerrar</button>
    </div>
  </div>
)}

    </div>
  );
}